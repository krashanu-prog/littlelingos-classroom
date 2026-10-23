-- Fix: a child's app can read the screen-time limit their own parents set
-- (only displayName, role and limits of the child's own parents). Safe to run again.
do $$
declare d text;
  anchor text := 'from docs d where d.parent = p and split_part(d.path,''/'',2) = any(f.tuids) and d.path <> p || ''/'' || me;';
  addon text := 'from docs d where d.parent = p and split_part(d.path,''/'',2) = any(f.tuids) and d.path <> p || ''/'' || me
      union all
      select d.path, jsonb_strip_nulls(jsonb_build_object(''displayName'', d.data->''displayName'', ''role'', d.data->''role'', ''limits'', d.data->''limits''))
      from docs d where d.parent = p and d.path <> p || ''/'' || me and not (split_part(d.path,''/'',2) = any(f.tuids))
        and split_part(d.path,''/'',2) in (select jsonb_array_elements_text(coalesce(l.data->''parents'',''[]''::jsonb)) from docs l
                                           where l.parent = ''learners'' and split_part(l.path,''/'',2) = any(f.lids)); /*ll-parent-limits*/';
begin
  d := pg_get_functiondef('public.ll_fetch(text)'::regprocedure);
  if strpos(d, 'll-parent-limits') = 0 then
    if strpos(d, anchor) = 0 then raise exception 'anchor not found'; end if;
    d := replace(d, anchor, addon);
    execute d;
  end if;
end $$;
select count(*) as patched from pg_proc where proname = 'll_fetch' and prosrc like '%ll-parent-limits%';
