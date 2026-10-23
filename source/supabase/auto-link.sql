-- =====================================================================
-- LittleLingos: connect accounts automatically by email.
-- When someone signs in with an email the admin entered on a trainer or
-- learner record, their account is connected straight away.
--   trainer  -> private/<trainer id>.loginEmail
--   parent   -> private/<learner id>.email  or  .email2
--   learner  -> private/<learner id>.studentEmail
-- Safe to run again.
-- =====================================================================
create or replace function public.ll_link_user(uid uuid, em text) returns int
language plpgsql security definer set search_path = public as $$
declare n int := 0; r record; u text := uid::text; nm text; rl text;
begin
  em := lower(trim(coalesce(em,'')));
  if em = '' then return 0; end if;
  -- trainers
  if not exists (select 1 from docs where parent='trainers' and data->>'uid' = u) then
    for r in select t.path, t.data->>'name' nm from docs t join docs p on p.path = 'private/' || split_part(t.path,'/',2)
             where t.parent='trainers' and coalesce(t.data->>'uid','') = '' and coalesce(t.data->>'active','true') <> 'false'
               and lower(trim(coalesce(p.data->>'loginEmail',''))) = em limit 1 loop
      update docs set data = jsonb_set(data,'{uid}',to_jsonb(u)), updated_at = now() where path = r.path;
      n := n + 1; nm := r.nm; rl := 'teacher';
    end loop;
  end if;
  -- learner's own account
  if not exists (select 1 from docs where parent='learners' and data->>'uid' = u) then
    for r in select l.path, l.data->>'name' nm from docs l join docs p on p.path = 'private/' || split_part(l.path,'/',2)
             where l.parent='learners' and coalesce(l.data->>'uid','') = '' and coalesce(l.data->>'active','true') <> 'false'
               and lower(trim(coalesce(p.data->>'studentEmail',''))) = em limit 1 loop
      update docs set data = jsonb_set(data,'{uid}',to_jsonb(u)), updated_at = now() where path = r.path;
      n := n + 1; nm := coalesce(nm, r.nm); rl := coalesce(rl,'student');
    end loop;
  end if;
  -- parents
  for r in select l.path, p.data->>'guardian' g, lower(trim(coalesce(p.data->>'email',''))) e1 from docs l join docs p on p.path = 'private/' || split_part(l.path,'/',2)
           where l.parent='learners' and coalesce(l.data->>'active','true') <> 'false'
             and em in (lower(trim(coalesce(p.data->>'email',''))), lower(trim(coalesce(p.data->>'email2',''))))
             and not (coalesce(l.data->'parents','[]'::jsonb) ? u) loop
    update docs set data = jsonb_set(data,'{parents}', coalesce(data->'parents','[]'::jsonb) || to_jsonb(u)), updated_at = now() where path = r.path;
    n := n + 1; rl := coalesce(rl,'parent'); if r.e1 = em then nm := coalesce(nm, nullif(r.g,'')); end if;
  end loop;
  -- make sure they have a profile, so they skip the "who are you" screen
  if rl is not null and not exists (select 1 from docs where path = 'profiles/' || u) then
    insert into docs(path, data) values ('profiles/' || u, jsonb_build_object(
      'displayName', coalesce(nm, (select name from people where id = uid), split_part(em,'@',1)),
      'role', rl, 'createdAt', (extract(epoch from now())*1000)::bigint, 'autoLinked', true));
  end if;
  return n;
end $$;

-- Called by the app after sign-in (links yourself) and after the admin saves
-- a record (links everyone who has already signed in with a matching email).
create or replace function public.ll_link() returns int
language plpgsql security definer set search_path = public as $$
declare n int := 0; r record;
begin
  if auth.uid() is null then return 0; end if;
  for r in select id, email from auth.users
           where email_confirmed_at is not null and (id = auth.uid() or ll_level() >= 4) loop
    n := n + ll_link_user(r.id, r.email);
  end loop;
  return n;
end $$;

revoke all on function public.ll_link_user(uuid, text) from public, anon, authenticated;
grant execute on function public.ll_link() to authenticated;

-- Admin only: which parent/trainer emails have signed in (for the Parents page).
create or replace function public.ll_accounts(emails text[]) returns table(email text, uid uuid, last_sign_in timestamptz)
language sql stable security definer set search_path = public as $$
  select lower(u.email)::text, u.id, u.last_sign_in_at from auth.users u
  where ll_level() >= 4 and lower(u.email) in (select lower(trim(e)) from unnest(emails) e);
$$;
revoke all on function public.ll_accounts(text[]) from public, anon;
grant execute on function public.ll_accounts(text[]) to authenticated;
