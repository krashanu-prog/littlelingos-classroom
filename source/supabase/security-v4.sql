-- =====================================================================
-- LittleLingos security update (v4). Run after security-v3.sql. Safe to run again.
-- A class or homework set for a whole course used to reach every learner on that
-- course, including other trainers' learners (with the class join link).
-- Now it reaches only the learners of the trainer who set it (on the learner's
-- record or through a batch). A learner with no trainer yet still sees the whole course. Items from the admin, and classes with no trainer,
-- still reach the whole course. Classes and homework for chosen learners are unchanged.
-- =====================================================================

-- trainer record ids for these learners (learner.trainerId plus their batches' trainer)
create or replace function public.ll_fam_tids(lids text[]) returns text[]
language sql stable security definer set search_path = public as $$
  select coalesce(array_agg(distinct t), '{}') from (
    select l.data->>'trainerId' t from docs l
     where l.parent = 'learners' and split_part(l.path,'/',2) = any(lids) and coalesce(l.data->>'trainerId','') <> ''
    union
    select b.data->>'tid' from docs b
     where b.parent = 'batches' and coalesce(b.data->>'tid','') <> '' and coalesce(b.data->'learners','[]'::jsonb) ?| lids) x;
$$;

-- was this course-wide item set by one of the family's trainers, or by the admin?
create or replace function public.ll_author_ok(a text, tuids text[]) returns boolean
language sql stable security definer set search_path = public as $$
  select a = any(tuids) or cardinality(tuids) = 0
      or (a ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' and ll_level_of(a::uuid) >= 4);
$$;
revoke all on function public.ll_fam_tids(text[]), public.ll_author_ok(text, text[]) from public, anon, authenticated;

do $$
declare d text;
begin
  -- ll_fetch: what the app reads
  d := pg_get_functiondef('public.ll_fetch(text)'::regprocedure);
  if strpos(d, 'll-v4') = 0 then
    if (length(d) - length(replace(d, $a$or (jsonb_array_length(coalesce(d.data->'forLids','[]'::jsonb)) = 0 and d.data->>'courseId' = any(f.courses)));$a$, ''))) = 0
      then raise exception 'll_fetch sessions anchor not found'; end if;
    d := replace(d, $a$or (jsonb_array_length(coalesce(d.data->'forLids','[]'::jsonb)) = 0 and d.data->>'courseId' = any(f.courses)));$a$,
                    $a$or (jsonb_array_length(coalesce(d.data->'forLids','[]'::jsonb)) = 0 and d.data->>'courseId' = any(f.courses)
                and (coalesce(d.data->>'trainerId','') = '' or cardinality(ll_fam_tids(f.lids)) = 0 or d.data->>'trainerId' = any(ll_fam_tids(f.lids))))); /*ll-v4*/$a$);
    if strpos(d, $a$and d.data->>'courseId' = any(f.courses))))$a$) = 0 then raise exception 'll_fetch homework anchor not found'; end if;
    d := replace(d, $a$and d.data->>'courseId' = any(f.courses))))$a$, $a$and d.data->>'courseId' = any(f.courses) and ll_author_ok(seg2, f.tuids))))$a$);
    if strpos(d, $a$(d.data->>'audience' = 'course' and d.data->>'courseId' = any(f.courses))$a$) = 0 then raise exception 'll_fetch notes anchor not found'; end if;
    d := replace(d, $a$(d.data->>'audience' = 'course' and d.data->>'courseId' = any(f.courses))$a$,
                    $a$(d.data->>'audience' = 'course' and d.data->>'courseId' = any(f.courses) and ll_author_ok(seg2, f.tuids))$a$);
    execute d;
  end if;
  -- ll_row_ok: direct reads by older copies of the app
  d := pg_get_functiondef('public.ll_row_ok(text,jsonb,jsonb)'::regprocedure);
  if strpos(d, 'll-v4') = 0 then
    if strpos(d, $a$or (jsonb_array_length(coalesce(d->'forLids','[]'::jsonb)) = 0 and d->>'courseId' = any(courses));$a$) = 0
      then raise exception 'll_row_ok sessions anchor not found'; end if;
    d := replace(d, $a$or (jsonb_array_length(coalesce(d->'forLids','[]'::jsonb)) = 0 and d->>'courseId' = any(courses));$a$,
                    $a$or (jsonb_array_length(coalesce(d->'forLids','[]'::jsonb)) = 0 and d->>'courseId' = any(courses)
            and (coalesce(d->>'trainerId','') = '' or cardinality(ll_fam_tids(lids)) = 0 or d->>'trainerId' = any(ll_fam_tids(lids)))); /*ll-v4*/$a$);
    if strpos(d, $a$or (jsonb_array_length(coalesce(d->'learnerIds','[]'::jsonb)) = 0 and d->>'courseId' = any(courses)))$a$) = 0
      then raise exception 'll_row_ok homework anchor not found'; end if;
    d := replace(d, $a$or (jsonb_array_length(coalesce(d->'learnerIds','[]'::jsonb)) = 0 and d->>'courseId' = any(courses)))$a$,
                    $a$or (jsonb_array_length(coalesce(d->'learnerIds','[]'::jsonb)) = 0 and d->>'courseId' = any(courses) and ll_author_ok(s2, tuids)))$a$);
    if strpos(d, $a$(d->>'audience' = 'course' and d->>'courseId' = any(courses))$a$) = 0 then raise exception 'll_row_ok notes anchor not found'; end if;
    d := replace(d, $a$(d->>'audience' = 'course' and d->>'courseId' = any(courses))$a$,
                    $a$(d->>'audience' = 'course' and d->>'courseId' = any(courses) and ll_author_ok(s2, tuids))$a$);
    execute d;
  end if;
end $$;

select (select count(*) from pg_proc where proname = 'll_fetch' and prosrc like '%ll-v4%') as fetch_ok,
       (select count(*) from pg_proc where proname = 'll_row_ok' and prosrc like '%ll-v4%') as rowok_ok;
