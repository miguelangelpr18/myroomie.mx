-- Migration 006: Create thread_participants table (with profile_id — final state)
-- Source: sql/create_thread_participants_table.sql + sql/migrate_thread_participants_to_profile_id.sql
-- Uses profile_id (FK → profiles.user_id) directly — no need for legacy user_id column

create table if not exists public.thread_participants (
  thread_id uuid not null references public.threads(id) on delete cascade,
  profile_id uuid not null references public.profiles(user_id) on delete cascade,
  last_read_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (thread_id, profile_id)
);

create index if not exists thread_participants_profile_idx on public.thread_participants(profile_id);
create index if not exists thread_participants_thread_idx on public.thread_participants(thread_id);

alter table public.thread_participants enable row level security;

create policy "Users can view their own thread participants"
on public.thread_participants for select
using (
  exists (
    select 1 from public.profiles
    where profiles.user_id = thread_participants.profile_id
    and profiles.user_id = auth.uid()
  )
);

create policy "Users can insert their own thread participants"
on public.thread_participants for insert
with check (
  exists (
    select 1 from public.profiles
    where profiles.user_id = thread_participants.profile_id
    and profiles.user_id = auth.uid()
  )
);

create policy "Users can update their own thread participants"
on public.thread_participants for update
using (
  exists (
    select 1 from public.profiles
    where profiles.user_id = thread_participants.profile_id
    and profiles.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.user_id = thread_participants.profile_id
    and profiles.user_id = auth.uid()
  )
);

create policy "Users can delete their own thread participants"
on public.thread_participants for delete
using (
  exists (
    select 1 from public.profiles
    where profiles.user_id = thread_participants.profile_id
    and profiles.user_id = auth.uid()
  )
);
