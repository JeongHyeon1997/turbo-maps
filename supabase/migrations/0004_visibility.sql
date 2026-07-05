-- 0004_visibility — public sharing for date logs (explore feed)
-- Adds date_logs.visibility and public-read RLS (OR-ed with the couple policies).
-- Also lets authenticated users read any profile (nickname/avatar are public).
-- Applied to BOTH schemas. Cover photos stay private (explore uses gradients).

-- ============================ PUBLIC ============================
alter table public.date_logs
  add column if not exists visibility text not null default 'private'
  check (visibility in ('private', 'public'));
create index if not exists date_logs_public_idx on public.date_logs (visibility, date desc);

drop policy if exists date_logs_public_select on public.date_logs;
create policy date_logs_public_select on public.date_logs for select using (visibility = 'public');

drop policy if exists date_log_places_public_select on public.date_log_places;
create policy date_log_places_public_select on public.date_log_places for select
  using (exists (select 1 from public.date_logs dl
    where dl.id = date_log_places.date_log_id and dl.visibility = 'public'));

drop policy if exists routes_public_select on public.routes;
create policy routes_public_select on public.routes for select
  using (exists (select 1 from public.date_logs dl
    where dl.id = routes.date_log_id and dl.visibility = 'public'));

drop policy if exists profiles_public_select on public.profiles;
create policy profiles_public_select on public.profiles for select
  using ((select auth.uid()) is not null);

-- ============================ TEST ============================
alter table test.date_logs
  add column if not exists visibility text not null default 'private'
  check (visibility in ('private', 'public'));
create index if not exists date_logs_public_idx on test.date_logs (visibility, date desc);

drop policy if exists date_logs_public_select on test.date_logs;
create policy date_logs_public_select on test.date_logs for select using (visibility = 'public');

drop policy if exists date_log_places_public_select on test.date_log_places;
create policy date_log_places_public_select on test.date_log_places for select
  using (exists (select 1 from test.date_logs dl
    where dl.id = date_log_places.date_log_id and dl.visibility = 'public'));

drop policy if exists routes_public_select on test.routes;
create policy routes_public_select on test.routes for select
  using (exists (select 1 from test.date_logs dl
    where dl.id = routes.date_log_id and dl.visibility = 'public'));

drop policy if exists profiles_public_select on test.profiles;
create policy profiles_public_select on test.profiles for select
  using ((select auth.uid()) is not null);
