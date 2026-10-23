-- =====================================================================
-- LittleLingos Classroom: database setup for Supabase
-- Paste this whole file into Supabase > SQL Editor > New query > Run.
-- It is safe to run again (it replaces functions and policies).
-- =====================================================================

-- 1) WHO IS THE ADMIN ---------------------------------------------------
-- Every email listed here gets the full admin dashboard.
-- Change the email if the academy should be run from a different address.
create table if not exists public.ll_admins (email text primary key);
insert into public.ll_admins(email) values ('krashanuagarwal@gmail.com') on conflict do nothing;

-- 2) WHERE EVERYTHING IS STORED -----------------------------------------
-- One table holds every record (learners, classes, fees, chats ...).
-- "path" looks like  learners/abc123  or  pp/<user-id>/x/<msg-id>.
create table if not exists public.docs (
  path        text primary key check (path ~ '^[A-Za-z0-9_.~:@+-]+(/[A-Za-z0-9_.~:@+-]+)*$'
                                      and array_length(string_to_array(path,'/'),1) % 2 = 0),
  parent      text generated always as (regexp_replace(path, '/[^/]+$', '')) stored,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  updated_by  uuid default auth.uid()
);
create index if not exists docs_parent_idx on public.docs(parent);
create index if not exists docs_trainer_uid_idx on public.docs((data->>'uid')) where parent in ('trainers','learners');

-- Display names people see for each other (filled automatically).
create table if not exists public.people (
  id    uuid primary key,
  name  text not null default ''
);

-- 3) ACCESS RULES -------------------------------------------------------
-- Levels: 1 = signed in, not yet connected by the admin
--         2 = connected parent or learner
--         3 = trainer
--         4 = admin
-- Each rule gives the level needed to read (r) and to write (w) everything
-- under a path. {self} means "the signed-in person's own id".
-- The most specific matching rule wins; a blank value falls back to the
-- next less specific rule. Anything not listed needs level 2.
create table if not exists public.ll_rules (pattern text primary key, r int, w int);
delete from public.ll_rules;
insert into public.ll_rules(pattern, r, w) values
  ('config',            1, 4),
  ('learners',          2, 4),
  ('trainers',          2, 4),
  ('notices',           2, 4),
  ('fees',              4, 4),
  ('private',           4, 4),
  ('profiles',          2, 4),
  ('profiles/{self}',   1, 1),
  ('progress',          2, 4),
  ('progress/{self}',   null, 2),
  ('answers',           2, 4),
  ('answers/{self}',    null, 2),
  ('tw',                2, 4),
  ('tw/{self}',         null, 2),
  ('kp',                2, 4),
  ('kp/{self}',         null, 2),
  ('timesheets',        4, 4),
  ('timesheets/{self}', 2, 2),
  ('contacts',          4, 4),
  ('contacts/{self}',   2, null),
  ('courses',           2, 3),
  ('lessons',           2, 3),
  ('sessions',          2, 3),
  ('library',           2, 3),
  ('pp',                3, 3),
  ('pp/{self}',         2, 2),
  ('ppi',               3, 3),
  ('ppi/{self}',        2, 2),
  ('pf',                4, 4),
  ('pf/{self}',         2, null),
  ('ptm',               2, 3),
  ('ptmb',              2, 4),
  ('ptmb/{self}',       null, 2),
  ('ad',                4, 4),
  ('batches',           2, 4),
  ('events',            2, 4),
  ('evr',               2, 4),
  ('evr/{self}',        null, 2);

-- The signed-in person's level.
create or replace function public.ll_level() returns int
language sql stable security definer set search_path = public as $$
  select case
    when auth.uid() is null then 0
    when exists (select 1 from ll_admins a where lower(a.email) = lower(coalesce(auth.jwt()->>'email',''))) then 4
    when exists (select 1 from docs d where d.parent = 'trainers'
                   and d.data->>'uid' = auth.uid()::text
                   and coalesce(d.data->>'active','true') <> 'false') then 3
    when exists (select 1 from docs d where d.parent = 'learners'
                   and coalesce(d.data->>'active','true') <> 'false'
                   and (d.data->>'uid' = auth.uid()::text or coalesce(d.data->'parents','[]'::jsonb) ? auth.uid()::text)) then 2
    else 1 end;
$$;

-- Does a rule pattern cover this path?
create or replace function public.ll_match(pat text, p text) returns boolean
language sql stable set search_path = public as $$
  with a as (select string_to_array(pat,'/') ps, string_to_array(p,'/') xs)
  select cardinality(ps) <= cardinality(xs)
     and not exists (select 1 from generate_subscripts(ps,1) i
                     where not (ps[i] = xs[i] or (ps[i] = '{self}' and xs[i] = coalesce(auth.uid()::text,'-'))))
  from a;
