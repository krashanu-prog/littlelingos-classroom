-- =====================================================================
-- LittleLingos security update (v2). Run after schema.sql and auto-link.sql.
-- Safe to run again.
--  * Families only see their own children's data (server-side filtering)
--  * Everything not explicitly allowed is blocked; size limits
--  * Only the admin can approve reports, decide leave, change clocked hours
--  * Live updates no longer reveal record names; access changes show live
--  * Faster reads; admin must have a confirmed email; functions locked down
-- =====================================================================

-- ---------- who is who ------------------------------------------------
create or replace function public.ll_level_of(u uuid) returns int
language sql stable security definer set search_path = public as $$
  select case
    when u is null then 0
    when exists (select 1 from auth.users au join ll_admins a on lower(a.email) = lower(au.email)
                 where au.id = u and au.email_confirmed_at is not null) then 4
    when exists (select 1 from docs d where d.parent = 'trainers' and d.data->>'uid' = u::text
                 and coalesce(d.data->>'active','true') <> 'false') then 3
    when exists (select 1 from docs d where d.parent = 'learners' and coalesce(d.data->>'active','true') <> 'false'
                 and (d.data->>'uid' = u::text or coalesce(d.data->'parents','[]'::jsonb) ? u::text)) then 2
    else 1 end;
$$;
create or replace function public.ll_level() returns int
language sql stable security definer set search_path = public as $$ select ll_level_of(auth.uid()); $$;

-- The signed-in family's children (learner ids), the family's account ids,
-- their courses and their trainers' account ids.
create or replace function public.ll_family() returns table(lids text[], uids text[], courses text[], tuids text[])
language sql stable security definer set search_path = public as $$
  with me as (select auth.uid()::text as u),
  kids as (select split_part(d.path,'/',2) as lid, d.data from docs d, me
           where d.parent = 'learners' and coalesce(d.data->>'active','true') <> 'false'
             and (d.data->>'uid' = me.u or coalesce(d.data->'parents','[]'::jsonb) ? me.u)),
  tids as (select data->>'trainerId' as tid from kids where coalesce(data->>'trainerId','') <> ''
           union select b.data->>'tid' from docs b where b.parent = 'batches' and coalesce(b.data->>'tid','') <> ''
             and coalesce(b.data->'learners','[]'::jsonb) ?| (select coalesce(array_agg(lid),'{}') from kids))
  select coalesce((select array_agg(lid) from kids),'{}'),
         (select array_agg(distinct x) from (select u as x from me union all select data->>'uid' from kids where coalesce(data->>'uid','') <> '') q),
         coalesce((select array_agg(distinct c) from kids, jsonb_array_elements_text(coalesce(kids.data->'courses','[]'::jsonb)) c),'{}'),
         coalesce((select array_agg(distinct t.data->>'uid') from docs t where t.parent = 'trainers'
                   and split_part(t.path,'/',2) in (select tid from tids) and coalesce(t.data->>'uid','') <> ''),'{}');
$$;

