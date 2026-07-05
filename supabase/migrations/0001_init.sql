-- 0001_init — profiles + couples (invite-code connect) + RLS
-- Applied to BOTH schemas: public (prod) and test (test data).
-- auth.users is shared per project. No auth trigger — the app upserts the
-- profile after login (schema-agnostic; avoids test/public trigger conflict).

-- =====================================================================
-- PUBLIC SCHEMA
-- =====================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.couples (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users (id) on delete cascade,
  partner_a uuid not null references auth.users (id) on delete cascade,
  partner_b uuid references auth.users (id) on delete set null,
  invite_code text unique not null default upper(substr(md5(gen_random_uuid()::text), 1, 6)),
  status text not null default 'pending' check (status in ('pending', 'connected')),
  created_at timestamptz not null default now(),
  connected_at timestamptz
);

create index if not exists couples_partner_a_idx on public.couples (partner_a);
create index if not exists couples_partner_b_idx on public.couples (partner_b);

alter table public.profiles enable row level security;
alter table public.couples enable row level security;

-- profiles: own row + partner's row visible; write own only
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select
  using (
    id = (select auth.uid())
    or exists (
      select 1 from public.couples c
      where c.status = 'connected'
        and ((c.partner_a = (select auth.uid()) and c.partner_b = profiles.id)
          or (c.partner_b = (select auth.uid()) and c.partner_a = profiles.id))
    )
  );
drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert
  with check (id = (select auth.uid()));
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- couples: only the two partners can see/modify; create as partner_a
drop policy if exists couples_select on public.couples;
create policy couples_select on public.couples for select
  using (partner_a = (select auth.uid()) or partner_b = (select auth.uid()));
drop policy if exists couples_insert on public.couples;
create policy couples_insert on public.couples for insert
  with check (created_by = (select auth.uid()) and partner_a = (select auth.uid()));
drop policy if exists couples_update on public.couples;
create policy couples_update on public.couples for update
  using (partner_a = (select auth.uid()) or partner_b = (select auth.uid()));

-- join by invite code (bypasses select-RLS via security definer)
create or replace function public.join_couple(p_code text)
  returns uuid language plpgsql security definer set search_path = public as $$
declare c_id uuid;
begin
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

-- =====================================================================
-- TEST SCHEMA (mirror)
-- =====================================================================
create schema if not exists test;

create table if not exists test.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists test.couples (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users (id) on delete cascade,
  partner_a uuid not null references auth.users (id) on delete cascade,
  partner_b uuid references auth.users (id) on delete set null,
  invite_code text unique not null default upper(substr(md5(gen_random_uuid()::text), 1, 6)),
  status text not null default 'pending' check (status in ('pending', 'connected')),
  created_at timestamptz not null default now(),
  connected_at timestamptz
);

create index if not exists couples_partner_a_idx on test.couples (partner_a);
create index if not exists couples_partner_b_idx on test.couples (partner_b);

alter table test.profiles enable row level security;
alter table test.couples enable row level security;

drop policy if exists profiles_select on test.profiles;
create policy profiles_select on test.profiles for select
  using (
    id = (select auth.uid())
    or exists (
      select 1 from test.couples c
      where c.status = 'connected'
        and ((c.partner_a = (select auth.uid()) and c.partner_b = profiles.id)
          or (c.partner_b = (select auth.uid()) and c.partner_a = profiles.id))
    )
  );
drop policy if exists profiles_insert on test.profiles;
create policy profiles_insert on test.profiles for insert
  with check (id = (select auth.uid()));
drop policy if exists profiles_update on test.profiles;
create policy profiles_update on test.profiles for update
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists couples_select on test.couples;
create policy couples_select on test.couples for select
  using (partner_a = (select auth.uid()) or partner_b = (select auth.uid()));
drop policy if exists couples_insert on test.couples;
create policy couples_insert on test.couples for insert
  with check (created_by = (select auth.uid()) and partner_a = (select auth.uid()));
drop policy if exists couples_update on test.couples;
create policy couples_update on test.couples for update
  using (partner_a = (select auth.uid()) or partner_b = (select auth.uid()));

create or replace function test.join_couple(p_code text)
  returns uuid language plpgsql security definer set search_path = test as $$
declare c_id uuid;
begin
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
