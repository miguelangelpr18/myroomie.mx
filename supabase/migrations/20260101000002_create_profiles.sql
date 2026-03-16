-- Migration 002: Create profiles table
-- Source: sql/create_profiles_table.sql

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  city text not null,
  zone text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
on public.profiles for select
using (true);

create policy "Users can insert their own profile"
on public.profiles for insert
with check (auth.uid() = user_id);

create policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own profile"
on public.profiles for delete
using (auth.uid() = user_id);

create trigger set_updated_at
before update on public.profiles
for each row
execute function public.handle_updated_at();

create index if not exists profiles_city_idx on public.profiles(city);
create index if not exists profiles_zone_idx on public.profiles(zone);
create index if not exists profiles_city_zone_idx on public.profiles(city, zone);
