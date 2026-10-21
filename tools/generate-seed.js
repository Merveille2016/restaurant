// Generates supabase/seed.sql from the frontend data files, so the database
// always mirrors what the site displays.
//
//   node tools/generate-seed.js     → writes supabase/seed.sql
//   supabase db reset               → applies migrations + seed locally
//
// The frontend data (src/data/*.js) stays the source of truth until the site
// is wired to read from Supabase.

import { writeFileSync } from "node:fs";
import { CATEGORIES, dishes, dailySpecials, drinks } from "../src/data/menu.js";
import { testimonials } from "../src/data/testimonials.js";
import { glossary } from "../src/data/glossary.js";
import { SITE } from "../src/data/site.js";

// Local-development administrator, created in auth.users by the seed.
// The password is NOT a real credential: set SUPABASE_ADMIN_PASSWORD to
// choose your own local password, otherwise this obvious dev-only default
// is used. Never reuse it on a hosted project.
const ADMIN_EMAIL = "admin@mialinegiftedhands.com";
const ADMIN_PASSWORD = process.env.SUPABASE_ADMIN_PASSWORD ?? "dev-admin-password";

// Bilingual labels for the category slugs (from src/translations.js).
const CATEGORY_LABELS = {
  breakfast: { fr: "Petit-déjeuner", en: "Breakfast" },
  traditional: { fr: "Plats traditionnels", en: "Traditional dishes" },
  popular: { fr: "Plats populaires", en: "Popular dishes" },
};

const sql = (value) =>
  value === null || value === undefined ? "null" : `'${String(value).replace(/'/g, "''")}'`;
const sqlBool = (value) => (value ? "true" : "false");
const sqlArray = (values) => `array[${(values ?? []).map((v) => sql(v)).join(", ")}]::text[]`;
const isConfirmed = (item) => item.confirmed !== false;

const lines = [];
const emit = (...chunks) => lines.push(...chunks);

emit(
  "-- Mialine Gifted Hands — seed data",
  "-- GENERATED FILE — do not edit by hand.",
  "-- Regenerate with: node tools/generate-seed.js",
  "-- Source of truth: src/data/menu.js, site.js, testimonials.js, glossary.js",
  "",
  "begin;",
  ""
);

// ── Categories ───────────────────────────────────────────────────────────
emit("-- Categories");
for (const [index, slug] of CATEGORIES.entries()) {
  const label = CATEGORY_LABELS[slug] ?? { fr: slug, en: slug };
  emit(
    `insert into public.categories (slug, name_fr, name_en, sort_order) values (${sql(slug)}, ${sql(label.fr)}, ${sql(label.en)}, ${index}) on conflict (slug) do nothing;`
  );
}
emit("");

// ── Dishes ──────────────────────────────────────────────────────────────
emit("-- Dishes (confirmed: false = suggestion not shown on the site)");
for (const [index, dish] of dishes.entries()) {
  emit(
    "insert into public.dishes (slug, category, price_fcfa, spicy, veg, confirmed, allergens, region_fr, region_en, name_fr, name_en, desc_fr, desc_en, image, sort_order) values (",
    `  ${sql(dish.id)}, ${sql(dish.category)}, ${dish.price}, ${sqlBool(dish.spicy)}, ${sqlBool(dish.veg)}, ${sqlBool(isConfirmed(dish))},`,
    `  ${sqlArray(dish.allergens)}, ${sql(dish.region?.fr ?? null)}, ${sql(dish.region?.en ?? null)},`,
    `  ${sql(dish.name.fr)}, ${sql(dish.name.en)}, ${sql(dish.desc.fr)}, ${sql(dish.desc.en)},`,
    `  ${sql(dish.image ?? null)}, ${index}`,
    ") on conflict (slug) do nothing;"
  );
}
emit("");

// ── Drinks ──────────────────────────────────────────────────────────────
emit("-- Drinks");
for (const [index, drink] of drinks.entries()) {
  emit(
    "insert into public.drinks (slug, name_fr, name_en, price_fcfa, image, sort_order) values (",
    `  ${sql(drink.id)}, ${sql(drink.name.fr)}, ${sql(drink.name.en)}, ${drink.price}, ${sql(drink.image)}, ${index}`,
    ") on conflict (slug) do nothing;"
  );
}
emit("");

// ── Daily specials ──────────────────────────────────────────────────────
emit("-- Daily specials (day 0 = Monday)");
for (const special of dailySpecials) {
  emit(
    "insert into public.daily_specials (day_of_week, meals_fr, meals_en, image) values (",
    `  ${special.day}, ${sqlArray(special.meals.fr)}, ${sqlArray(special.meals.en)}, ${sql(special.image)}`,
    ") on conflict (day_of_week) do nothing;"
  );
}
emit("");

