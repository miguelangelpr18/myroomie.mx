-- Migration 013: Add age column (missing from production) with correct constraint (18-99)

alter table public.profiles
add column if not exists age smallint check (age between 18 and 99);
