-- Migration 005: Create threads and messages tables
-- Source: sql/create_messaging_tables.sql

create table if not exists public.threads (
  id uuid primary key default gen_random_uuid(),
  user1_id uuid not null references auth.users(id) on delete cascade,
  user2_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists threads_users_idx on public.threads(user1_id, user2_id);
create index if not exists messages_thread_created_idx on public.messages(thread_id, created_at);

create unique index if not exists threads_unique_idx
on public.threads(
  least(user1_id, user2_id),
  greatest(user1_id, user2_id),
  coalesce(listing_id, '00000000-0000-0000-0000-000000000000'::uuid)
);

alter table public.threads enable row level security;
alter table public.messages enable row level security;

create policy "Threads are viewable by participants"
on public.threads for select
using (auth.uid() = user1_id or auth.uid() = user2_id);

create policy "Users can create threads where they are participants"
on public.threads for insert
with check (auth.uid() = user1_id or auth.uid() = user2_id);

create policy "Messages are viewable by thread participants"
on public.messages for select
using (
  exists (
    select 1 from public.threads
    where threads.id = messages.thread_id
    and (threads.user1_id = auth.uid() or threads.user2_id = auth.uid())
  )
);

create policy "Users can send messages in their threads"
on public.messages for insert
with check (
  sender_id = auth.uid()
  and exists (
    select 1 from public.threads
    where threads.id = messages.thread_id
    and (threads.user1_id = auth.uid() or threads.user2_id = auth.uid())
  )
);
