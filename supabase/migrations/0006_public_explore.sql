-- 0006_public_explore — /explore public surface (2단계): public cover bucket +
-- copy-on-publish column + anon-safe read views. See docs/DECISIONS.md (2026-07-06)
-- and docs/plan/04-public-surface.md 2단계 for the ADR.
--
-- Design (read before touching):
--   * Public covers live in a SEPARATE public bucket `public-covers` (copy-on-publish
--     from the private `date-photos` bucket, done by the app). `date-photos` itself is
--     untouched — no policy changes, no public exposure of the private originals.
--   * The gallery (`date_log_photos`) stays couple-only even for public logs — unchanged.
--   * anon must NEVER be able to read `date_logs.memo` (or `date_log_places.memo`).
--     RLS row-policies alone can't hide a column, so anon does not get a row-select
--     policy on the base tables at all. Instead:
--       - the 0004 public-select policies on date_logs/date_log_places/routes are
--         RECREATED here scoped `to authenticated` (closing an unscoped-role gap —
--         they previously had no `to` clause, which defaults to PUBLIC/all roles;
--         combined with Supabase's default anon table grant on `public`, that meant
--         anon could already select public `date_logs` rows directly, memo included).
--       - two new views, `explore_logs` / `explore_log_places`, project only safe
--         columns and hardcode `where visibility = 'public'`. They're created with
--         `security_invoker = false` (the Postgres default, made explicit here) so
--         they evaluate as their OWNER (the migration-running role, which owns
--         date_logs/profiles/places and is therefore RLS-exempt on those tables,
--         same as any table owner without FORCE ROW LEVEL SECURITY) — the view's own
--         `where` clause is what limits exposure to public rows, not RLS. Only these
--         views are granted to `anon`; the base tables are not.
--   * Applied to BOTH schemas (public/test) for schema objects (columns, policies,
--     views, grants). The storage bucket + storage.objects policies are project-global
--     (not schema-mirrored), same as `date-photos` in 0002.

-- ============================ PUBLIC ============================

-- 1. Copy-on-publish target column (nullable; null = private or no cover copied yet).
alter table public.date_logs add column if not exists public_cover_path text;

-- 2. Close the anon gap in the 0004 public-select policies: recreate `to authenticated`.
--    (Couple-scoped RW policies from 0002/0005 are unaffected — auth.uid() being null
--    for anon already makes their USING clause false, so no gap there.)
drop policy if exists date_logs_public_select on public.date_logs;
create policy date_logs_public_select on public.date_logs for select to authenticated
  using (visibility = 'public');

drop policy if exists date_log_places_public_select on public.date_log_places;
create policy date_log_places_public_select on public.date_log_places for select to authenticated
  using (exists (select 1 from public.date_logs dl
    where dl.id = date_log_places.date_log_id and dl.visibility = 'public'));

drop policy if exists routes_public_select on public.routes;
create policy routes_public_select on public.routes for select to authenticated
  using (exists (select 1 from public.date_logs dl
    where dl.id = routes.date_log_id and dl.visibility = 'public'));

-- Defense in depth: even if a table-level SELECT grant to anon exists (Supabase's
-- default schema privileges), explicitly revoke it on the tables that carry private
-- columns/rows, so a future stray policy can't silently reopen anon access.
revoke select on public.date_logs from anon;
revoke select on public.date_log_places from anon;
revoke select on public.routes from anon;

-- 3. Anon-safe views — safe columns only, hardcoded to public rows.
--    security_invoker = false (default, made explicit): runs as the view owner, which
--    owns date_logs/profiles/places/date_log_places and is therefore RLS-exempt on
--    them (no FORCE ROW LEVEL SECURITY set on those tables). The `where` clause below
--    is the ONLY thing limiting exposure — keep it in sync if columns are added.
drop view if exists public.explore_logs;
create view public.explore_logs
  with (security_invoker = false) as
select
  dl.id,
  dl.couple_id,
  dl.date,
  dl.title,
  dl.public_cover_path,
  dl.created_at,
  p.nickname as author_nickname
