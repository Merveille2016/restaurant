-- Mialine Gifted Hands — grants and row level security.
--
-- Model:
--   * anon / authenticated can READ public content (menu, drinks, specials,
--     glossary, confirmed testimonials, settings, delivery zones);
--   * anonymous writes go ONLY through public.place_order() — there is no
--     direct insert grant on public.orders;
--   * admin & editor profiles (public.is_admin()) manage all content;
--   * the service_role key bypasses RLS as usual.

-- ── Grants (new tables are not auto-exposed by the API) ──────────────────

grant select on public.categories, public.dishes, public.drinks, public.daily_specials,
  public.glossary_terms, public.testimonials, public.site_settings, public.delivery_zones
  to anon, authenticated;

grant select on public.v_public_menu, public.v_today_specials
  to anon, authenticated;

-- Content management (gated by RLS through is_admin()).
grant insert, update, delete on
  public.categories, public.dishes, public.drinks, public.daily_specials,
  public.glossary_terms, public.testimonials, public.site_settings,
  public.delivery_zones
  to authenticated;

-- Orders: readable and manageable only by signed-in admins (plus service_role).
grant select, update, delete on public.orders to authenticated;

-- Profiles: a signed-in user can read their own row.
grant select on public.profiles to authenticated;

-- ── Row level security ──────────────────────────────────────────────────

alter table public.categories      enable row level security;
alter table public.dishes         enable row level security;
alter table public.drinks         enable row level security;
alter table public.daily_specials enable row level security;
alter table public.glossary_terms enable row level security;
alter table public.testimonials    enable row level security;
alter table public.site_settings   enable row level security;
alter table public.delivery_zones  enable row level security;
alter table public.orders          enable row level security;
alter table public.profiles        enable row level security;

-- categories — public read, admin write
create policy categories_public_read on public.categories
  for select to anon, authenticated using (true);
create policy categories_admin_write on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- dishes — public sees confirmed & active only; admin sees and edits all
create policy dishes_public_read on public.dishes
  for select to anon, authenticated
  using ((confirmed and is_active) or public.is_admin());
create policy dishes_admin_write on public.dishes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- drinks — public read, admin write
create policy drinks_public_read on public.drinks
  for select to anon, authenticated using (true);
create policy drinks_admin_write on public.drinks
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- daily_specials — public read, admin write
create policy daily_specials_public_read on public.daily_specials
  for select to anon, authenticated using (true);
create policy daily_specials_admin_write on public.daily_specials
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- glossary_terms — public read, admin write
create policy glossary_public_read on public.glossary_terms
  for select to anon, authenticated using (true);
create policy glossary_admin_write on public.glossary_terms
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- testimonials — public sees confirmed only; admin manages all
create policy testimonials_public_read on public.testimonials
  for select to anon, authenticated
  using (confirmed or public.is_admin());
create policy testimonials_admin_write on public.testimonials
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- site_settings — public read, admin update (no inserts/deletes: singleton)
create policy settings_public_read on public.site_settings
  for select to anon, authenticated using (true);
create policy settings_admin_update on public.site_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- delivery_zones — public read, admin write
create policy delivery_zones_public_read on public.delivery_zones
  for select to anon, authenticated using (true);
create policy delivery_zones_admin_write on public.delivery_zones
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- orders — no anon policy at all: inserts happen exclusively through the
-- security-definer RPC public.place_order(); reads/updates are admin-only.
create policy orders_admin_read on public.orders
  for select to authenticated using (public.is_admin());
create policy orders_admin_update on public.orders
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy orders_admin_delete on public.orders
  for delete to authenticated using (public.is_admin());

-- profiles — users read their own row; admins read all
create policy profiles_self_read on public.profiles
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
