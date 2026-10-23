-- Feature 8: grandparent share links. Safe to run again.
-- Only a parent can create a link, for one item of their own child. The public page
-- (share.html, no sign-in) can only call ll_share_view / ll_share_react with the
-- unguessable token; both tables are closed to direct reads and writes.
create table if not exists public.ll_shares(
  token text primary key,
  owner uuid not null,
  lid text not null,
  first_name text not null,
  kind text not null,
  ref text,
  title text,
  sub text,
  item_at bigint,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  active boolean not null default true,
  hearts int not null default 0
);
create index if not exists ll_shares_owner on public.ll_shares(owner);
create index if not exists ll_shares_lid on public.ll_shares(lid);
create table if not exists public.ll_share_replies(
  id bigserial primary key,
  token text not null references public.ll_shares(token) on delete cascade,
  from_name text,
  data text not null,
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists ll_share_replies_token on public.ll_share_replies(token);
alter table public.ll_shares enable row level security;
alter table public.ll_share_replies enable row level security;
revoke all on public.ll_shares, public.ll_share_replies from public, anon, authenticated;

-- tidy: replies older than 90 days and links that ended more than 90 days ago
create or replace function public.ll_share_tidy() returns void
language sql security definer set search_path = public as $$
  delete from ll_share_replies where created_at < now() - interval '90 days';
  delete from ll_shares where expires_at < now() - interval '90 days';
$$;
revoke all on function public.ll_share_tidy() from public, anon, authenticated;

create or replace function public.ll_share_create(p_lid text, p_kind text, p_ref text, p_title text, p_sub text, p_at bigint, p_days int)
returns text language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); l jsonb; it jsonb; tok text; ttl text := p_title; at bigint := p_at;
begin
  if me is null then raise exception 'Sign in first' using errcode = '42501'; end if;
  if coalesce((select data->>'role' from docs where path = 'profiles/' || me::text), '') <> 'parent' then
    raise exception 'Only parents can share' using errcode = '42501'; end if;
  select data into l from docs where path = 'learners/' || p_lid;
  if l is null or not (coalesce(l->'parents', '[]'::jsonb) ? me::text) then
    raise exception 'Not your child' using errcode = '42501'; end if;
  if p_kind not in ('audio','photo','draw','note','cert') then raise exception 'This item cannot be shared'; end if;
  if p_days not in (7, 30) then raise exception 'Choose 7 or 30 days'; end if;
  if p_kind <> 'cert' then
    if p_ref is null or l->>'uid' is null or p_ref not like 'kp/' || (l->>'uid') || '/x/%' then raise exception 'Not your child''s item' using errcode = '42501'; end if;
    select data into it from docs where path = p_ref;
    if it is null or coalesce(it->>'kind','') <> p_kind or it->>'data' is null then raise exception 'Item not found'; end if;
    ttl := it->>'title'; at := nullif(it->>'at','')::bigint;
  else
    p_ref := null;
  end if;
  perform ll_share_tidy();
  if (select count(*) from ll_shares where owner = me and active and expires_at > now()) >= 50 then
    raise exception 'You have 50 live links. Switch some off first.'; end if;
  tok := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  insert into ll_shares(token, owner, lid, first_name, kind, ref, title, sub, item_at, expires_at)
  values (tok, me, p_lid, split_part(btrim(coalesce(l->>'name','')), ' ', 1), p_kind, p_ref,
          left(coalesce(ttl,''), 120), left(coalesce(p_sub,''), 160), at, now() + make_interval(days => p_days));
  return tok;
end $$;

create or replace function public.ll_share_list() returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('token', s.token, 'lid', s.lid, 'first', s.first_name, 'kind', s.kind, 'title', s.title,
    'created', s.created_at, 'expires', s.expires_at, 'active', s.active, 'hearts', s.hearts,
    'replies', (select count(*) from ll_share_replies r where r.token = s.token),
    'hidden', (select count(*) from ll_share_replies r where r.token = s.token and r.hidden)) order by s.created_at desc), '[]'::jsonb)
  from ll_shares s where s.owner = auth.uid();
$$;

create or replace function public.ll_share_update(p_token text, p_active boolean, p_days int) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_days is not null and p_days not in (7, 30) then raise exception 'Choose 7 or 30 days'; end if;
  update ll_shares set active = coalesce(p_active, active),
    expires_at = case when p_days is null then expires_at else now() + make_interval(days => p_days) end
  where token = p_token and owner = auth.uid();
  if not found then raise exception 'Not your link' using errcode = '42501'; end if;
end $$;

create or replace function public.ll_share_delete(p_token text) returns void
language plpgsql security definer set search_path = public as $$
begin
  delete from ll_shares where token = p_token and owner = auth.uid();
end $$;