-- ---------- rules: exact-depth patterns, deny by default --------------
-- '*' = any one segment, '{self}' = your own account id. Pattern must match
-- the whole path. Anything without a rule: admin only.
delete from public.ll_rules;
insert into public.ll_rules(pattern, r, w) values
  ('config/*',               1, 4),
  ('learners/*',             2, 4),
  ('trainers/*',             2, 4),
  ('notices/*',              2, 4),
  ('fees/*',                 4, 4),
  ('private/*',              4, 4),
  ('profiles/*',             2, 4),
  ('profiles/{self}',        1, 1),
  ('progress/*',             2, 4),
  ('progress/{self}',        2, 2),
  ('answers/*',              2, 4),
  ('answers/{self}',         2, 2),
  ('tw/*/x/*',               2, 4),
  ('tw/{self}/x/*',          2, 3),
  ('kp/*/x/*',               2, 4),
  ('kp/{self}/x/*',          2, 2),
  ('timesheets/*/e/*',       4, 4),
  ('timesheets/{self}/e/*',  3, 3),
  ('contacts/index',         4, 4),
  ('contacts/*/l/*',         4, 4),
  ('contacts/*/p/*',         4, 4),
  ('contacts/{self}/l/*',    3, 4),
  ('contacts/{self}/p/*',    3, 4),
  ('courses/*',              2, 3),
  ('lessons/*',              2, 3),
  ('sessions/*',             2, 3),
  ('library/*',              2, 3),
  ('pp/*/x/*',               3, 3),
  ('pp/{self}/x/*',          2, 2),
  ('ppi/*',                  3, 3),
  ('ppi/{self}',             2, 2),
  ('pf/*',                   4, 4),
  ('pf/{self}',              2, 4),
  ('ptm/*',                  2, 3),
  ('ptmb/*',                 2, 4),
  ('ptmb/{self}',            2, 2),
  ('ad/settings',            4, 4),
  ('ad/*/x/*',               4, 4),
  ('batches/*',              2, 4),
  ('events/*',               2, 4),
  ('evr/*',                  2, 4),
  ('evr/{self}',             2, 2);

create or replace function public.ll_match(pat text, p text) returns boolean
language sql stable set search_path = public as $$
  with a as (select string_to_array(pat,'/') ps, string_to_array(p,'/') xs)
  select cardinality(ps) = cardinality(xs)
     and not exists (select 1 from generate_subscripts(ps,1) i
                     where not (ps[i] = xs[i] or ps[i] = '*'
                                or (ps[i] = '{self}' and xs[i] = coalesce(auth.uid()::text,'-'))))
  from a;
$$;
-- most specific = fewest wildcards
create or replace function public.ll_need(p text, op text) returns int
language sql stable security definer set search_path = public as $$
  select coalesce((
    select case when op = 'r' then r else w end from ll_rules
    where ll_match(pattern, p) and (case when op = 'r' then r else w end) is not null
    order by (length(pattern) - length(replace(pattern,'*',''))) asc,
             (length(pattern) - length(replace(pattern,'{self}',''))) asc
    limit 1), 4);
$$;

-- ---------- size limits and bookkeeping --------------------------------
do $$ begin
  alter table public.docs drop constraint if exists docs_size_ck;
  alter table public.docs add constraint docs_size_ck check (length(path) <= 300 and pg_column_size(data) <= 700000);
end $$;

create or replace function public.ll_merge(a jsonb, b jsonb, depth int default 0) returns jsonb
language plpgsql immutable set search_path = public as $$
declare k text; v jsonb; out jsonb := coalesce(a,'{}'::jsonb);
begin
  if depth > 12 then raise exception 'too deep'; end if;
  if b is null or jsonb_typeof(b) <> 'object' then return out; end if;
  for k, v in select * from jsonb_each(b) loop
    if jsonb_typeof(v) = 'object' and jsonb_typeof(out->k) = 'object' then
      out := jsonb_set(out, array[k], ll_merge(out->k, v, depth + 1));
    else
      out := out || jsonb_build_object(k, v);
    end if;
  end loop;
  return out;
end $$;
drop function if exists public.ll_merge(jsonb, jsonb);

create or replace function public.ll_update(p text, patch jsonb) returns void
language plpgsql security invoker set search_path = public as $$
begin
  if pg_column_size(patch) > 700000 then raise exception 'too large'; end if;
  update docs set data = ll_merge(data, patch) where path = p;
  if not found then raise exception 'missing' using errcode = 'P0002'; end if;
end $$;

