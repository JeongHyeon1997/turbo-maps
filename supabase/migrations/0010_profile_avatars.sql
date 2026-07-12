-- 0010_profile_avatars — profile 직접 편집 STEP 1 (docs/plan/11-profile-editing.md):
-- custom avatar column + dedicated public Storage bucket. See the plan doc for the
-- full design rationale; only the load-bearing points are repeated here.
--
-- Design (read before touching):
--   * `custom_avatar_url` is a SEPARATE column from `avatar_url`, not a reuse. The
--     OAuth login flow (`apps/web` `auth/callback`) keeps backfilling `avatar_url`
--     from the provider on every login, UNTOUCHED by this migration — that column
--     stays the "OAuth-synced" value. `custom_avatar_url` is the user's own upload;
--     NULL means "no custom avatar, fall back to avatar_url". Render rule (app-side):
--     `custom_avatar_url ?? avatar_url ?? initials`. This split is what makes
--     "revert to Kakao photo" a plain `set custom_avatar_url = null` with no data
--     loss and no change needed to the login callback.
--   * No RLS policy change on `profiles`. The existing `profiles_update` policy
--     (0001: `using (id = auth.uid()) with check (id = auth.uid())`) is a row-level
--     policy — Postgres RLS has no per-column granularity, so it already covers
--     UPDATE of the new column for its own row. `profiles_select` (0001, widened
--     0004) already lets a connected partner (and, since 0004, any authenticated
--     user) read the row the new column lives on, which is what lets a partner's
--     header avatar resolve `custom_avatar_url` without any policy change here.
--   * New PUBLIC Storage bucket `avatars`, separate from `date-photos` (private)
--     and `public-covers` (public, copy-on-publish only). Pattern copied from
--     `public-covers` (0006): authenticated users may insert/update/delete only
--     inside their own top-level folder (`<uid>/…`); SELECT is open to anyone,
--     anon included — this bucket only ever holds display avatars, which are
--     low-sensitivity (the OAuth avatars they can fall back to are already public
--     CDN URLs). Public object URL shape: `/storage/v1/object/public/avatars/<uid>/<file>`.
--   * Applied to BOTH schemas (public/test) for the `custom_avatar_url` column
--     (schema-mirrored, per rls-migration skill). The storage bucket + storage.objects
--     policies are project-global (not schema-mirrored), same as `date-photos` (0002)
--     and `public-covers` (0006) — one bucket serves both schemas' rows.

-- ============================ PUBLIC ============================

alter table public.profiles add column if not exists custom_avatar_url text;

-- ============================ TEST ============================

alter table test.profiles add column if not exists custom_avatar_url text;

-- ============================ STORAGE (global) ============================
-- New PUBLIC bucket for user-uploaded avatar images. Unlike date-photos /
-- public-covers, this bucket enforces server-side constraints (5MB, image/*):
-- it is public-read, so without them any authenticated user could bypass the
-- client-side guard and host arbitrary files behind tokenless public URLs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/*'])
on conflict (id) do nothing;

-- Authenticated users can insert/update/delete only within their own top-level
-- folder (<uid>/…), same folder-scoping pattern as date-photos (0002) /
-- public-covers (0006).
drop policy if exists avatars_rw on storage.objects;
create policy avatars_rw on storage.objects for all to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- SELECT is open to anyone (including anon) — display avatars only, no folder
-- scoping on reads, mirroring public_covers_public_read (0006).
drop policy if exists avatars_public_read on storage.objects;
create policy avatars_public_read on storage.objects for select
  using (bucket_id = 'avatars');
