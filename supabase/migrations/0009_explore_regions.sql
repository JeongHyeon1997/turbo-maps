-- 0009_explore_regions — Phase 2-C of docs/plan/05-public-enrichment.md: region
-- (구/시/군 단위) tagging for the future /explore/지역/[region] pages, derived
-- from the already-public `places.address` string — no new privacy exposure.
--
-- Design (read before touching):
--   * Region unit is 구/시/군 (NOT 동/read: never dong-level — dong + route would
--     risk pinpointing a private location; 구/시/군 is coarse enough to be safe
--     per product decision in the task spec).
--   * Parsing rule, implemented as a small `immutable` SQL function
--     `derive_region(text)` (created in both `public` and `test`, mirroring
--     each schema's own tables) rather than repeating the regex inline in every
--     view — keeps `explore_places`/`explore_regions` readable and guarantees
--     both views (and any future one) apply the exact same rule:
--       1. First Korean token ending in `구` wins (e.g. "서울특별시 마포구 …" →
--          마포구, "경기도 성남시 분당구 …" → 분당구). Regex: `([가-힣]+구)`,
--          leftmost match — Hangul runs are naturally delimited by the spaces/
--          digits/hyphens in a normal Korean address, so this reliably lands on
--          the district token even though 시/도 prefixes are scanned first.
--       2. If no `구` token exists anywhere in the address, fall back to the
--          first token ending in `시` or `군` (e.g. "강원도 춘천시 …" → 춘천시,
--          경기도 가평군 → 가평군). Regex: `([가-힣]+[시군])`.
--          NOTE: this branch is only reached when the address has *no* 구 token
--          at all, which is why metro/special-city prefixes like 서울특별시 /
--          부산광역시 never leak through as a "region" — they always contain a
--          구 underneath, so rule 1 wins first. The one accepted exception is
--          세종특별자치시, which has no 구 subdivision, so rule 2 legitimately
--          picks up "세종특별자치시" itself — allowed per spec.
--       3. NULL address, or no match at all → region is NULL. Views filter NULL
--          region out (explore_regions) or simply carry a NULL region column
--          (explore_places) — no parsing failure ever surfaces as an error.
--   * `derive_region` is `immutable`, not `security definer` — it is pure text
--     processing over its own argument, called by views owned by the same
--     definer/owner as 0006-0008's anon-safe views. No explicit `grant execute`
--     needed: Postgres grants EXECUTE on new functions to PUBLIC by default,
--     and no REVOKE has been issued against it anywhere in this project, so
--     anon/authenticated can already call it as part of selecting from the
--     views below (same as any other built-in function call inside a view).
--   * `explore_places` (0008) is redefined (drop + recreate, same anon-safe
--     owner-bypass pattern) to add one new column: `region text`. All other
--     columns/semantics are unchanged from 0008.
--   * `explore_regions` is a brand-new aggregate view, same source join as
--     0008's explore_places (places → date_log_places → date_logs filtered to
--     visibility = 'public'), grouped by derived region instead of place.
--     `place_count` = distinct places appearing in that region's public logs;
--     `public_log_count` = distinct public date_logs whose places resolved to
--     that region. Rows with a NULL region (unparseable address) are excluded
--     — nothing to link a "region" page to.
--   * No new base-table exposure: places/date_logs/date_log_places keep
--     exactly the RLS/grants left by 0007/0008 (no anon/authenticated
--     public-select policy or grant added here). Region is derived from
--     `places.address`, which the existing `explore_places` view already
--     exposes in full — grouping it to 구/시/군 granularity adds no new
--     information, only a coarser aggregate of what's already public.
--   * Index note: `region` is a derived expression (function of `address`),
--     not a stored/generated column, so it cannot be indexed as-is. Current
--     data volume makes this a non-issue (small tables, sequential scan over
--     places/date_log_places/date_logs is cheap). If volume grows enough to
--     matter, revisit by adding a stored `generated always as
--     (derive_region(address)) stored` column on `places` with a btree index,
--     instead of the current view-time derivation.
--   * Applied to BOTH schemas (public/test), no storage/global changes.

-- ============================ PUBLIC ============================

