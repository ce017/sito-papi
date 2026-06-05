-- Papi on the Beach — Supabase setup
-- Run this once in the Supabase SQL Editor (dashboard.supabase.com)

-- ============================================================
-- 1. Analytics table
-- ============================================================
create table if not exists public.analytics (
  id          bigserial        primary key,
  page        text             not null,
  session_id  text             not null,
  visited_at  timestamptz      not null default now()
);

-- ============================================================
-- 2. Row-Level Security
-- ============================================================
alter table public.analytics enable row level security;

-- Anyone (anonymous visitors) can INSERT
drop policy if exists "anon_insert" on public.analytics;
create policy "anon_insert"
  on public.analytics
  for insert
  to anon
  with check (true);

-- Only logged-in admin can SELECT (admin panel)
drop policy if exists "auth_select" on public.analytics;
create policy "auth_select"
  on public.analytics
  for select
  to authenticated
  using (true);

-- ============================================================
-- 3. Events table (if not already created)
-- ============================================================
create table if not exists public.events (
  id          bigserial        primary key,
  name        text             not null,
  date        text,
  location    text,
  image_url   text,
  ticket_url  text,
  table_url   text,
  created_at  timestamptz      not null default now()
);

alter table public.events enable row level security;

-- Drop any existing policies on events (handles whatever names Supabase/Framer created)
drop policy if exists "anon_select_events"            on public.events;
drop policy if exists "auth_all_events"               on public.events;
drop policy if exists "Public read published events"  on public.events;
drop policy if exists "Allow public read"             on public.events;
drop policy if exists "Enable read access for all"    on public.events;

create policy "anon_select_events"
  on public.events
  for select
  to anon
  using (true);

drop policy if exists "auth_all_events" on public.events;
create policy "auth_all_events"
  on public.events
  for all
  to authenticated
  using (true)
  with check (true);
