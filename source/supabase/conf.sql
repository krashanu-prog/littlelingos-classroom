-- Feature 2: families can read the trainer's confidence rating for their own child
-- (tw records of kind 'conf', filtered by learner). Safe to run again.
do $$
declare fn text; d text;
begin
  foreach fn in array array['public.ll_fetch(text)','public.ll_row_ok(text,jsonb,jsonb)'] loop
    d := pg_get_functiondef(fn::regprocedure);
    if strpos(d, '''adapt'',''conf''') = 0 then
      d := replace(d, '''report'',''adapt'')', '''report'',''adapt'',''conf'')');
      if strpos(d, '''adapt'',''conf''') = 0 then raise exception 'pattern not found in % (run adapt.sql first)', fn; end if;
      execute d;
    end if;
  end loop;
end $$;
select count(*) as patched from pg_proc where proname in ('ll_fetch','ll_row_ok') and prosrc like '%''adapt'',''conf''%';
