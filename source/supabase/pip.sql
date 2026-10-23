-- Ask Pip: chat records (children's chats and anything flagged), daily limits, role lookup.
-- Only the ask-pip edge function (service role) writes here. Only admins can read chat records.

create table if not exists public.pip_chats (
  id bigserial primary key,
  uid uuid not null,
  role text,
  name text,
  q text,
  a text,
  flagged boolean not null default false,
  reason text,
  at timestamptz not null default now()
);
create index if not exists pip_chats_at on public.pip_chats(at);
alter table public.pip_chats enable row level security;
drop policy if exists pip_chats_admin_read on public.pip_chats;
create policy pip_chats_admin_read on public.pip_chats for select to authenticated using ((select ll_level()) = 4);
drop policy if exists pip_chats_admin_delete on public.pip_chats;
create policy pip_chats_admin_delete on public.pip_chats for delete to authenticated using ((select ll_level()) = 4);

create table if not exists public.pip_usage (
  uid uuid not null,
  day date not null,
  n int not null default 0,
  primary key (uid, day)
);
alter table public.pip_usage enable row level security;

-- Who is asking: admin, trainer, learner (child), parent or guest. Never trust the browser for this.
create or replace function public.ll_pip_ctx(u uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare lvl int := ll_level_of(u); kid record;
begin
  select split_part(d.path,'/',2) as lid, d.data into kid from docs d
   where d.parent = 'learners' and d.data->>'uid' = u::text and coalesce(d.data->>'active','true') <> 'false' limit 1;
  if lvl = 4 then return jsonb_build_object('role','admin');
  elsif lvl = 3 then return jsonb_build_object('role','trainer');
  elsif kid.lid is not null then return jsonb_build_object('role','learner','stage',coalesce(kid.data->>'stage',''),'first',split_part(coalesce(kid.data->>'name',''),' ',1));
  elsif lvl = 2 then return jsonb_build_object('role','parent');
  else return jsonb_build_object('role','guest'); end if;
end $$;

-- Count one question for today and return the new total.
create or replace function public.pip_take(u uuid) returns int
language sql volatile security definer set search_path = public as $$
  insert into pip_usage(uid, day, n) values (u, current_date, 1)
  on conflict (uid, day) do update set n = pip_usage.n + 1
  returning n;
$$;

-- Keep 30 days of records.
create or replace function public.pip_tidy() returns void
language sql volatile security definer set search_path = public as $$
  delete from pip_chats where at < now() - interval '30 days';
  delete from pip_usage where day < current_date - 7;
$$;

revoke all on public.pip_chats, public.pip_usage from anon;
revoke all on public.pip_usage from authenticated;
grant select, delete on public.pip_chats to authenticated;
revoke all on function public.ll_pip_ctx(uuid), public.pip_take(uuid), public.pip_tidy() from public, anon, authenticated;
grant execute on function public.ll_pip_ctx(uuid), public.pip_take(uuid), public.pip_tidy() to service_role;
