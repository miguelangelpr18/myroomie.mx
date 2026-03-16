-- Migration 011: Add profile lifestyle fields (pets, smoker, cleanliness, parties, schedule, bio, age)
-- and listings is_active column — columns present in production but missing from tracked SQL files

alter table public.profiles
add column if not exists pets boolean,
add column if not exists smoker boolean,
add column if not exists cleanliness smallint check (cleanliness between 1 and 3),
add column if not exists parties boolean,
add column if not exists schedule text check (schedule in ('day', 'night')),
add column if not exists bio text,
add column if not exists age smallint check (age between 16 and 99);

create index if not exists profiles_pets_idx on public.profiles(pets) where pets is not null;
create index if not exists profiles_smoker_idx on public.profiles(smoker) where smoker is not null;

alter table public.listings
add column if not exists is_active boolean not null default true;

create index if not exists listings_is_active_idx on public.listings(is_active);
