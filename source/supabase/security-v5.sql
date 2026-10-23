-- =====================================================================
-- LittleLingos security update (v5). Run after security-v4.sql. Safe to run again.
-- A child (and their parent) now only receives classes they were picked for.
-- A class that names no learners reaches no child at all, so one child can never
-- see another child's class or join link, even under the same trainer.
-- Trial classes and staff views are unchanged.
-- =====================================================================
do $$
declare d text;
begin
  d := pg_get_functiondef('public.ll_fetch(text)'::regprocedure);
  if strpos(d, 'll-v5') = 0 then
    if strpos(d, 'll-v4') = 0 then raise exception 'run security-v4.sql first'; end if;
    d := regexp_replace(d, $r$\s*or \(jsonb_array_length\(coalesce\(d\.data->'forLids','\[\]'::jsonb\)\) = 0 .*?/\*ll-v4\*/$r$, $x$); /*ll-v5*/$x$);
    if strpos(d, 'll-v5') = 0 then raise exception 'll_fetch sessions anchor not found'; end if;
    execute d;
  end if;
  d := pg_get_functiondef('public.ll_row_ok(text,jsonb,jsonb)'::regprocedure);
  if strpos(d, 'll-v5') = 0 then
    if strpos(d, 'll-v4') = 0 then raise exception 'run security-v4.sql first'; end if;
    d := regexp_replace(d, $r$\s*or \(jsonb_array_length\(coalesce\(d->'forLids','\[\]'::jsonb\)\) = 0 .*?/\*ll-v4\*/$r$, $x$; /*ll-v5*/$x$);
    if strpos(d, 'll-v5') = 0 then raise exception 'll_row_ok sessions anchor not found'; end if;
    execute d;
  end if;
end $$;

select (select count(*) from pg_proc where proname = 'll_fetch' and prosrc like '%ll-v5%') as fetch_ok,
       (select count(*) from pg_proc where proname = 'll_row_ok' and prosrc like '%ll-v5%') as rowok_ok;
