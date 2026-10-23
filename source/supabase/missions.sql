-- Feature 5: real-life missions. Parents confirm missions at msn/{parent}/x/{id};
-- families see only their own children's confirmations; trainers assign missions to a
-- batch (tw records of kind 'msnassign' listing the learners). Safe to run again.
insert into public.ll_rules(pattern, r, w) values ('msn/*/x/*', 2, 3), ('msn/{self}/x/*', 2, 2)
on conflict (pattern) do update set r = excluded.r, w = excluded.w;
do $$
declare d text;
  lst_old text := '''wall'',''boards'')';
  lst_new text := '''wall'',''boards'',''msn'')';
  br text := '  elsif top = ''msn'' then /*ll-msn*/
    return query select d.path, d.data from docs d where d.parent = p and d.data->>''lid'' = any(f.lids);
  elsif top = ''sessions'' then';
  a1 text := 'or (d.data->>''kind'' in (''settings'',''run'') and seg2 = any(f.tuids)));';
  b1 text := 'or (d.data->>''kind'' in (''settings'',''run'') and seg2 = any(f.tuids))
      or (d.data->>''kind'' = ''msnassign'' and coalesce(d.data->''lids'',''[]''::jsonb) ?| f.lids)); /*ll-msnassign*/';
  a2 text := 'if k in (''settings'',''run'') then return s2 = any(tuids); end if;';
  b2 text := 'if k in (''settings'',''run'') then return s2 = any(tuids); end if;
    if k = ''msnassign'' then return coalesce(d->''lids'',''[]''::jsonb) ?| lids; end if; /*ll-msnassign*/';
begin
  d := pg_get_functiondef('public.ll_fetch(text)'::regprocedure);
  if strpos(d, 'll-msn*/') = 0 then
    if strpos(d, lst_old) = 0 or strpos(d, a1) = 0 then raise exception 'll_fetch anchors not found (run boards.sql first)'; end if;
    d := replace(d, lst_old, lst_new);
    d := replace(d, '  elsif top = ''sessions'' then', br);
    d := replace(d, a1, b1);
    execute d;
  end if;
  d := pg_get_functiondef('public.ll_row_ok(text,jsonb,jsonb)'::regprocedure);
  if strpos(d, 'll-msnassign') = 0 then
    if strpos(d, lst_old) = 0 or strpos(d, a2) = 0 then raise exception 'll_row_ok anchors not found'; end if;
    d := replace(d, lst_old, lst_new);
    d := replace(d, a2, b2);
    execute d;
  end if;
end $$;
select (select count(*) from pg_proc where proname = 'll_fetch' and prosrc like '%ll-msn*/%' and prosrc like '%ll-msnassign%') as fetch_ok,
       (select count(*) from pg_proc where proname = 'll_row_ok' and prosrc like '%ll-msnassign%') as rowok_ok;