-- 1. derive_region — pure/immutable text parse of a Korean address string into
--    a 구/시/군-level region label. See migration header for the exact rule.
create or replace function public.derive_region(addr text)
returns text
language sql
immutable
as $$
  select coalesce(
    (regexp_match(addr, '([가-힣]+구)'))[1],
    (regexp_match(addr, '([가-힣]+[시군])'))[1]
  )
$$;

comment on function public.derive_region(text) is
  'Derives a 구/시/군-level region label from a Korean address string: first '
  '[가-힣]+구 token wins, else first [가-힣]+[시군] token, else NULL. Used by '
  'explore_places.region and explore_regions — see 0009 migration.';

-- 2. explore_places — redefined from 0008 to add `region`. All other columns
--    unchanged.
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
  public.derive_region(pl.address) as region,
  count(distinct dl.id) as public_log_count,
  avg(dlp.rating) filter (where dlp.rating is not null) as avg_rating
from public.places pl
join public.date_log_places dlp on dlp.place_id = pl.id
join public.date_logs dl on dl.id = dlp.date_log_id
where dl.visibility = 'public'
group by pl.id, pl.kakao_place_id, pl.name, pl.category, pl.address, pl.lat, pl.lng;

comment on view public.explore_places is
  'anon-safe place aggregate over PUBLIC date_logs only, for /places. Columns: '
  'place_id, kakao_place_id, name, category, address, lat, lng, region, '
  'public_log_count, avg_rating. region is derived from address (구/시/군 '
  'level, see derive_region) and may be NULL if unparseable. Excludes all '
  'private/identity columns — see 0008/0009 migrations.';

-- 3. explore_regions — region-level index/aggregate for /explore/지역/[region].
--    Same source join as explore_places, grouped by derived region.
drop view if exists public.explore_regions;
create view public.explore_regions
  with (security_invoker = false) as
select
  public.derive_region(pl.address) as region,
  count(distinct pl.id) as place_count,
  count(distinct dl.id) as public_log_count
from public.places pl
join public.date_log_places dlp on dlp.place_id = pl.id
join public.date_logs dl on dl.id = dlp.date_log_id
where dl.visibility = 'public'
  and public.derive_region(pl.address) is not null
group by public.derive_region(pl.address);

comment on view public.explore_regions is
  'anon-safe region-level aggregate over PUBLIC date_logs only, for '
  '/explore/지역/[region]. Columns: region, place_count (distinct places in '
  'that region with a public appearance), public_log_count (distinct public '
  'date_logs whose places resolved to that region). Rows with unparseable '
  '(NULL) region are excluded — see 0009 migration.';

grant select on public.explore_places to anon, authenticated;
grant select on public.explore_regions to anon, authenticated;

-- ============================ TEST ============================

create or replace function test.derive_region(addr text)
returns text
language sql
immutable
as $$
  select coalesce(
    (regexp_match(addr, '([가-힣]+구)'))[1],
    (regexp_match(addr, '([가-힣]+[시군])'))[1]
  )
$$;

comment on function test.derive_region(text) is
  'test-schema mirror of public.derive_region — see 0009 migration.';

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
  test.derive_region(pl.address) as region,
  count(distinct dl.id) as public_log_count,
  avg(dlp.rating) filter (where dlp.rating is not null) as avg_rating
from test.places pl
join test.date_log_places dlp on dlp.place_id = pl.id
join test.date_logs dl on dl.id = dlp.date_log_id
where dl.visibility = 'public'
group by pl.id, pl.kakao_place_id, pl.name, pl.category, pl.address, pl.lat, pl.lng;

comment on view test.explore_places is
  'test-schema mirror of public.explore_places — see 0009 migration.';

drop view if exists test.explore_regions;
create view test.explore_regions
  with (security_invoker = false) as
select
  test.derive_region(pl.address) as region,
  count(distinct pl.id) as place_count,
  count(distinct dl.id) as public_log_count
from test.places pl
join test.date_log_places dlp on dlp.place_id = pl.id
join test.date_logs dl on dl.id = dlp.date_log_id
where dl.visibility = 'public'
  and test.derive_region(pl.address) is not null
group by test.derive_region(pl.address);

comment on view test.explore_regions is
  'test-schema mirror of public.explore_regions — see 0009 migration.';

grant select on test.explore_places to anon, authenticated;
grant select on test.explore_regions to anon, authenticated;
