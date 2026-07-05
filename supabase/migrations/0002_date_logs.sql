-- 0002_date_logs — places + date_logs + date_log_places + routes + photo bucket
-- Couple-scoped RLS: only the two partners of a couple can touch its records.
-- Applied to BOTH schemas: public (prod) and test. Storage is global (once).

-- =====================================================================
-- PUBLIC SCHEMA
-- =====================================================================
create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  kakao_place_id text unique,
  name text not null,
  category text,
  address text,
  lat double precision,
  lng double precision,
  created_at timestamptz not null default now()
);

create table if not exists public.date_logs (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  title text,
  memo text,
  created_at timestamptz not null default now()
);
create index if not exists date_logs_couple_date_idx on public.date_logs (couple_id, date desc);

create table if not exists public.date_log_places (
  id uuid primary key default gen_random_uuid(),
  date_log_id uuid not null references public.date_logs (id) on delete cascade,
  place_id uuid not null references public.places (id),
  visit_order int not null default 0,
  rating int check (rating between 0 and 5),
  memo text
);
create index if not exists date_log_places_log_idx on public.date_log_places (date_log_id);

create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  date_log_id uuid not null unique references public.date_logs (id) on delete cascade,
  coordinates jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.places enable row level security;
alter table public.date_logs enable row level security;
alter table public.date_log_places enable row level security;
alter table public.routes enable row level security;

-- places: shared reference data — any authenticated user can read/insert
drop policy if exists places_select on public.places;
create policy places_select on public.places for select using ((select auth.uid()) is not null);
drop policy if exists places_insert on public.places;
create policy places_insert on public.places for insert with check ((select auth.uid()) is not null);

-- date_logs: only the couple's two partners
drop policy if exists date_logs_rw on public.date_logs;
create policy date_logs_rw on public.date_logs for all
  using (exists (
    select 1 from public.couples c where c.id = date_logs.couple_id
      and ((select auth.uid()) in (c.partner_a, c.partner_b))))
  with check (exists (
    select 1 from public.couples c where c.id = date_logs.couple_id
      and ((select auth.uid()) in (c.partner_a, c.partner_b))));

-- date_log_places + routes: inherit access from their date_log's couple
drop policy if exists date_log_places_rw on public.date_log_places;
create policy date_log_places_rw on public.date_log_places for all
  using (exists (
    select 1 from public.date_logs dl join public.couples c on c.id = dl.couple_id
      where dl.id = date_log_places.date_log_id and ((select auth.uid()) in (c.partner_a, c.partner_b))))
  with check (exists (
    select 1 from public.date_logs dl join public.couples c on c.id = dl.couple_id
      where dl.id = date_log_places.date_log_id and ((select auth.uid()) in (c.partner_a, c.partner_b))));

drop policy if exists routes_rw on public.routes;
create policy routes_rw on public.routes for all
  using (exists (
    select 1 from public.date_logs dl join public.couples c on c.id = dl.couple_id
      where dl.id = routes.date_log_id and ((select auth.uid()) in (c.partner_a, c.partner_b))))
  with check (exists (
    select 1 from public.date_logs dl join public.couples c on c.id = dl.couple_id
      where dl.id = routes.date_log_id and ((select auth.uid()) in (c.partner_a, c.partner_b))));

-- =====================================================================
-- TEST SCHEMA (mirror)
-- =====================================================================
create table if not exists test.places (
  id uuid primary key default gen_random_uuid(),
  kakao_place_id text unique,
  name text not null,
  category text,
  address text,
  lat double precision,
  lng double precision,
  created_at timestamptz not null default now()
);

create table if not exists test.date_logs (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references test.couples (id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  title text,
  memo text,
  created_at timestamptz not null default now()
);
create index if not exists date_logs_couple_date_idx on test.date_logs (couple_id, date desc);

create table if not exists test.date_log_places (
  id uuid primary key default gen_random_uuid(),
  date_log_id uuid not null references test.date_logs (id) on delete cascade,
  place_id uuid not null references test.places (id),
  visit_order int not null default 0,
  rating int check (rating between 0 and 5),
  memo text
);
create index if not exists date_log_places_log_idx on test.date_log_places (date_log_id);

create table if not exists test.routes (
  id uuid primary key default gen_random_uuid(),
  date_log_id uuid not null unique references test.date_logs (id) on delete cascade,
  coordinates jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table test.places enable row level security;
alter table test.date_logs enable row level security;
alter table test.date_log_places enable row level security;
alter table test.routes enable row level security;

drop policy if exists places_select on test.places;
create policy places_select on test.places for select using ((select auth.uid()) is not null);
drop policy if exists places_insert on test.places;
create policy places_insert on test.places for insert with check ((select auth.uid()) is not null);

drop policy if exists date_logs_rw on test.date_logs;
create policy date_logs_rw on test.date_logs for all
  using (exists (
    select 1 from test.couples c where c.id = date_logs.couple_id
      and ((select auth.uid()) in (c.partner_a, c.partner_b))))
  with check (exists (
    select 1 from test.couples c where c.id = date_logs.couple_id
      and ((select auth.uid()) in (c.partner_a, c.partner_b))));

drop policy if exists date_log_places_rw on test.date_log_places;
create policy date_log_places_rw on test.date_log_places for all
  using (exists (
    select 1 from test.date_logs dl join test.couples c on c.id = dl.couple_id
      where dl.id = date_log_places.date_log_id and ((select auth.uid()) in (c.partner_a, c.partner_b))))
  with check (exists (
    select 1 from test.date_logs dl join test.couples c on c.id = dl.couple_id
      where dl.id = date_log_places.date_log_id and ((select auth.uid()) in (c.partner_a, c.partner_b))));

drop policy if exists routes_rw on test.routes;
create policy routes_rw on test.routes for all
  using (exists (
    select 1 from test.date_logs dl join test.couples c on c.id = dl.couple_id
      where dl.id = routes.date_log_id and ((select auth.uid()) in (c.partner_a, c.partner_b))))
  with check (exists (
    select 1 from test.date_logs dl join test.couples c on c.id = dl.couple_id
      where dl.id = routes.date_log_id and ((select auth.uid()) in (c.partner_a, c.partner_b))));

-- =====================================================================
-- STORAGE (global — photos for date logs)
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('date-photos', 'date-photos', false)
on conflict (id) do nothing;

-- Authenticated users can read/write within their own top-level folder (uid/…).
drop policy if exists date_photos_rw on storage.objects;
create policy date_photos_rw on storage.objects for all to authenticated
  using (bucket_id = 'date-photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'date-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
