-- Create reports table for user-submitted reports on listings, profiles, or messages
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references auth.users(id) on delete set null,
  reported_type text not null check (reported_type in ('listing', 'profile', 'message')),
  reported_id text not null,
  reason text not null,
  details text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

-- Indexes for moderation queries
create index if not exists reports_reporter_id_idx on public.reports(reporter_id);
create index if not exists reports_reported_type_reported_id_idx on public.reports(reported_type, reported_id);
create index if not exists reports_status_created_at_idx on public.reports(status, created_at desc);

-- RLS: enable row level security
alter table public.reports enable row level security;

-- Authenticated users can insert their own reports
create policy "Authenticated users can create reports"
  on public.reports
  for insert
  to authenticated
  with check (reporter_id = auth.uid());

-- Users can view their own submitted reports
create policy "Users can view own reports"
  on public.reports
  for select
  to authenticated
  using (reporter_id = auth.uid());

-- No update or delete for regular users (moderation-only)
