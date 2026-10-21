-- Mialine Gifted Hands — functions, triggers and views.

-- ── updated_at maintenance ──────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger dishes_updated_at      before update on public.dishes        for each row execute function public.set_updated_at();
create trigger drinks_updated_at      before update on public.drinks       for each row execute function public.set_updated_at();
create trigger testimonials_updated_at before update on public.testimonials for each row execute function public.set_updated_at();
create trigger site_settings_updated_at before update on public.site_settings for each row execute function public.set_updated_at();
create trigger orders_updated_at       before update on public.orders       for each row execute function public.set_updated_at();
create trigger profiles_updated_at     before update on public.profiles    for each row execute function public.set_updated_at();

-- ── place_order: the only anonymous write path ───────────────────────────
-- Validates the contact-form submission (mirroring the frontend rules in
-- src/pages/Contact.jsx) and inserts it into public.orders. SECURITY DEFINER
-- is required because anonymous callers have no direct insert grant on
-- public.orders.

create or replace function public.place_order(
  customer_name text,
  phone         text,
  order_text    text,
  location      text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
  digits text;
begin
  if customer_name is null or length(btrim(customer_name)) < 2 then
    raise exception 'Le nom doit contenir au moins 2 caractères';
  end if;

  digits := regexp_replace(coalesce(btrim(phone), ''), '[\s.-]', '', 'g');
  digits := regexp_replace(digits, '^\+', '');
  if digits !~ '^\d{8,15}$' then
    raise exception 'Numéro de téléphone invalide';
  end if;

  if order_text is null or length(btrim(order_text)) < 2 then
    raise exception 'La commande doit contenir au moins 2 caractères';
  end if;

  if location is null or length(btrim(location)) < 2 then
    raise exception 'Le lieu de livraison doit contenir au moins 2 caractères';
  end if;

  insert into public.orders (customer_name, phone, order_text, location)
  values (btrim(customer_name), btrim(phone), btrim(order_text), btrim(location))
  returning id into new_id;

  return new_id;
end;
$$;

revoke all on function public.place_order(text, text, text, text) from public;
grant execute on function public.place_order(text, text, text, text) to anon, authenticated;

-- ── handle_new_user: auto-create a profile on signup ─────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, role)
  values (new.id, new.email, 'viewer')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── is_admin: role check used by RLS policies ───────────────────────────

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where user_id = auth.uid()
      and role in ('admin', 'editor')
  );
$$;

-- ── Views ───────────────────────────────────────────────────────────────

-- The public menu: only dishes confirmed by the kitchen and still active.
create or replace view public.v_public_menu as
select
  slug, category, price_fcfa, spicy, veg, allergens,
  region_fr, region_en, name_fr, name_en, desc_fr, desc_en,
  image, sort_order
from public.dishes
where confirmed and is_active;

-- Today's daily special, in the restaurant's timezone.
-- Frontend day 0 = Monday; Postgres dow 0 = Sunday, hence the +6 % 7 shift.
create or replace view public.v_today_specials as
select day_of_week, meals_fr, meals_en, image
from public.daily_specials
where day_of_week = ((extract(dow from (now() at time zone 'Africa/Douala'))::int + 6) % 7);
