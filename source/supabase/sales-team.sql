-- =====================================================================
-- Little Lingos: super admins and the sales team. Run once in the Supabase SQL editor. Safe to run again.
--  * Super admin: an admin who can add and remove sales team members. The first time this runs,
--    every current admin becomes a super admin.
--  * Sales team: people who sign in to show the classroom to new families. They only get the demo
--    screens (child's dashboard and parent dashboard, with a sample child). They are NOT given any
--    access level, so the database never shows them a real child, parent, class or fee.
-- =====================================================================
alter table public.ll_admins add column if not exists super boolean not null default false;
update public.ll_admins set super = true where not exists (select 1 from public.ll_admins where super);

create table if not exists public.ll_sales (
  email    text primary key,
  name     text not null default '',
  added_by uuid,
  added_at timestamptz not null default now());
alter table public.ll_sales enable row level security;      -- no policies: only the functions below can use it
revoke all on public.ll_sales from anon, authenticated;

-- the signed-in account's confirmed email (after two-step sign-in, if it is turned on)
create or replace function public.ll_my_email() returns text
language sql stable security definer set search_path = public as $$
  select lower(au.email) from auth.users au where au.id = ll_uid() and au.email_confirmed_at is not null;
$$;

create or replace function public.ll_is_super() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select a.super from ll_admins a where lower(a.email) = ll_my_email() limit 1), false);
$$;

-- what the app needs to know about the signed-in account
create or replace function public.ll_staff_flags() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'super', ll_is_super(),
    'sales', exists (select 1 from ll_sales s where lower(s.email) = ll_my_email())
             and not exists (select 1 from ll_admins a where lower(a.email) = ll_my_email()));
$$;

create or replace function public.ll_sales_list() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not ll_is_super() then raise exception 'Only a super admin can see the sales team.'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object(
      'email', s.email, 'name', s.name, 'added_at', s.added_at,
      'last_in', (select max(au.last_sign_in_at) from auth.users au where lower(au.email) = s.email))
    order by s.added_at) from ll_sales s), '[]'::jsonb);
end $$;

create or replace function public.ll_sales_add(e text, n text) returns void
language plpgsql security definer set search_path = public as $$
declare em text := lower(trim(coalesce(e, '')));
begin
  if not ll_is_super() then raise exception 'Only a super admin can add sales team members.'; end if;
  if em !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Please enter a valid email address.'; end if;
  if exists (select 1 from ll_admins a where lower(a.email) = em) then raise exception 'This email is already an admin.'; end if;
  insert into ll_sales(email, name, added_by) values (em, left(trim(coalesce(n, '')), 80), ll_uid())
  on conflict (email) do update set name = excluded.name;
end $$;

create or replace function public.ll_sales_remove(e text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not ll_is_super() then raise exception 'Only a super admin can remove sales team members.'; end if;
  delete from ll_sales where email = lower(trim(coalesce(e, '')));
end $$;

revoke all on function public.ll_my_email(), public.ll_is_super(), public.ll_staff_flags(), public.ll_sales_list(),
  public.ll_sales_add(text, text), public.ll_sales_remove(text) from public, anon;
grant execute on function public.ll_staff_flags(), public.ll_sales_list(), public.ll_sales_add(text, text),
  public.ll_sales_remove(text) to authenticated;

select (select count(*) from public.ll_admins where super) as super_admins,
       (select count(*) from public.ll_sales) as sales_team;
