-- 0003_cover_photo — cover thumbnail for a date log (stored in date-photos bucket)
-- Applied to BOTH schemas. Path format: "<uid>/<uuid>-<filename>" (matches the
-- storage RLS policy that scopes objects to the owner's top-level folder).

alter table public.date_logs add column if not exists cover_photo_path text;
alter table test.date_logs add column if not exists cover_photo_path text;
