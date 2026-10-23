-- Phase 4: Garden wall. Posts live at wall/{id}; only trainers and the admin write them.
-- Families see their own children's approved posts, plus approved posts from the same course
-- when the other child's parents opted in. Reactions go through ll_wall_react only. Safe to run again.
insert into public.ll_rules(pattern, r, w) values ('wall/*', 2, 3)
on conflict (pattern) do update set r = excluded.r, w = excluded.w;

create or replace function public.ll_wall_ok(lid text) returns boolean
language sql stable security definer set search_path = public as $$
  with ps as (select pr.data->'consent'->>'wall' as c
              from docs l, jsonb_array_elements_text(coalesce(l.data->'parents','[]'::jsonb)) u
              join docs pr on pr.path = 'profiles/' || u
              where l.path = 'learners/' || lid)
  select exists (select 1 from ps where c = 'true') and not exists (select 1 from ps where c = 'false');
$$;
revoke all on function public.ll_wall_ok(text) from public, anon;
grant execute on function public.ll_wall_ok(text) to authenticated;

do $$
declare d text;
  lst_old text := 'top not in (''learners'',''profiles'',''progress'',''answers'',''kp'',''tw'',''sessions'',''batches'',''ptmb'',''evr'')';
  lst_new text := 'top not in (''learners'',''profiles'',''progress'',''answers'',''kp'',''tw'',''sessions'',''batches'',''ptmb'',''evr'',''wall'')';
  br text := '  elsif top = ''wall'' then /*ll-wall*/
    return query select d.path, (d.data - ''reacts'') || jsonb_build_object(
        ''rc'', coalesce((select jsonb_object_agg(q.e, q.n) from (select x.v as e, count(*) as n from jsonb_each_text(coalesce(d.data->''reacts'',''{}''::jsonb)) x(k, v) group by x.v) q), ''{}''::jsonb),
        ''mine'', d.data->''reacts''->me)
      from docs d where d.parent = p and d.data->>''status'' = ''approved'' and coalesce(d.data->>''hidden'',''false'') <> ''true''
        and coalesce((d.data->>''at'')::bigint, 0) > (extract(epoch from now()) * 1000)::bigint - 56::bigint * 86400000
        and (d.data->>''lid'' = any(f.lids) or (coalesce(d.data->''courses'',''[]''::jsonb) ?| f.courses and ll_wall_ok(d.data->>''lid'')));
  elsif top = ''sessions'' then';
begin
  d := pg_get_functiondef('public.ll_fetch(text)'::regprocedure);
  if strpos(d, 'll-wall') = 0 then
    if strpos(d, lst_old) = 0 or strpos(d, '  elsif top = ''sessions'' then') = 0 then raise exception 'll_fetch anchors not found'; end if;
    d := replace(d, lst_old, lst_new);
    d := replace(d, '  elsif top = ''sessions'' then', br);
    execute d;
  end if;
  d := pg_get_functiondef('public.ll_row_ok(text,jsonb,jsonb)'::regprocedure);
  if strpos(d, lst_new) = 0 then
    if strpos(d, lst_old) = 0 then raise exception 'll_row_ok anchor not found'; end if;
    execute replace(d, lst_old, lst_new);   -- families read posts only through ll_fetch
  end if;
end $$;

create or replace function public.ll_wall_react(p text, e text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare me text := auth.uid()::text;
begin
  if me is null then raise exception 'Please sign in' using errcode = '42501'; end if;
  if p !~ '^wall/[A-Za-z0-9_-]{1,80}$' then raise exception 'bad post' using errcode = '22023'; end if;
  if e is not null and e not in ('❤️','👏','🌟','😊','🌸') then raise exception 'bad reaction' using errcode = '22023'; end if;
  if ll_level() < 3 and not exists (select 1 from ll_fetch('wall') f where f.path = p) then
    raise exception 'Not allowed' using errcode = '42501';
  end if;
  update docs set data = jsonb_set(data, '{reacts}',
      case when e is null then coalesce(data->'reacts','{}'::jsonb) - me
           else coalesce(data->'reacts','{}'::jsonb) || jsonb_build_object(me, e) end)
    where path = p;
  return (select jsonb_build_object('ok', true) );
end $$;
revoke all on function public.ll_wall_react(text, text) from public, anon;
grant execute on function public.ll_wall_react(text, text) to authenticated;
select (select count(*) from pg_proc where proname = 'll_fetch' and prosrc like '%ll-wall%') as fetch_ok,
       (select count(*) from pg_proc where proname = 'll_row_ok' and prosrc like '%''evr'',''wall''%') as rowok_ok;
