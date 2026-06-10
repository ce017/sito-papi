-- Papi on the Beach — Supabase setup
-- Run this in the Supabase SQL Editor (dashboard.supabase.com)
-- Safe to run multiple times.

-- ============================================================
-- Analytics table + RLS  (this is the important part)
-- ============================================================
create table if not exists public.analytics (
  id          bigserial        primary key,
  page        text             not null,
  session_id  text             not null,
  visited_at  timestamptz      not null default now()
);

alter table public.analytics enable row level security;

-- Anonymous visitors can INSERT (tracking)
drop policy if exists "anon_insert" on public.analytics;
create policy "anon_insert"
  on public.analytics
  for insert
  to anon
  with check (true);

-- Logged-in admin can SELECT (admin panel stats)
drop policy if exists "auth_select" on public.analytics;
create policy "auth_select"
  on public.analytics
  for select
  to authenticated
  using (true);

-- ============================================================
-- Events table policies are already set up — nothing to do.
-- ============================================================

-- ============================================================
-- Gallery support: add a Google Drive folder link to events.
-- An event with a non-empty gallery_url appears on the Galleria page.
-- Safe to run multiple times.
-- ============================================================
alter table public.events add column if not exists gallery_url text;

-- Optional end time shown next to the start time, e.g. "22:30 - 03:00".
-- Stored as plain text (HH:MM) since it's just a label (the morning after).
alter table public.events add column if not exists end_time text;