-- Guards that run on every write (also enforce the admin-only fields).
create or replace function public.ll_guard() returns trigger
language plpgsql security definer set search_path = public as $$
declare lvl int; top text; kind text; st timestamptz; en timestamptz; cnt int;
begin
  if tg_op = 'DELETE' then
    lvl := ll_level();
    if lvl < 4 and old.path like 'timesheets/%' then raise exception 'Only the admin can delete timesheet entries' using errcode = '42501'; end if;
    return old;
  end if;
  new.updated_at := now();
  new.updated_by := auth.uid();
  if auth.uid() is null then return new; end if;           -- SQL editor / service tasks
  lvl := ll_level();
  if lvl >= 4 then return new; end if;
  top := split_part(new.path,'/',1);
  if top = 'profiles' and pg_column_size(new.data) > 20000 then raise exception 'Profile too large'; end if;
  if tg_op = 'INSERT' and position('/' in new.parent) > 0 then
    select count(*) into cnt from docs where parent = new.parent;
    if lvl < 3 and cnt >= 1000 then raise exception 'Too many records' using errcode = '42501'; end if;
  end if;
  -- trainer work documents
  if top = 'tw' then
    kind := new.data->>'kind';
    if kind = 'report' then
      new.data := new.data - 'approved' - 'approvedAt';
      if tg_op = 'UPDATE' then
        new.data := new.data || jsonb_strip_nulls(jsonb_build_object('approved', old.data->'approved', 'approvedAt', old.data->'approvedAt'));
      end if;
    elsif kind = 'leave' then
      if tg_op = 'INSERT' then
        new.data := (new.data - 'subs' - 'reply' - 'decidedAt') || '{"status":"pending"}'::jsonb;
      else
        new.data := (new.data - 'status' - 'subs' - 'reply' - 'decidedAt')
          || jsonb_strip_nulls(jsonb_build_object('status', old.data->'status', 'subs', old.data->'subs', 'reply', old.data->'reply', 'decidedAt', old.data->'decidedAt'));
      end if;
    end if;
  end if;
  -- clocked hours: only "clock in now", "clock out now" or a flagged late fix
  if top = 'timesheets' then
    if tg_op = 'INSERT' then
      st := (new.data->>'startAt')::timestamptz;
      if coalesce(new.data->>'status','') <> 'present' or st is null or abs(extract(epoch from st - now())) > 900
         or new.data->>'endAt' is not null then
        raise exception 'Clock in with the Clock in button' using errcode = '42501';
      end if;
    else
      if old.data->>'endAt' is not null then raise exception 'This entry is already closed. Ask the admin to change it.' using errcode = '42501'; end if;
      en := (new.data->>'endAt')::timestamptz; st := (old.data->>'startAt')::timestamptz;
      if en is null or en <= st or en > now() + interval '5 minutes' or en > st + interval '16 hours'
         or ((new.data->>'fixedLater') is distinct from 'true' and abs(extract(epoch from en - now())) > 900) then
        raise exception 'That clock-out time is not allowed' using errcode = '42501';
      end if;
      new.data := old.data || jsonb_build_object('endAt', new.data->'endAt') ||
                  case when new.data ? 'fixedLater' then jsonb_build_object('fixedLater', true) else '{}'::jsonb end;
    end if;
  end if;
  -- parent-teacher meetings: one family per slot
  if top = 'ptmb' and coalesce(new.data->>'slot','') <> '' then
    if exists (select 1 from docs where parent = 'ptmb' and path <> new.path and data->>'slot' = new.data->>'slot') then
      raise exception 'Someone just booked this slot. Pick another.' using errcode = '42501';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists ll_guard on public.docs;
create trigger ll_guard before insert or update or delete on public.docs
  for each row execute function public.ll_guard();

-- ---------- table access: direct reads only for what you can write ----
alter table public.docs enable row level security;
drop policy if exists docs_read on public.docs;
drop policy if exists docs_insert on public.docs;
drop policy if exists docs_update on public.docs;
drop policy if exists docs_delete on public.docs;
create policy docs_read   on public.docs for select to authenticated using ((select ll_level()) = 4 or (select ll_level()) >= ll_need(path,'w'));
create policy docs_insert on public.docs for insert to authenticated with check ((select ll_level()) = 4 or (select ll_level()) >= ll_need(path,'w'));
create policy docs_update on public.docs for update to authenticated using ((select ll_level()) = 4 or (select ll_level()) >= ll_need(path,'w'))
                                                    with check ((select ll_level()) = 4 or (select ll_level()) >= ll_need(path,'w'));
