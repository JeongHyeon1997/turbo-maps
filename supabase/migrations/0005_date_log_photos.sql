-- 0005_date_log_photos — gallery photos for a date_log (multiple per log)
-- Couple-scoped RLS, same pattern as date_log_places/routes (join date_log -> couples).
-- No public-select policy: even public date_logs keep their photo gallery couple-only.
-- Applied to BOTH schemas: public (prod) and test.

-- =====================================================================
-- PUBLIC SCHEMA
-- =====================================================================
create table if not exists public.date_log_photos (
  id uuid primary key default gen_random_uuid(),
  date_log_id uuid not null references public.date_logs (id) on delete cascade,
  storage_path text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists date_log_photos_log_idx on public.date_log_photos (date_log_id, sort_order);

alter table public.date_log_photos enable row level security;

drop policy if exists date_log_photos_rw on public.date_log_photos;
create policy date_log_photos_rw on public.date_log_photos for all
  using (exists (
    select 1 from public.date_logs dl join public.couples c on c.id = dl.couple_id
      where dl.id = date_log_photos.date_log_id and ((select auth.uid()) in (c.partner_a, c.partner_b))))
  with check (exists (
    select 1 from public.date_logs dl join public.couples c on c.id = dl.couple_id
      where dl.id = date_log_photos.date_log_id and ((select auth.uid()) in (c.partner_a, c.partner_b))));

-- =====================================================================
-- TEST SCHEMA (mirror)
-- =====================================================================
create table if not exists test.date_log_photos (
  id uuid primary key default gen_random_uuid(),
  date_log_id uuid not null references test.date_logs (id) on delete cascade,
  storage_path text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists date_log_photos_log_idx on test.date_log_photos (date_log_id, sort_order);

alter table test.date_log_photos enable row level security;

drop policy if exists date_log_photos_rw on test.date_log_photos;
create policy date_log_photos_rw on test.date_log_photos for all
  using (exists (
    select 1 from test.date_logs dl join test.couples c on c.id = dl.couple_id
      where dl.id = date_log_photos.date_log_id and ((select auth.uid()) in (c.partner_a, c.partner_b))))
  with check (exists (
    select 1 from test.date_logs dl join test.couples c on c.id = dl.couple_id
      where dl.id = date_log_photos.date_log_id and ((select auth.uid()) in (c.partner_a, c.partner_b))));
