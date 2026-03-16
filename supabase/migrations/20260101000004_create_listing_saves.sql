-- Migration 004: Create listing_saves table
-- Source: sql/create_listing_saves_table.sql

create table if not exists public.listing_saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, listing_id)
);

alter table public.listing_saves enable row level security;

create policy "Users can view their own saves"
on public.listing_saves for select
using (auth.uid() = user_id);

create policy "Users can insert their own saves"
on public.listing_saves for insert
with check (auth.uid() = user_id);

create policy "Users can delete their own saves"
on public.listing_saves for delete
using (auth.uid() = user_id);

create index if not exists listing_saves_user_id_idx on public.listing_saves(user_id);
create index if not exists listing_saves_listing_id_idx on public.listing_saves(listing_id);
