-- Migration 010: Add featured_until to profiles and listings
-- Source: sql/add_featured_until.sql + sql/add_listing_featured_until.sql

alter table public.profiles
add column if not exists featured_until timestamptz;

alter table public.listings
add column if not exists featured_until timestamptz;

-- Indexes for featured sorting queries
create index if not exists profiles_featured_until_idx on public.profiles(featured_until desc)
  where featured_until is not null;

create index if not exists listings_featured_until_idx on public.listings(featured_until desc)
  where featured_until is not null;