$$;

-- Level needed for op ('r' or 'w') on a path.
create or replace function public.ll_need(p text, op text) returns int
language sql stable security definer set search_path = public as $$
  select coalesce((
    select case when op = 'r' then r else w end
    from ll_rules
    where ll_match(pattern, p) and (case when op = 'r' then r else w end) is not null
    order by cardinality(string_to_array(pattern,'/')) desc
    limit 1), 2);
$$;

-- Deep-merge two JSON objects (used for partial updates).
create or replace function public.ll_merge(a jsonb, b jsonb) returns jsonb
language plpgsql immutable as $$
declare k text; v jsonb; out jsonb := coalesce(a,'{}'::jsonb);
begin
  if b is null or jsonb_typeof(b) <> 'object' then return out; end if;
  for k, v in select * from jsonb_each(b) loop
    if jsonb_typeof(v) = 'object' and jsonb_typeof(out->k) = 'object' then
      out := jsonb_set(out, array[k], ll_merge(out->k, v));
    else
      out := out || jsonb_build_object(k, v);
    end if;
  end loop;
  return out;
end $$;

-- Partial update of one record (runs with the caller's access rights).
create or replace function public.ll_update(p text, patch jsonb) returns void
language plpgsql security invoker set search_path = public as $$
begin
  update docs set data = ll_merge(data, patch), updated_at = now(), updated_by = auth.uid() where path = p;
  if not found then raise exception 'missing' using errcode = 'P0002'; end if;
end $$;

alter table public.docs enable row level security;
alter table public.people enable row level security;
alter table public.ll_rules enable row level security;
alter table public.ll_admins enable row level security;

drop policy if exists docs_read on public.docs;
drop policy if exists docs_insert on public.docs;
drop policy if exists docs_update on public.docs;
drop policy if exists docs_delete on public.docs;
create policy docs_read   on public.docs for select using ((select ll_level()) >= ll_need(path,'r'));
create policy docs_insert on public.docs for insert with check ((select ll_level()) >= ll_need(path,'w'));
create policy docs_update on public.docs for update using ((select ll_level()) >= ll_need(path,'w'))
                                                  with check ((select ll_level()) >= ll_need(path,'w'));
create policy docs_delete on public.docs for delete using ((select ll_level()) >= ll_need(path,'w'));

drop policy if exists people_read on public.people;
create policy people_read on public.people for select using (id = auth.uid() or (select ll_level()) >= 2);

-- 4) NAMES --------------------------------------------------------------
create or replace function public.ll_people_from_profile() returns trigger
language plpgsql security definer set search_path = public as $$
declare uid text := split_part(new.path,'/',2);
begin
  if new.parent = 'profiles' and uid ~ '^[0-9a-f-]{36}$' and coalesce(new.data->>'displayName','') <> '' then
    insert into people(id, name) values (uid::uuid, left(new.data->>'displayName', 80))
    on conflict (id) do update set name = excluded.name;
  end if;
  return new;
end $$;
drop trigger if exists ll_people_from_profile on public.docs;
create trigger ll_people_from_profile after insert or update on public.docs
  for each row execute function public.ll_people_from_profile();

create or replace function public.ll_people_from_signup() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into people(id, name) values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(coalesce(new.email,''),'@',1)))
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists ll_people_from_signup on auth.users;
create trigger ll_people_from_signup after insert on auth.users
  for each row execute function public.ll_people_from_signup();

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.docs to authenticated;
grant select on public.people to authenticated;
grant execute on function public.ll_level(), public.ll_update(text,jsonb) to authenticated;

-- 5) LIVE UPDATES -------------------------------------------------------
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'docs') then
    execute 'alter publication supabase_realtime add table public.docs';
  end if;
end $$;

-- 6) FILE UPLOADS (class materials) -------------------------------------
do $$ begin
  if exists (select 1 from information_schema.schemata where schema_name = 'storage') then
    insert into storage.buckets (id, name, public) values ('assets','assets', true) on conflict (id) do nothing;
    execute 'drop policy if exists ll_assets_insert on storage.objects';
    execute 'drop policy if exists ll_assets_delete on storage.objects';
    execute $p$create policy ll_assets_insert on storage.objects for insert to authenticated
             with check (bucket_id = 'assets' and public.ll_level() >= 3)$p$;
    execute $p$create policy ll_assets_delete on storage.objects for delete to authenticated
             using (bucket_id = 'assets' and public.ll_level() >= 3)$p$;
  end if;
end $$;
