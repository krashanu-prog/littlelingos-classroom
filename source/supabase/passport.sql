-- Feature 7: families can read the trainer's passport endorsement for their own child
-- (tw records of kind 'endorse', filtered by learner). Safe to run again.
do $$
declare fn text; d text;
begin
  foreach fn in array array['public.ll_fetch(text)','public.ll_row_ok(text,jsonb,jsonb)'] loop
    d := pg_get_functiondef(fn::regprocedure);
    if strpos(d, '''conf'',''endorse''') = 0 then
      d := replace(d, '''adapt'',''conf'')', '''adapt'',''conf'',''endorse'')');
      if strpos(d, '''conf'',''endorse''') = 0 then raise exception 'pattern not found in % (run conf.sql first)', fn; end if;
      execute d;
    end if;
  end loop;
end $$;
select count(*) as patched from pg_proc where proname in ('ll_fetch','ll_row_ok') and prosrc like '%''conf'',''endorse''%';
