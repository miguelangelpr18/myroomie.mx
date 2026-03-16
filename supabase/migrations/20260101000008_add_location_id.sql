-- Migration 008: Add location_id to listings and profiles
-- Source: sql/add_location_id_to_listings.sql + sql/add_location_id_to_profiles.sql

-- Add location_id to listings
alter table public.listings
add column if not exists location_id uuid null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'listings_location_id_fkey'
  ) then
    alter table public.listings
    add constraint listings_location_id_fkey
    foreign key (location_id)
    references public.locations (id) on delete set null;
  end if;
end $$;

create index if not exists listings_location_id_idx on public.listings(location_id);

-- Add location_id to profiles
alter table public.profiles
add column if not exists location_id uuid null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_location_id_fkey'
  ) then
    alter table public.profiles
    add constraint profiles_location_id_fkey
    foreign key (location_id)
    references public.locations (id) on delete set null;
  end if;
end $$;

create index if not exists profiles_location_id_idx on public.profiles(location_id);
