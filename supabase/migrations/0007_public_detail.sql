-- 0007_public_detail — Phase 1-A of docs/plan/05-public-enrichment.md: close the
-- memo-exposure security backlog + anonymize the /explore surface. See
-- docs/DECISIONS.md (2026-07-07) for the ADR.
--
-- Two changes, both driven by confirmed product decisions:
--   1. DROP (not recreate) the `to authenticated` public-select policies that
--      0006 put on date_logs / date_log_places / routes. Those policies let ANY
--      logged-in user read someone else's public date_log by querying the base
--      table directly — including `memo`, which the anon-safe views never expose.
--      Public reads are now served exclusively through `explore_logs` /
--      `explore_log_places` (both schemas). Couple-scoped RW policies from
--      0002/0005 are untouched — they gate on auth.uid() = partner_a/partner_b,
--      so a couple's own `/logs/[id]` keeps working for its two members.
--      `routes` gets NO replacement public view — route polylines stay private
--      per product decision (public detail shows visited-place markers only,
--      never the path between them).
--   2. Anonymize `explore_logs` — drop the `profiles` join and the
--      `author_nickname` column. Public surfaces never show real nicknames;
--      the app renders a generic "anonymous couple" label instead.
--      `explore_log_places` is unchanged (already anonymous — no author info).
--
-- Applied to BOTH schemas (public/test).

-- ============================ PUBLIC ============================

-- 1. Drop the base-table public-select policies. Do NOT recreate them — public
--    reads go through explore_logs/explore_log_places only from here on.
drop policy if exists date_logs_public_select on public.date_logs;
drop policy if exists date_log_places_public_select on public.date_log_places;
drop policy if exists routes_public_select on public.routes;

-- 2. Re-create explore_logs without the profiles join / author_nickname column.
drop view if exists public.explore_logs;
create view public.explore_logs
  with (security_invoker = false) as
select
  dl.id,
  dl.couple_id,
  dl.date,
  dl.title,
  dl.public_cover_path,
  dl.created_at
from public.date_logs dl
where dl.visibility = 'public';
-- memo, cover_photo_path (private original), author_id, author_nickname:
-- intentionally excluded. Public surfaces render an anonymous "couple" label
-- from couple_id alone — no profiles join, no real nickname ever leaves this view.

comment on view public.explore_logs is
  'anon-safe, anonymized projection of public date_logs for /explore and '
  '/explore/[id]. Excludes memo, the private cover_photo_path, and any author '
  'identity (no profiles join) — see 0007 migration.';

grant select on public.explore_logs to anon, authenticated;

-- explore_log_places is unchanged by this migration (already anonymous; no
-- author/profile columns). Re-stating the grant here is a no-op safety net in
-- case a future migration ever recreates the view without it.
grant select on public.explore_log_places to anon, authenticated;

-- ============================ TEST ============================

drop policy if exists date_logs_public_select on test.date_logs;
drop policy if exists date_log_places_public_select on test.date_log_places;
drop policy if exists routes_public_select on test.routes;

drop view if exists test.explore_logs;
create view test.explore_logs
  with (security_invoker = false) as
select
  dl.id,
  dl.couple_id,
  dl.date,
  dl.title,
  dl.public_cover_path,
  dl.created_at
from test.date_logs dl
where dl.visibility = 'public';

comment on view test.explore_logs is
  'test-schema mirror of public.explore_logs — see 0007 migration.';

grant select on test.explore_logs to anon, authenticated;
grant select on test.explore_log_places to anon, authenticated;
