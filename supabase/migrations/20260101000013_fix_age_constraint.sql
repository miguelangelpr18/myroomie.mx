-- Migration 013: Fix age constraint to match app validation (18-99, not 16-99)

-- Drop the old constraint and add the corrected one
alter table public.profiles
drop constraint if exists profiles_age_check;

alter table public.profiles
add constraint profiles_age_check check (age between 18 and 99);
