-- Migration 001: Create locations table
-- Source: sql/create_locations_table.sql

create extension if not exists "pgcrypto";

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'mapbox',
  place_id text not null,
  label text not null,
  city text null,
  region text null,
  country text null,
  lat double precision null,
  lng double precision null,
  created_at timestamptz not null default now()
);

create unique index if not exists locations_provider_place_id_key
  on public.locations(provider, place_id);

create index if not exists locations_city_idx on public.locations(city);
create index if not exists locations_region_idx on public.locations(region);

alter table public.locations enable row level security;

drop policy if exists "locations_select_public" on public.locations;
create policy "locations_select_public"
on public.locations for select
to public
using (true);

drop policy if exists "locations_insert_authenticated" on public.locations;
create policy "locations_insert_authenticated"
on public.locations for insert
to authenticated
with check (true);

drop policy if exists "locations_update_none" on public.locations;
create policy "locations_update_none"
on public.locations for update
to authenticated
using (false);

drop policy if exists "locations_delete_none" on public.locations;
create policy "locations_delete_none"
on public.locations for delete
to authenticated
using (false);
