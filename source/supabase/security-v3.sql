-- =====================================================================
-- LittleLingos security update (v3). Run after all earlier files. Safe to run again.
--  * Two-step sign-in (authenticator app): once someone turns it on, their account
--    sees no children's data until they also enter the app code (aal2).
--  * App roles lose table powers they never need (TRUNCATE, TRIGGER, REFERENCES).
--  * Role lookups for other accounts are no longer callable directly.
-- =====================================================================

-- ---------- two-step sign-in -------------------------------------------
create or replace function public.ll_mfa_ok() returns boolean
language plpgsql stable security definer set search_path = public as $$
declare has_factor boolean := false;
begin
  if auth.uid() is null then return true; end if;
  if to_regclass('auth.mfa_factors') is not null then
    execute 'select exists (select 1 from auth.mfa_factors f where f.user_id = $1 and f.status::text = ''verified'')'
      into has_factor using auth.uid();
  end if;
  return not has_factor or coalesce(auth.jwt()->>'aal', 'aal1') = 'aal2';
end $$;

-- the signed-in account, but only once two-step sign-in (if turned on) is complete
create or replace function public.ll_uid() returns uuid
language sql stable security definer set search_path = public as $$
  select case when ll_mfa_ok() then auth.uid() end;
$$;

-- level 1 (no family or staff access) until the second step is done
create or replace function public.ll_level() returns int
language sql stable security definer set search_path = public as $$
  select case when auth.uid() is null then 0
              when ll_mfa_ok() then ll_level_of(auth.uid())
              else least(ll_level_of(auth.uid()), 1) end;
$$;

-- family scope and share links use the checked account id
do $$
declare fn text; d text;
begin
  d := pg_get_functiondef('public.ll_family()'::regprocedure);
  if strpos(d, 'll_uid()') = 0 then
    if strpos(d, 'select auth.uid()::text as u') = 0 then raise exception 'll_family anchor not found'; end if;
    execute replace(d, 'select auth.uid()::text as u', 'select ll_uid()::text as u');
  end if;
  foreach fn in array array['ll_share_create(text,text,text,text,text,bigint,integer)', 'll_share_list()',
      'll_share_update(text,boolean,integer)', 'll_share_delete(text)', 'll_share_replies(text)',
      'll_share_hide(bigint,boolean)', 'll_share_kid()'] loop
    if to_regprocedure('public.' || fn) is null then continue; end if;
    d := pg_get_functiondef(('public.' || fn)::regprocedure);
    if strpos(d, 'auth.uid()') > 0 then execute replace(d, 'auth.uid()', 'll_uid()'); end if;
  end loop;
end $$;

revoke all on function public.ll_mfa_ok(), public.ll_uid() from public, anon;
grant execute on function public.ll_mfa_ok(), public.ll_uid() to authenticated;

-- ---------- least privilege ---------------------------------------------
revoke truncate, trigger, references on all tables in schema public from anon, authenticated;
alter default privileges in schema public revoke truncate, trigger, references on tables from anon, authenticated;
-- ll_level_of(any id) is only used inside other checked functions
revoke execute on function public.ll_level_of(uuid) from public, anon, authenticated;

select (select count(*) from pg_proc where proname = 'll_family' and prosrc like '%ll_uid()%') as family_ok,
       (select count(*) from pg_proc where proname like 'll_share_%' and prosrc like '%auth.uid()%') as share_left,
       has_function_privilege('authenticated', 'public.ll_level_of(uuid)', 'execute') as level_of_open,
       has_table_privilege('authenticated', 'public.docs', 'truncate') as truncate_open;