// ── Glossary ────────────────────────────────────────────────────────────
emit("-- Glossary");
for (const [index, term] of glossary.entries()) {
  emit(
    `insert into public.glossary_terms (term, definition_fr, definition_en, sort_order) values (${sql(term.term)}, ${sql(term.fr)}, ${sql(term.en)}, ${index}) on conflict (term) do nothing;`
  );
}
emit("");

// ── Testimonials ────────────────────────────────────────────────────────
emit("-- Testimonials (confirmed: false = not shown on the site)");
for (const [index, testimonial] of testimonials.entries()) {
  emit(
    "insert into public.testimonials (author, text_fr, text_en, confirmed, sort_order) values (",
    `  ${sql(testimonial.author)}, ${sql(testimonial.text.fr)}, ${sql(testimonial.text.en)}, ${sqlBool(isConfirmed(testimonial))}, ${index}`,
    ");"
  );
}
emit("");

// ── Site settings (singleton) ───────────────────────────────────────────
emit("-- Site settings");
emit(
  "insert into public.site_settings (id, site_name, site_url, city, country_fr, country_en, map_query, whatsapp_numbers, opening_hour, closing_hour, timezone, specials_sheet_csv_url, offers_confirmed, delivery_confirmed, delivery_time_fr, delivery_time_en, delivery_payments, cook_confirmed, cook_name, cook_image, cook_story_fr, cook_story_en) values (",
  `  1, ${sql(SITE.name)}, ${sql(SITE.url)}, ${sql(SITE.city)}, ${sql(SITE.country.fr)}, ${sql(SITE.country.en)},`,
  `  ${sql(SITE.mapQuery)}, ${sql(JSON.stringify(SITE.whatsapp))}::jsonb, ${SITE.hours.opens}, ${SITE.hours.closes},`,
  `  ${sql(SITE.hours.timeZone)}, ${sql(SITE.specialsSheetCsvUrl ?? "")}, ${sqlBool(SITE.offersConfirmed)},`,
  `  ${sqlBool(SITE.delivery.confirmed)}, ${sql(SITE.delivery.time.fr)}, ${sql(SITE.delivery.time.en)},`,
  `  ${sqlArray(SITE.delivery.payments)}, ${sqlBool(SITE.cook.confirmed)}, ${sql(SITE.cook.name)},`,
  `  ${sql(SITE.cook.image ?? "")}, ${sql(SITE.cook.story.fr)}, ${sql(SITE.cook.story.en)}`,
  ") on conflict (id) do nothing;"
);
emit("");

// ── Delivery zones ───────────────────────────────────────────────────────
emit("-- Delivery zones");
for (const [index, zone] of SITE.delivery.zones.entries()) {
  emit(
    "insert into public.delivery_zones (name_fr, name_en, fee_fcfa, sort_order) values (",
    `  ${sql(zone.name)}, ${sql(zone.name)}, ${zone.fee}, ${index}`,
    ");"
  );
}
emit("");

// ── Admin user ──────────────────────────────────────────────────────────
emit(
  `-- Local-development administrator: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`,
  "-- (created directly in auth.users; the on_auth_user_created trigger",
  "--  adds the profile, which is then promoted to role = admin)",
  "insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, confirmation_token, recovery_token, email_change_token_new, email_change, phone, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_anonymous)",
  "values (",
  "  '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',",
  `  ${sql(ADMIN_EMAIL)}, extensions.crypt(${sql(ADMIN_PASSWORD)}, extensions.gen_salt('bf')), now(), '', '', '', '', '',`,
  "  '{\"provider\":\"email\",\"providers\":[\"email\"]}'::jsonb, '{}'::jsonb, now(), now(), false",
  ") on conflict do nothing;",
  "",
  "insert into auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at)",
  "select gen_random_uuid(), u.id, jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true), 'email', u.id::text, now(), now()",
  `  from auth.users u where u.email = ${sql(ADMIN_EMAIL)}`,
  "  and not exists (select 1 from auth.identities i where i.user_id = u.id and i.provider = 'email');",
  "",
  `update public.profiles set role = 'admin' where email = ${sql(ADMIN_EMAIL)};`,
  "",
  "commit;",
  ""
);

const target = new URL("../supabase/seed.sql", import.meta.url);
writeFileSync(target, lines.join("\n"), "utf8");
console.log(`Wrote ${target.pathname.replace(/\//g, "\\").replace(/^\\?/, "")}`);
console.log(`  ${CATEGORIES.length} categories, ${dishes.length} dishes, ${drinks.length} drinks,`);
console.log(`  ${dailySpecials.length} daily specials, ${glossary.length} glossary terms, ${testimonials.length} testimonials.`);
