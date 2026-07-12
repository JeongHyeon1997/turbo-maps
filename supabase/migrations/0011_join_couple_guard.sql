-- 0011_join_couple_guard — close the double-membership hole in join_couple()
-- Applied to BOTH schemas: public (prod) and test (test data).
--
-- Defect (reviewer): couples has no membership-uniqueness guarantee. A user
-- who already owns a couples row (e.g. as partner_a of their own pending
-- invite) could still call join_couple(p_code) with a *different* code and
-- become partner_b of a second row. The user then belongs to two couples
-- rows at once, and every `.maybeSingle()` couple lookup on web/mobile
-- (boot gate, header, /couple/connect) throws a multi-row error and gets
-- stuck permanently. The UI hides the join form once a couple row exists
-- (see apps/web/src/app/couple/connect/page.tsx), but that's a client-side
-- fig leaf — the RPC itself must refuse this at the DB layer.
--
-- Fix, two layers:
--   1. join_couple() now checks, before attempting the join, whether the
--      caller already appears as partner_a OR partner_b of ANY couples row.
--      If so it raises the *same* exception used for an invalid/used code
--      ('invalid or already-used invite code') — this preserves the
--      existing failure contract. Both web (apps/web/src/app/couple/connect/
--      page.tsx: `redirect(error ? '/couple/connect?error=join' : '/')`) and
--      mobile (apps/mobile/app/(auth)/couple-connect.tsx: `if (error) ...
--      GENERIC_JOIN_ERROR`) only branch on "RPC returned an error" and
--      render the single generic string "유효하지 않거나 이미 사용된
--      코드예요." for every failure mode — they never inspect the message,
--      so reusing the existing exception (rather than inventing a new
--      code/message) is a no-op for both clients and needs no app change.
--   2. Defense in depth: couples_partner_a_idx / couples_partner_b_idx
--      (plain btree since 0001) are replaced with a unique index on
--      partner_a and a partial unique index on partner_b (nullable until
--      joined). This blocks any other path that could produce a duplicate
--      slot assignment (e.g. a future direct `insert`/`update` against
--      couples that bypasses join_couple), not just this RPC.
--
--      Reviewed for regressions against 0001–0004 and the current web/mobile
--      couple-connect flow before adopting: there is no "abandon a pending
--      couple and create a new one" path anywhere in the app today —
--      `createCouple` (apps/web/src/app/couple/connect/page.tsx) and the
--      mobile `handleCreate` (apps/mobile/app/(auth)/couple-connect.tsx)
--      only ever run from a screen state where the caller does not already
--      have a couples row (`{!couple && ...}` / the pre-existing-row branch
--      short-circuits to displaying the existing invite code instead), and
--      there is no `delete from couples` anywhere in the codebase. So a
--      legitimate user is never expected to accumulate more than one
--      partner_a row or one partner_b row over the app's current lifetime,
--      and this migration does not break any existing normal flow.
--
--      Caveat for whoever applies this live: if the join_couple bug this
--      migration fixes was already exploited against live data, the live
--      couples table may already contain a row where a user occupies
--      partner_a or partner_b in more than one row. `create unique index`
--      will fail against that data. dba should run a duplicate-membership
--      check (e.g. `select partner_a, count(*) from couples group by
--      partner_a having count(*) > 1`, and the analogous query unioning
--      partner_a/partner_b values) and manually resolve any hits (decide
--      which row is authoritative) before applying this migration live.

-- =====================================================================
-- PUBLIC SCHEMA
-- =====================================================================
create or replace function public.join_couple(p_code text)
  returns uuid language plpgsql security definer set search_path = public as $$
declare c_id uuid;
begin
  if exists (
    select 1 from public.couples
    where partner_a = (select auth.uid()) or partner_b = (select auth.uid())
  ) then
    -- Same failure signature as an invalid/used code: neither client
    -- distinguishes reasons, both just show the generic "invalid or
    -- already-used code" message on any RPC error.
    raise exception 'invalid or already-used invite code';
  end if;

  update public.couples
     set partner_b = (select auth.uid()), status = 'connected', connected_at = now()
   where invite_code = upper(p_code)
     and status = 'pending'
     and partner_b is null
     and partner_a <> (select auth.uid())
  returning id into c_id;
  if c_id is null then
    raise exception 'invalid or already-used invite code';
  end if;
  return c_id;
end; $$;
grant execute on function public.join_couple(text) to authenticated;

drop index if exists public.couples_partner_a_idx;
create unique index if not exists couples_partner_a_idx on public.couples (partner_a);

drop index if exists public.couples_partner_b_idx;
create unique index if not exists couples_partner_b_idx on public.couples (partner_b)
  where partner_b is not null;

-- =====================================================================
-- TEST SCHEMA (mirror)
-- =====================================================================
create or replace function test.join_couple(p_code text)
  returns uuid language plpgsql security definer set search_path = test as $$
declare c_id uuid;
begin
  if exists (
    select 1 from test.couples
    where partner_a = (select auth.uid()) or partner_b = (select auth.uid())
  ) then
    raise exception 'invalid or already-used invite code';
  end if;

  update test.couples
     set partner_b = (select auth.uid()), status = 'connected', connected_at = now()
   where invite_code = upper(p_code)
     and status = 'pending'
     and partner_b is null
     and partner_a <> (select auth.uid())
  returning id into c_id;
  if c_id is null then
    raise exception 'invalid or already-used invite code';
  end if;
  return c_id;
end; $$;
grant execute on function test.join_couple(text) to authenticated;

drop index if exists test.couples_partner_a_idx;
create unique index if not exists couples_partner_a_idx on test.couples (partner_a);

drop index if exists test.couples_partner_b_idx;
create unique index if not exists couples_partner_b_idx on test.couples (partner_b)
  where partner_b is not null;
