-- =====================================================================
-- LittleLingos security update (v6). Run after security-v5.sql. Safe to run again.
-- Every class must name its learners. A new class with no learners is refused,
-- and a class can't be changed to have no learners. (Older classes without
-- learners can still be edited to add them, cancelled, or marked complete.)
-- =====================================================================
create or replace function public.ll_class_needs_learners() returns trigger
language plpgsql as $$
declare n int;
begin
  if new.path !~ '^sessions/[^/]+$' then return new; end if;
  n := case when jsonb_typeof(new.data->'forLids') = 'array' then jsonb_array_length(new.data->'forLids') else 0 end;
  if n = 0 and (tg_op = 'INSERT' or coalesce(old.data->'forLids', '[]'::jsonb) is distinct from coalesce(new.data->'forLids', '[]'::jsonb)) then
    raise exception 'Pick at least one learner for this class.' using errcode = 'P0001';
  end if;
  return new;
end $$;
drop trigger if exists ll_class_needs_learners on public.docs;
create trigger ll_class_needs_learners before insert or update on public.docs
  for each row execute function public.ll_class_needs_learners();
select count(*) as trigger_ok from pg_trigger where tgname = 'll_class_needs_learners';
