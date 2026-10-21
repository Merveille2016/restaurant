-- Mialine Gifted Hands — order-flow hardening + policy fixes.
--
-- 1. place_order(): length caps and a basic anti-spam guard (max 3 orders per
--    phone number per 10 minutes). This RPC is the only anonymous write path,
--    so it must not accept unbounded input or unbounded request rates.
-- 2. drinks: the public read policy exposed inactive rows (is_active = false);
--    it now matches the dishes policy.
-- 3. Views: force security_invoker so they run with the caller's privileges
--    and respect table RLS (defense in depth — the WHERE clauses already
--    filter, and the anon/authenticated roles hold the needed SELECT grants).

-- ── 1. place_order: caps + anti-spam ────────────────────────────────────

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
  new_id       uuid;
  digits       text;
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

  if order_text is null or length(btrim(order_text)) not between 2 and 2000 then
    raise exception 'La commande doit contenir entre 2 et 2000 caractères';
  end if;

  if location is null or length(btrim(location)) not between 2 and 200 then
    raise exception 'Le lieu de livraison doit contenir entre 2 et 200 caractères';
  end if;

  -- Anti-spam : 3 commandes maximum par numéro sur les 10 dernières minutes.
  -- Les numéros sont comparés en chiffres normalisés (espaces, points,
  -- tirets et + initial ignorés) pour que le format ne contourne pas la limite.
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

  insert into public.orders (customer_name, phone, order_text, location)
  values (btrim(customer_name), btrim(phone), btrim(order_text), btrim(location))
  returning id into new_id;

  return new_id;
end;
$$;

revoke all on function public.place_order(text, text, text, text) from public;
grant execute on function public.place_order(text, text, text, text) to anon, authenticated;

-- ── 2. drinks: hide inactive rows from the public ────────────────────────

drop policy if exists drinks_public_read on public.drinks;
create policy drinks_public_read on public.drinks
  for select to anon, authenticated
  using (is_active or public.is_admin());

-- ── 3. views: run with the caller's privileges ───────────────────────────

alter view public.v_public_menu set (security_invoker = true);
alter view public.v_today_specials set (security_invoker = true);
