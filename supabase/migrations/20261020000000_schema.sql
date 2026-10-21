-- Mialine Gifted Hands — backend schema
-- Bilingual (FR/EN) tables modelling the restaurant platform.

-- ── Menu ────────────────────────────────────────────────────────────────

create table public.categories (
  slug        text primary key check (slug ~ '^[a-z0-9-]+$'),
  name_fr     text not null,
  name_en     text not null,
  sort_order  integer not null default 0
);

create table public.dishes (
  slug        text primary key check (slug ~ '^[a-z0-9-]+$'),
  category    text not null references public.categories (slug) on update cascade on delete restrict,
  price_fcfa  integer not null check (price_fcfa >= 0),
  spicy       boolean not null default false,
  veg         boolean not null default false,
  confirmed   boolean not null default false,
  allergens   text[] not null default '{}',
  region_fr   text,
  region_en   text,
  name_fr     text not null,
  name_en     text not null,
  desc_fr     text not null,
  desc_en     text not null,
  image       text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index dishes_category_idx on public.dishes (category, sort_order);

create table public.drinks (
  slug        text primary key check (slug ~ '^[a-z0-9-]+$'),
  name_fr     text not null,
  name_en     text not null,
  price_fcfa  integer not null check (price_fcfa >= 0),
  image       text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- One row per weekday. day_of_week 0 = Monday, matching the frontend
-- convention in src/data/daily-specials.js.
create table public.daily_specials (
  day_of_week smallint primary key check (day_of_week between 0 and 6),
  meals_fr    text[] not null,
  meals_en    text[] not null,
  image       text
);

-- "Lexique" shown on the Menu page.
create table public.glossary_terms (
  term          text primary key,
  definition_fr text not null,
  definition_en text not null,
  sort_order    integer not null default 0
);

-- Customer reviews for the home page. Only confirmed rows are public.
create table public.testimonials (
  id          uuid primary key default gen_random_uuid(),
  author      text not null,
  text_fr     text not null,
  text_en     text not null,
  confirmed   boolean not null default false,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Settings & delivery ─────────────────────────────────────────────────

-- Singleton row (id = 1) mirroring src/data/site.js.
create table public.site_settings (
  id                       integer primary key default 1 check (id = 1),
  site_name                text not null,
  site_url                 text not null,
  city                     text not null,
  country_fr               text not null,
  country_en               text not null,
  map_query                text not null,
  whatsapp_numbers         jsonb not null default '[]'::jsonb,
  opening_hour             smallint not null default 7 check (opening_hour between 0 and 23),
  closing_hour             smallint not null default 23 check (closing_hour between 0 and 23),
  timezone                 text not null default 'Africa/Douala',
  specials_sheet_csv_url   text not null default '',
  offers_confirmed         boolean not null default false,
  delivery_confirmed       boolean not null default false,
  delivery_time_fr         text not null default '',
  delivery_time_en         text not null default '',
  delivery_payments        text[] not null default '{}',
  cook_confirmed           boolean not null default false,
  cook_name                text not null default '',
  cook_image               text not null default '',
  cook_story_fr            text not null default '',
  cook_story_en            text not null default '',
  updated_at               timestamptz not null default now()
);

create table public.delivery_zones (
  id          uuid primary key default gen_random_uuid(),
  name_fr     text not null,
  name_en     text not null,
  fee_fcfa    integer not null default 0 check (fee_fcfa >= 0),
  sort_order  integer not null default 0
);

-- ── Orders (contact-form submissions) ────────────────────────────────────

create table public.orders (
  id            uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone         text not null,
  order_text    text not null,
  location      text not null,
  status        text not null default 'new'
                check (status in ('new', 'contacted', 'delivered', 'cancelled')),
  source        text not null default 'site'
                check (source in ('site', 'whatsapp', 'phone')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index orders_status_created_idx on public.orders (status, created_at desc);

-- ── Admin profiles ──────────────────────────────────────────────────────

-- Links auth.users to a management role. role is checked by RLS policies
-- through public.is_admin().
create table public.profiles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  role       text not null default 'viewer'
             check (role in ('admin', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
