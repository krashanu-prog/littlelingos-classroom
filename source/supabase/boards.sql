-- Phase 5: class whiteboards at boards/{id}. Trainers and the admin write them; families
-- see only boards from their own children's courses (as a picture). Safe to run again.
insert into public.ll_rules(pattern, r, w) values ('boards/*', 2, 3)
on conflict (pattern) do update set r = excluded.r, w = excluded.w;
do $$
declare d text;
  lst_old text := '''ptmb'',''evr'',''wall'')';
  lst_new text := '''ptmb'',''evr'',''wall'',''boards'')';
  br text := '  elsif top = ''boards'' then /*ll-boards*/
    return query select d.path, d.data - ''scene'' from docs d where d.parent = p and d.data->>''courseId'' = any(f.courses);
  elsif top = ''sessions'' then';
begin
  d := pg_get_functiondef('public.ll_fetch(text)'::regprocedure);
  if strpos(d, 'll-boards') = 0 then
    if strpos(d, lst_old) = 0 or strpos(d, '  elsif top = ''sessions'' then') = 0 then raise exception 'll_fetch anchors not found (run wall.sql first)'; end if;
    d := replace(d, lst_old, lst_new);
    d := replace(d, '  elsif top = ''sessions'' then', br);
    execute d;
  end if;
  d := pg_get_functiondef('public.ll_row_ok(text,jsonb,jsonb)'::regprocedure);
  if strpos(d, lst_new) = 0 then
    if strpos(d, lst_old) = 0 then raise exception 'll_row_ok anchor not found (run wall.sql first)'; end if;
    execute replace(d, lst_old, lst_new);
  end if;
end $$;
select (select count(*) from pg_proc where proname = 'll_fetch' and prosrc like '%ll-boards%') as fetch_ok,
       (select count(*) from pg_proc where proname = 'll_row_ok' and prosrc like '%''wall'',''boards''%') as rowok_ok;