create policy docs_delete on public.docs for delete to authenticated using ((select ll_level()) = 4 or (select ll_level()) >= ll_need(path,'w'));

-- ---------- reading: filtered per family -------------------------------
create or replace function public.ll_pick(o jsonb, keys text[]) returns jsonb
language sql immutable set search_path = public as $$
  select coalesce((select jsonb_object_agg(k, v) from jsonb_each(coalesce(o,'{}'::jsonb)) e(k, v) where k = any(keys)), '{}'::jsonb);
$$;
create or replace function public.ll_keep(a jsonb, keys text[]) returns jsonb
language sql immutable set search_path = public as $$
  select coalesce((select jsonb_agg(x) from jsonb_array_elements_text(coalesce(a,'[]'::jsonb)) x where x = any(keys)), '[]'::jsonb);
$$;

create or replace function public.ll_fetch(p text) returns table(path text, data jsonb)
language plpgsql stable security definer set search_path = public as $$
declare lvl int := ll_level(); me text := coalesce(auth.uid()::text,'-'); base int; mine int;
        top text := split_part(p,'/',1); seg2 text := split_part(p,'/',2);
        f record;
begin
  if lvl = 0 or p is null or p = '' then return; end if;
  base := ll_need(p || '/~', 'r');
  mine := ll_need(p || '/' || me, 'r');
  if lvl >= 3 or top not in ('learners','profiles','progress','answers','kp','tw','sessions','batches','ptmb','evr') then
    return query select d.path, d.data from docs d where d.parent = p
      and lvl >= (case when d.path = p || '/' || me then mine else base end);
    return;
  end if;
  if lvl < base and lvl < mine then return; end if;
  select * into f from ll_family();
  if top = 'learners' then
    return query select d.path, d.data from docs d where d.parent = p and split_part(d.path,'/',2) = any(f.lids);
  elsif top = 'profiles' then
    return query select d.path, d.data from docs d where d.parent = p and d.path = p || '/' || me
      union all
      select d.path, jsonb_strip_nulls(jsonb_build_object('displayName', d.data->'displayName', 'role', d.data->'role', 'tz', d.data->'tz'))
      from docs d where d.parent = p and split_part(d.path,'/',2) = any(f.tuids) and d.path <> p || '/' || me;
  elsif top in ('progress','answers') then
    return query select d.path, d.data from docs d where d.parent = p and split_part(d.path,'/',2) = any(f.uids);
  elsif top = 'kp' then
    if seg2 = any(f.uids) then return query select d.path, d.data from docs d where d.parent = p; end if;
  elsif top = 'tw' then
    return query select d.path,
      case d.data->>'kind'
        when 'mark' then d.data || jsonb_build_object('m', ll_pick(d.data->'m', f.lids), 'notes', ll_pick(d.data->'notes', f.lids))
        when 'hw' then d.data || jsonb_build_object('feedback', ll_pick(d.data->'feedback', f.lids), 'learnerIds', ll_keep(d.data->'learnerIds', f.lids))
        else d.data end
    from docs d where d.parent = p and (
      (d.data->>'kind' in ('assess','award','sticker','pc','voice','report') and d.data->>'lid' = any(f.lids))
      or (d.data->>'kind' = 'mark' and coalesce(d.data->'m','{}'::jsonb) ?| f.lids)
      or (d.data->>'kind' = 'hw' and (coalesce(d.data->'learnerIds','[]'::jsonb) ?| f.lids
            or (jsonb_array_length(coalesce(d.data->'learnerIds','[]'::jsonb)) = 0 and d.data->>'courseId' = any(f.courses))))
      or (d.data->>'kind' = 'note' and ((d.data->>'audience' = 'course' and d.data->>'courseId' = any(f.courses))
            or (coalesce(d.data->>'audience','') <> 'course' and seg2 = any(f.tuids))))
      or (d.data->>'kind' in ('settings','run') and seg2 = any(f.tuids)));
  elsif top = 'sessions' then
    return query select d.path, (d.data - 'plan') || jsonb_build_object('forLids', ll_keep(d.data->'forLids', f.lids))
    from docs d where d.parent = p and (
      coalesce(d.data->'forLids','[]'::jsonb) ?| f.lids
      or (jsonb_array_length(coalesce(d.data->'forLids','[]'::jsonb)) = 0 and d.data->>'courseId' = any(f.courses)));
  elsif top = 'batches' then
    return query select d.path, d.data || jsonb_build_object('learners', ll_keep(d.data->'learners', f.lids))
    from docs d where d.parent = p and coalesce(d.data->'learners','[]'::jsonb) ?| f.lids;
  elsif top = 'ptmb' then
    return query select d.path, d.data from docs d where d.parent = p and d.path = p || '/' || me
      union all
      select p || '/h' || left(md5(d.path),12), jsonb_build_object('slot', d.data->'slot')
      from docs d where d.parent = p and d.path <> p || '/' || me;
  elsif top = 'evr' then
    return query select d.path, d.data from docs d where d.parent = p and d.path = p || '/' || me
      union all
      select p || '/h' || left(md5(d.path),12),
             jsonb_build_object('regs', coalesce((select jsonb_object_agg(k, '{}'::jsonb) from jsonb_object_keys(coalesce(d.data->'regs','{}'::jsonb)) k), '{}'::jsonb))
      from docs d where d.parent = p and d.path <> p || '/' || me;
  end if;
