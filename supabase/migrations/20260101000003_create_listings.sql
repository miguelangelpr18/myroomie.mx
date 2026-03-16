-- Migration 003: Create listings table
-- No source file existed — reconstructed from squema.sql column snapshot + app code

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  city text not null,
  zone text not null,
  price_mxn integer,
  listing_type text not null check (listing_type in ('room', 'roommate')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.listings enable row level security;

create policy "Listings are viewable by everyone"
on public.listings for select
using (true);

create policy "Users can insert their own listings"
on public.listings for insert
with check (auth.uid() = user_id);

create policy "Users can update their own listings"
on public.listings for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own listings"
on public.listings for delete
using (auth.uid() = user_id);

create trigger set_listings_updated_at
before update on public.listings
for each row
execute function public.handle_updated_at();

create index if not exists listings_user_id_idx on public.listings(user_id);
create index if not exists listings_city_idx on public.listings(city);
create index if not exists listings_listing_type_idx on public.listings(listing_type);
create index if not exists listings_created_at_idx on public.listings(created_at desc);
