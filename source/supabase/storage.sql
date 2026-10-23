-- Storage rules: admin storage meter, and Garden wall posts that point at the
-- original portfolio item instead of storing a second copy. Safe to run again.
create or replace function public.ll_storage() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare fs bigint := 0;
begin
  if ll_level() < 4 then raise exception 'Admin only' using errcode = '42501'; end if;
  begin
    execute 'select coalesce(sum((metadata->>''size'')::bigint),0) from storage.objects' into fs;
  exception when others then fs := 0;
  end;
  return jsonb_build_object(
    'db', pg_database_size(current_database()),
    'docs', pg_total_relation_size('public.docs'),
    'media', coalesce((select sum(octet_length(data->>'data')) from docs where data ? 'data'), 0)
           + coalesce((select sum(octet_length(data->>'png')) from docs where data ? 'png'), 0)
           + coalesce((select sum(octet_length(data->>'voice')) from docs where data ? 'voice'), 0)
           + coalesce((select sum(octet_length(data->>'audio')) from docs where data ? 'audio'), 0),
    'items', (select count(*) from docs where data ? 'data' or data ? 'png' or data ? 'audio'),
    'files', fs);
end $$;
revoke all on function public.ll_storage() from public, anon;
grant execute on function public.ll_storage() to authenticated;
do $$
declare d text;
  a text := '(d.data - ''reacts'') || jsonb_build_object(';
  b text := '(d.data - ''reacts'') || jsonb_build_object(''data'', coalesce(d.data->''data'', (select k.data->''data'' from docs k where k.path = ''kp/'' || (d.data->>''uid'') || ''/x/'' || (d.data->>''item''))), /*ll-wall-media*/';
begin
  d := pg_get_functiondef('public.ll_fetch(text)'::regprocedure);
  if strpos(d, 'll-wall-media') = 0 then
    if strpos(d, a) = 0 then raise exception 'wall branch not found (run wall.sql first)'; end if;
    execute replace(d, a, b);
  end if;
end $$;
select (select count(*) from pg_proc where proname = 'll_fetch' and prosrc like '%ll-wall-media%') as wall_media_ok;