end $$;

create or replace function public.ll_fetch_doc(p text) returns table(path text, data jsonb)
language sql stable security definer set search_path = public as $$
  select f.path, f.data from ll_fetch(regexp_replace(p, '/[^/]+$', '')) f where f.path = p;
$$;

-- Who am I + a fingerprint of what I can see (the app reloads when it changes).
create or replace function public.ll_whoami() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('level', ll_level(),
    'scope', md5(coalesce((select array_to_string(lids,',') || '|' || array_to_string(uids,',') || '|' || array_to_string(courses,',') || '|' || array_to_string(tuids,',') from ll_family()),'')));
$$;

-- ---------- live updates without record names --------------------------
create table if not exists public.ll_changes (topic text primary key, at timestamptz not null default now());
alter table public.ll_changes enable row level security;
create or replace function public.ll_topic_ok(t text) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare lvl int := ll_level(); s2 text := split_part(t,'/',2); f record;
begin
  if lvl = 0 then return false; end if;
  if t = '_access' or lvl >= 3 then return true; end if;
  if s2 !~ '^[0-9a-f-]{36}$' then return true; end if;
  if s2 = auth.uid()::text then return true; end if;
  select * into f from ll_family();
  return s2 = any(f.uids) or s2 = any(f.tuids);
end $$;
drop policy if exists ll_changes_read on public.ll_changes;
create policy ll_changes_read on public.ll_changes for select to authenticated using (ll_topic_ok(topic));

create or replace function public.ll_bump() returns trigger
language plpgsql security definer set search_path = public as $$
declare t text := coalesce(new.parent, old.parent);
begin
  insert into ll_changes(topic, at) values (t, now()) on conflict (topic) do update set at = excluded.at;
  if t in ('learners','trainers','batches') then
    insert into ll_changes(topic, at) values ('_access', now()) on conflict (topic) do update set at = excluded.at;
  end if;
  return null;
end $$;
drop trigger if exists ll_bump on public.docs;
create trigger ll_bump after insert or update or delete on public.docs for each row execute function public.ll_bump();

do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'docs') then
      execute 'alter publication supabase_realtime drop table public.docs';
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'll_changes') then
      execute 'alter publication supabase_realtime add table public.ll_changes';
    end if;
  end if;