from public.date_logs dl
join public.profiles p on p.id = dl.author_id
where dl.visibility = 'public';
-- memo, cover_photo_path (private original), author_id: intentionally excluded.

comment on view public.explore_logs is
  'anon-safe projection of public date_logs for /explore. Excludes memo and the '
  'private cover_photo_path. security_invoker=false by design — see 0006 migration.';

drop view if exists public.explore_log_places;
create view public.explore_log_places
  with (security_invoker = false) as
select
  dlp.id,
  dlp.date_log_id,
  dlp.place_id,
  dlp.visit_order,
  dlp.rating,
  pl.name,
  pl.category,
  pl.address,
  pl.lat,
  pl.lng
from public.date_log_places dlp
join public.places pl on pl.id = dlp.place_id
join public.date_logs dl on dl.id = dlp.date_log_id
where dl.visibility = 'public';
-- date_log_places.memo: intentionally excluded.

comment on view public.explore_log_places is
  'anon-safe projection of place visits for public date_logs. Excludes '
  'date_log_places.memo. security_invoker=false by design — see 0006 migration.';

grant select on public.explore_logs to anon, authenticated;
grant select on public.explore_log_places to anon, authenticated;

-- ============================ TEST ============================

alter table test.date_logs add column if not exists public_cover_path text;

drop policy if exists date_logs_public_select on test.date_logs;
create policy date_logs_public_select on test.date_logs for select to authenticated
  using (visibility = 'public');

drop policy if exists date_log_places_public_select on test.date_log_places;
create policy date_log_places_public_select on test.date_log_places for select to authenticated
  using (exists (select 1 from test.date_logs dl
    where dl.id = date_log_places.date_log_id and dl.visibility = 'public'));

drop policy if exists routes_public_select on test.routes;
create policy routes_public_select on test.routes for select to authenticated
  using (exists (select 1 from test.date_logs dl
    where dl.id = routes.date_log_id and dl.visibility = 'public'));

revoke select on test.date_logs from anon;
revoke select on test.date_log_places from anon;
revoke select on test.routes from anon;

drop view if exists test.explore_logs;
create view test.explore_logs
  with (security_invoker = false) as
select
  dl.id,
  dl.couple_id,
  dl.date,
  dl.title,
  dl.public_cover_path,
  dl.created_at,
  p.nickname as author_nickname
from test.date_logs dl
join test.profiles p on p.id = dl.author_id
where dl.visibility = 'public';

comment on view test.explore_logs is
  'test-schema mirror of public.explore_logs — see 0006 migration.';

drop view if exists test.explore_log_places;
create view test.explore_log_places
  with (security_invoker = false) as
select
  dlp.id,
  dlp.date_log_id,
  dlp.place_id,
  dlp.visit_order,
  dlp.rating,
  pl.name,
  pl.category,
  pl.address,
  pl.lat,
  pl.lng
from test.date_log_places dlp
join test.places pl on pl.id = dlp.place_id
join test.date_logs dl on dl.id = dlp.date_log_id
where dl.visibility = 'public';

comment on view test.explore_log_places is
  'test-schema mirror of public.explore_log_places — see 0006 migration.';

grant select on test.explore_logs to anon, authenticated;
grant select on test.explore_log_places to anon, authenticated;

-- ============================ STORAGE (global) ============================
-- New PUBLIC bucket for copy-on-publish covers. Separate from the private
-- `date-photos` bucket, which is untouched by this migration.
insert into storage.buckets (id, name, public)
values ('public-covers', 'public-covers', true)
on conflict (id) do nothing;

-- Authenticated users can write/update/delete only within their own top-level
-- folder (<uid>/…), same pattern as date-photos in 0002.
drop policy if exists public_covers_rw on storage.objects;
create policy public_covers_rw on storage.objects for all to authenticated
  using (bucket_id = 'public-covers' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'public-covers' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- SELECT is open to anyone (including anon) — this bucket only ever holds
-- copies that were explicitly published, so folder scoping does not apply to reads.
drop policy if exists public_covers_public_read on storage.objects;
create policy public_covers_public_read on storage.objects for select
  using (bucket_id = 'public-covers');
