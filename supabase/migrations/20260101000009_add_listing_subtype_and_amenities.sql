-- Migration 009: Add listing_subtype, lifestyle_prefs, amenities, budget columns
-- Source: sql/add_listing_subtype_and_lifestyle_prefs.sql

alter table public.listings
add column if not exists listing_subtype text
  check (listing_subtype in ('solo_renta', 'buscar_roomie'));

comment on column public.listings.listing_subtype is
  'Subtipo del anuncio: solo_renta (enfoque en propiedad) o buscar_roomie (enfoque en convivencia)';

alter table public.listings
add column if not exists lifestyle_prefs jsonb;

comment on column public.listings.lifestyle_prefs is
  'Preferencias de estilo de vida cuando listing_subtype=buscar_roomie';

create index if not exists idx_listings_subtype on public.listings(listing_subtype)
  where listing_subtype is not null;

alter table public.listings
add column if not exists amenities text[] default '{}';

comment on column public.listings.amenities is
  'Amenidades disponibles: WiFi, Parking, Pet Friendly, Furnished, etc.';

create index if not exists idx_listings_amenities on public.listings using gin(amenities);

alter table public.profiles
add column if not exists budget_min integer check (budget_min >= 0),
add column if not exists budget_max integer check (budget_max >= 0);

alter table public.profiles
add constraint if not exists check_budget_range check (
  budget_min is null or
  budget_max is null or
  budget_min <= budget_max
);

comment on column public.profiles.budget_min is 'Presupuesto mínimo mensual (MXN)';
comment on column public.profiles.budget_max is 'Presupuesto máximo mensual (MXN)';