end $$;

-- ---------- names: only for connected people ---------------------------
create or replace function public.ll_people_ok(id uuid) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare lvl int := ll_level(); f record;
begin
  if id = auth.uid() or lvl >= 3 then return true; end if;
  if lvl < 2 then return false; end if;
  if exists (select 1 from docs t where t.parent = 'trainers' and t.data->>'uid' = id::text) then return true; end if;
  if ll_level_of(id) >= 4 then return true; end if;
  select * into f from ll_family();
  return id::text = any(f.uids)
      or exists (select 1 from docs l where l.parent = 'learners' and split_part(l.path,'/',2) = any(f.lids) and l.data->'parents' ? id::text);
end $$;
drop policy if exists people_read on public.people;
create policy people_read on public.people for select to authenticated using (ll_people_ok(id));

create or replace function public.ll_people_from_profile() returns trigger
language plpgsql security definer set search_path = public as $$
declare uid text := split_part(new.path,'/',2);
begin
  if new.parent = 'profiles' and uid ~ '^[0-9a-f-]{36}$' and coalesce(new.data->>'displayName','') <> ''
     and ll_level_of(uid::uuid) >= 2 then
    insert into people(id, name) values (uid::uuid, left(new.data->>'displayName', 80))
    on conflict (id) do update set name = excluded.name;
  end if;
  return new;
end $$;
-- when someone gets connected, copy their chosen name across
create or replace function public.ll_people_on_link() returns trigger
language plpgsql security definer set search_path = public as $$
declare u text;
begin
  for u in select jsonb_array_elements_text(coalesce(new.data->'parents','[]'::jsonb)) union select new.data->>'uid' loop
    if u ~ '^[0-9a-f-]{36}$' then
      insert into people(id, name)
      select u::uuid, left(p.data->>'displayName',80) from docs p where p.path = 'profiles/' || u and coalesce(p.data->>'displayName','') <> ''
      on conflict (id) do update set name = excluded.name;
    end if;
  end loop;
  return null;
end $$;
drop trigger if exists ll_people_on_link on public.docs;
create trigger ll_people_on_link after insert or update on public.docs
  for each row when (new.parent in ('learners','trainers')) execute function public.ll_people_on_link();

-- ---------- file uploads ------------------------------------------------
do $$ begin
  if exists (select 1 from information_schema.schemata where schema_name = 'storage') then
    update storage.buckets set file_size_limit = 26214400,
      allowed_mime_types = array['image/*','audio/*','video/*','application/pdf','text/plain',
        'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation']
      where id = 'assets';
    execute 'drop policy if exists ll_assets_delete on storage.objects';
    execute $p$create policy ll_assets_delete on storage.objects for delete to authenticated
             using (bucket_id = 'assets' and (owner_id = auth.uid()::text or public.ll_level() >= 4))$p$;
  end if;
end $$;

-- ---------- lock down functions and tables ------------------------------
revoke all on public.docs, public.people, public.ll_changes, public.ll_rules, public.ll_admins from anon;
revoke all on public.ll_rules, public.ll_admins from authenticated;
grant select, insert, update, delete on public.docs to authenticated;
grant select on public.people, public.ll_changes to authenticated;
do $$ declare r record; begin
  for r in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.proname like 'll\_%' loop
    execute 'revoke all on function ' || r.sig || ' from public, anon, authenticated';
  end loop;
end $$;
grant execute on function public.ll_level(), public.ll_level_of(uuid), public.ll_need(text,text), public.ll_match(text,text),
  public.ll_merge(jsonb,jsonb,int), public.ll_update(text,jsonb), public.ll_link(), public.ll_accounts(text[]),
  public.ll_fetch(text), public.ll_fetch_doc(text), public.ll_whoami(), public.ll_topic_ok(text), public.ll_people_ok(uuid),
  public.ll_family(), public.ll_pick(jsonb,text[]), public.ll_keep(jsonb,text[]) to authenticated;
