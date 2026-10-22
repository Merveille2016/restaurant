-- Mialine Gifted Hands — online ordering, payments & delivery management.
--
-- Extends the WhatsApp-era schema with:
--   * public.drivers        — delivery riders, managed from the back-office;
--   * public.order_items    — structured cart lines with price snapshots;
--   * public.orders         — delivery zone, fees, totals, payment method &
--                             status, provider references, assigned driver;
--   * public.place_online_order() — the only anonymous write path for the
--     online checkout. Totals are computed SERVER-SIDE from the menu tables,
--     never from amounts sent by the browser;
--   * public.get_order_public() — capability-style read (order UUID) letting
--     the customer poll their order's payment/delivery status.

-- ── Drivers ──────────────────────────────────────────────────────────────

create table public.drivers (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (length(btrim(name)) between 2 and 120),
  phone      text not null,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger drivers_updated_at before update on public.drivers
  for each row execute function public.set_updated_at();

-- ── Orders: new columns & wider status values ────────────────────────────

alter table public.orders
  add column if not exists delivery_zone_id  uuid references public.delivery_zones (id) on delete set null,
  add column if not exists zone_name_fr     text,
  add column if not exists zone_name_en     text,
  add column if not exists subtotal_fcfa     integer,
  add column if not exists delivery_fee_fcfa integer,
  add column if not exists total_fcfa        integer,
  add column if not exists payment_method    text not null default 'cash'
    check (payment_method in ('cash', 'mtn', 'orange')),
  add column if not exists payment_status    text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed')),
  add column if not exists payment_ref       text,
  add column if not exists payment_token     text,
  add column if not exists notif_token       text,
  add column if not exists driver_id         uuid references public.drivers (id) on delete set null,
  add column if not exists note              text check (note is null or length(note) <= 500);

-- Widen the status workflow: new → confirmed → preparing → delivering →
-- delivered (plus cancelled). 'contacted' is kept for the WhatsApp flow.
alter table public.orders drop constraint orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('new', 'contacted', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled'));

-- The legacy 'source' column distinguishes the WhatsApp form from the
-- online checkout.
alter table public.orders drop constraint orders_source_check;
alter table public.orders add constraint orders_source_check
  check (source in ('site', 'whatsapp', 'phone', 'online'));

create index if not exists orders_driver_idx on public.orders (driver_id) where driver_id is not null;
create index if not exists orders_payment_idx on public.orders (payment_status, created_at desc);

-- ── Order items ──────────────────────────────────────────────────────────

create table public.order_items (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.orders (id) on delete cascade,
  item_type       text not null check (item_type in ('dish', 'drink')),
  slug            text not null,
  name_fr         text not null,
  name_en         text not null,
  unit_price_fcfa integer not null check (unit_price_fcfa >= 0),
  qty             integer not null check (qty between 1 and 99),
  line_total_fcfa integer not null check (line_total_fcfa >= 0),
  created_at      timestamptz not null default now()
);

create index order_items_order_idx on public.order_items (order_id);

-- ── Grants & RLS for the new tables ──────────────────────────────────────

grant select on public.order_items to authenticated;
grant select, insert, update, delete on public.drivers to authenticated;

alter table public.order_items enable row level security;
alter table public.drivers enable row level security;

-- Order items are readable through the admin dashboard only (the anonymous
-- path is get_order_public(), which exposes no item data).
create policy order_items_admin_read on public.order_items
  for select to authenticated using (public.is_admin());

-- Drivers carry personal phone numbers: admin-only.
create policy drivers_admin_all on public.drivers
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ── place_online_order: anonymous checkout write path ────────────────────
-- Mirrors place_order()'s validation style, but works on structured items.
-- The browser only sends slugs + quantities; prices, fees and totals are
-- read from the menu tables so a tampered client cannot change the amount.

create or replace function public.place_online_order(
  customer_name    text,
  phone            text,
  items            jsonb,
  delivery_zone_id uuid,
  location         text,
  note             text,
  payment_method   text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  digits       text;
  new_id       uuid;
  entry        jsonb;
  dish_row     public.dishes%rowtype;
  drink_row    public.drinks%rowtype;
  zone_row     public.delivery_zones%rowtype;
  subtotal     integer := 0;
  fee          integer := 0;
  total        integer;
  lines        text[] := '{}';
  item_name_fr text;
  item_name_en text;
  unit_price   integer;
  qty          integer;
  recent_count integer;
begin
  if customer_name is null or length(btrim(customer_name)) not between 2 and 120 then
    raise exception 'Le nom doit contenir entre 2 et 120 caractères';
  end if;

  digits := regexp_replace(coalesce(btrim(phone), ''), '[\s.-]', '', 'g');
  digits := regexp_replace(digits, '^\+', '');
  if digits !~ '^\d{8,15}$' then
    raise exception 'Numéro de téléphone invalide';
  end if;

  if location is null or length(btrim(location)) not between 2 and 200 then
    raise exception 'Le lieu de livraison doit contenir entre 2 et 200 caractères';
  end if;

  if note is not null and length(note) > 500 then
    raise exception 'La note est trop longue (500 caractères maximum)';
  end if;

  if payment_method is null or payment_method not in ('cash', 'mtn', 'orange') then
    raise exception 'Méthode de paiement invalide';
  end if;

  if items is null or jsonb_typeof(items) <> 'array' then
    raise exception 'Commande invalide';
  end if;

  if jsonb_array_length(items) < 1 or jsonb_array_length(items) > 50 then
    raise exception 'La commande doit contenir entre 1 et 50 lignes';
  end if;

  -- Anti-spam: same rule as place_order().
  select count(*) into recent_count
  from public.orders o
  where regexp_replace(
          regexp_replace(o.phone, '[\s.-]', '', 'g'),
          '^\+', '', ''
        ) = digits
    and o.created_at > now() - interval '10 minutes';
  if recent_count >= 3 then
    raise exception 'Trop de commandes pour ce numéro. Réessayez dans quelques minutes.';
  end if;

  select * into zone_row from public.delivery_zones where id = delivery_zone_id;
  if not found then
    raise exception 'Zone de livraison inconnue';
  end if;
  fee := zone_row.fee_fcfa;

  -- Validate every line and compute the authoritative total from DB prices.
  for entry in select * from jsonb_array_elements(items) loop
    qty := nullif(entry->>'qty', '')::int;
    if entry->>'type' is null or entry->>'slug' is null
       or qty is null or qty < 1 or qty > 99 then
      raise exception 'Ligne de commande invalide';
    end if;

    if entry->>'type' = 'dish' then
      select * into dish_row from public.dishes
        where slug = entry->>'slug' and confirmed and is_active;
      if not found then
        raise exception 'Plat inconnu ou indisponible : %', entry->>'slug';
      end if;
      item_name_fr := dish_row.name_fr;
      item_name_en := dish_row.name_en;
      unit_price := dish_row.price_fcfa;
    elsif entry->>'type' = 'drink' then
      select * into drink_row from public.drinks
        where slug = entry->>'slug' and is_active;
      if not found then
        raise exception 'Boisson inconnue ou indisponible : %', entry->>'slug';
      end if;
      item_name_fr := drink_row.name_fr;
      item_name_en := drink_row.name_en;
      unit_price := drink_row.price_fcfa;
    else
      raise exception 'Type d''article invalide';
    end if;

    subtotal := subtotal + unit_price * qty;
    lines := lines || array[format('%s × %s', qty, item_name_fr)];
  end loop;

  total := subtotal + fee;

  insert into public.orders (
    customer_name, phone, order_text, location, status, source,
    delivery_zone_id, zone_name_fr, zone_name_en,
    subtotal_fcfa, delivery_fee_fcfa, total_fcfa,
    payment_method, payment_status, note
  ) values (
    btrim(customer_name), btrim(phone), array_to_string(lines, ' ; '), btrim(location),
    'new', 'online',
    delivery_zone_id, zone_row.name_fr, zone_row.name_en,
    subtotal, fee, total,
    payment_method, 'pending', nullif(btrim(coalesce(note, '')), '')
  )
  returning id into new_id;

  -- Second pass: persist the validated lines with their price snapshots.
  for entry in select * from jsonb_array_elements(items) loop
    qty := nullif(entry->>'qty', '')::int;
    if entry->>'type' = 'dish' then
      select d.name_fr, d.name_en, d.price_fcfa into item_name_fr, item_name_en, unit_price
        from public.dishes d where d.slug = entry->>'slug';
    else
      select r.name_fr, r.name_en, r.price_fcfa into item_name_fr, item_name_en, unit_price
        from public.drinks r where r.slug = entry->>'slug';
    end if;

    insert into public.order_items
      (order_id, item_type, slug, name_fr, name_en, unit_price_fcfa, qty, line_total_fcfa)
    values
      (new_id, entry->>'type', entry->>'slug', item_name_fr, item_name_en, unit_price, qty, unit_price * qty);
  end loop;

  return jsonb_build_object(
    'order_id', new_id,
    'subtotal_fcfa', subtotal,
    'delivery_fee_fcfa', fee,
    'total_fcfa', total
  );
end;
$$;

revoke all on function public.place_online_order(text, text, jsonb, uuid, text, text, text) from public;
grant execute on function public.place_online_order(text, text, jsonb, uuid, text, text, text) to anon, authenticated;

-- ── get_order_public: customer status polling ────────────────────────────
-- The order UUID acts as an unguessable capability. Only online orders are
-- exposed, and only their workflow/payment fields — no personal data.

create or replace function public.get_order_public(p_order_id uuid)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object(
    'status', o.status,
    'payment_status', o.payment_status,
    'payment_method', o.payment_method,
    'total_fcfa', o.total_fcfa
  )
  from public.orders o
  where o.id = p_order_id
    and o.source = 'online';
$$;

revoke all on function public.get_order_public(uuid) from public;
grant execute on function public.get_order_public(uuid) to anon, authenticated;