create or replace function public.ll_share_replies(p_token text) returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', r.id, 'from', r.from_name, 'data', r.data, 'hidden', r.hidden, 'at', r.created_at) order by r.created_at desc), '[]'::jsonb)
  from ll_share_replies r join ll_shares s on s.token = r.token where r.token = p_token and s.owner = auth.uid();
$$;

create or replace function public.ll_share_hide(p_id bigint, p_hidden boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  update ll_share_replies r set hidden = p_hidden from ll_shares s
  where r.id = p_id and s.token = r.token and s.owner = auth.uid();
  if not found then raise exception 'Not your link' using errcode = '42501'; end if;
end $$;

-- the child's own view: hearts and visible voice replies on their shared items
create or replace function public.ll_share_kid() returns jsonb
language sql stable security definer set search_path = public as $$
  with mine as (select s.* from ll_shares s join docs l on l.path = 'learners/' || s.lid
                where l.data->>'uid' = auth.uid()::text and s.created_at > now() - interval '90 days')
  select jsonb_build_object(
    'hearts', coalesce((select sum(hearts) from mine), 0),
    'replies', coalesce((select jsonb_agg(jsonb_build_object('id', r.id, 'from', r.from_name, 'data', r.data, 'title', m.title, 'at', r.created_at) order by r.created_at desc)
                 from ll_share_replies r join mine m on m.token = r.token where not r.hidden), '[]'::jsonb));
$$;

-- public: one item, first name only
create or replace function public.ll_share_view(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare s ll_shares; d text; a jsonb;
begin
  select * into s from ll_shares where token = p_token;
  if s.token is null or not s.active or s.expires_at <= now() then return jsonb_build_object('ok', false); end if;
  if s.kind <> 'cert' then
    select data->>'data' into d from docs where path = s.ref;
    if d is null then return jsonb_build_object('ok', false); end if;
  end if;
  select data->'academy' into a from docs where path = 'config/app';
  return jsonb_build_object('ok', true, 'first', s.first_name, 'kind', s.kind, 'title', s.title, 'sub', s.sub, 'at', s.item_at,
    'data', d, 'hearts', s.hearts, 'expires', s.expires_at,
    'trial', coalesce(a->>'trialUrl', ''), 'academy', coalesce(a->>'name', 'Little Lingos'));
end $$;

create or replace function public.ll_share_react(p_token text, p_kind text, p_data text, p_from text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s ll_shares;
begin
  select * into s from ll_shares where token = p_token;
  if s.token is null or not s.active or s.expires_at <= now() then raise exception 'This link has ended'; end if;
  if p_kind = 'heart' then
    update ll_shares set hearts = least(hearts + 1, 100000) where token = p_token;
    return jsonb_build_object('hearts', s.hearts + 1);
  elsif p_kind = 'voice' then
    if p_data is null or p_data not like 'data:audio/%' or length(p_data) > 400000 then raise exception 'That recording is too long'; end if;
    if (select count(*) from ll_share_replies where token = p_token) >= 30 then raise exception 'This item already has lots of messages'; end if;
    insert into ll_share_replies(token, from_name, data) values (p_token, nullif(left(btrim(coalesce(p_from,'')), 30), ''), p_data);
    return jsonb_build_object('ok', true);
  end if;
  raise exception 'Unknown reaction';
end $$;

revoke all on function public.ll_share_create(text,text,text,text,text,bigint,int), public.ll_share_list(), public.ll_share_update(text,boolean,int),
  public.ll_share_delete(text), public.ll_share_replies(text), public.ll_share_hide(bigint,boolean), public.ll_share_kid(),
  public.ll_share_view(text), public.ll_share_react(text,text,text,text) from public, anon;
grant execute on function public.ll_share_create(text,text,text,text,text,bigint,int), public.ll_share_list(), public.ll_share_update(text,boolean,int),
  public.ll_share_delete(text), public.ll_share_replies(text), public.ll_share_hide(bigint,boolean), public.ll_share_kid() to authenticated;
grant execute on function public.ll_share_view(text), public.ll_share_react(text,text,text,text) to anon, authenticated;

-- count voice replies in the admin storage meter
do $$
declare d text;
  a text := 'from docs where data ? ''audio''), 0),';
  b text := 'from docs where data ? ''audio''), 0) + coalesce((select sum(octet_length(data)) from public.ll_share_replies), 0), /*ll-share-media*/';
begin
  d := pg_get_functiondef('public.ll_storage()'::regprocedure);
  if strpos(d, 'll-share-media') = 0 then
    if strpos(d, a) = 0 then raise exception 'll_storage anchor not found (run storage.sql first)'; end if;
    execute replace(d, a, b);
  end if;
end $$;
select (select count(*) from pg_proc where proname like 'll_share_%') as share_functions,
       (select count(*) from pg_proc where proname = 'll_storage' and prosrc like '%ll-share-media%') as meter_ok;
