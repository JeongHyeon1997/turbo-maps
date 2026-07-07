-- 0008_explore_places — Phase 2-B of docs/plan/05-public-enrichment.md: anon-safe
-- place aggregation views for the future /places and /places/[id] public pages.
--
-- Design (read before touching):
--   * Two new views, same anon-safe pattern as 0006/0007's explore_logs /
--     explore_log_places — never grant anon direct row-select on base tables,
--     project only safe columns through a `security_invoker = false` view whose
--     hardcoded `where dl.visibility = 'public'` clause is what limits exposure.
--   * `explore_places` — one row per place that has appeared in at least one
--     PUBLIC date_log, with aggregate counters (public_log_count, avg_rating)
--     computed over public logs only. Private logs never influence these
--     numbers, so a place's public aggregate can't leak signal about anyone's
--     private visits.
--   * `explore_place_logs` — the public-log rows for a given place (used to
--     list "public courses that visited this place" on /places/[id]). Author
--     identity stays anonymous per product decision (0007): no nickname, no
--     author_id, no couple/profile join at all — same anonymization as
--     explore_logs. No memo (private field) either.
--   * Both views only ever read `date_log_places`/`date_logs`/`places` — same
--     owner-bypass mechanism as 0006/0007 (view owner is RLS-exempt on tables
--     it owns; the `where` clause is the actual gate, not RLS).
--   * Supporting indexes for the aggregation join: `date_log_places(place_id)`
--     is new (nothing indexed that column before — the existing
--     `date_log_places_log_idx` only covers `date_log_id`). `date_logs.visibility`
--     is already covered by the existing composite `date_logs_public_idx
--     (visibility, date desc)` from 0004 — visibility is the leading column, so
--     a second single-column index would be redundant; not added.
--   * Applied to BOTH schemas (public/test), no storage/global changes.

-- ============================ PUBLIC ============================

-- 1. Supporting index for the place-aggregation join (place_id was unindexed).
create index if not exists date_log_places_place_idx on public.date_log_places (place_id);

-- 2. explore_places — place-level aggregate over PUBLIC date_logs only.
--    Inner joins mean a place with zero public appearances simply never
--    produces a row (no need for an explicit "has any public log" filter).
drop view if exists public.explore_places;
create view public.explore_places
  with (security_invoker = false) as
select
  pl.id as place_id,
  pl.kakao_place_id,
  pl.name,
  pl.category,
  pl.address,
  pl.lat,
  pl.lng,
  count(distinct dl.id) as public_log_count,
  avg(dlp.rating) filter (where dlp.rating is not null) as avg_rating
from public.places pl
join public.date_log_places dlp on dlp.place_id = pl.id
join public.date_logs dl on dl.id = dlp.date_log_id
where dl.visibility = 'public'
group by pl.id, pl.kakao_place_id, pl.name, pl.category, pl.address, pl.lat, pl.lng;
-- No author/couple identity, no memo — aggregate-only. rating average excludes
-- null ratings (not counted as 0); rounding for display is left to the app.

comment on view public.explore_places is
  'anon-safe place aggregate over PUBLIC date_logs only, for /places. Columns: '
  'place_id, kakao_place_id, name, category, address, lat, lng, public_log_count, '
  'avg_rating. Excludes all private/identity columns — see 0008 migration.';

-- 3. explore_place_logs — public-log rows that visited a given place. Anonymous
--    (no author/couple identity), no memo. Pairs with explore_places for
--    /places/[id] ("public courses that visited this place").
drop view if exists public.explore_place_logs;
create view public.explore_place_logs
  with (security_invoker = false) as
select
  dlp.place_id,
  dl.id as date_log_id,
  dl.title,
  dl.date,
  dl.public_cover_path,
  dlp.rating
from public.date_log_places dlp
join public.date_logs dl on dl.id = dlp.date_log_id
where dl.visibility = 'public';
-- memo, author identity (nickname/author_id/couple_id): intentionally excluded,
-- same anonymization stance as explore_logs (0007).

comment on view public.explore_place_logs is
  'anon-safe, anonymized list of PUBLIC date_logs that visited a place, for '
  '/places/[id]. Columns: place_id, date_log_id, title, date, public_cover_path, '
  'rating. No author/couple identity, no memo — see 0008 migration.';

grant select on public.explore_places to anon, authenticated;
grant select on public.explore_place_logs to anon, authenticated;

-- ============================ TEST ============================

create index if not exists date_log_places_place_idx on test.date_log_places (place_id);

drop view if exists test.explore_places;
create view test.explore_places
  with (security_invoker = false) as
select
  pl.id as place_id,
  pl.kakao_place_id,
  pl.name,
  pl.category,
  pl.address,
  pl.lat,
  pl.lng,
  count(distinct dl.id) as public_log_count,
  avg(dlp.rating) filter (where dlp.rating is not null) as avg_rating
from test.places pl
join test.date_log_places dlp on dlp.place_id = pl.id
join test.date_logs dl on dl.id = dlp.date_log_id
where dl.visibility = 'public'
group by pl.id, pl.kakao_place_id, pl.name, pl.category, pl.address, pl.lat, pl.lng;

comment on view test.explore_places is
  'test-schema mirror of public.explore_places — see 0008 migration.';

drop view if exists test.explore_place_logs;
create view test.explore_place_logs
  with (security_invoker = false) as
select
  dlp.place_id,
  dl.id as date_log_id,
  dl.title,
  dl.date,
  dl.public_cover_path,
  dlp.rating
from test.date_log_places dlp
join test.date_logs dl on dl.id = dlp.date_log_id
where dl.visibility = 'public';

comment on view test.explore_place_logs is
  'test-schema mirror of public.explore_place_logs — see 0008 migration.';

grant select on test.explore_places to anon, authenticated;
grant select on test.explore_place_logs to anon, authenticated;
