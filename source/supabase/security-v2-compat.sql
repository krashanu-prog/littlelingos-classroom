-- Compatibility: lets older copies of the app (which read the table directly)
-- keep working, but still only shows each family their own children's records.
-- Rows that mix several children (group attendance, group homework feedback)
-- are hidden from families here; the current app reads those through
-- ll_fetch, which removes the other children's parts.
create or replace function public.ll_ctx() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('lvl', ll_level(), 'me', coalesce(auth.uid()::text,'-'),
    'lids', to_jsonb(f.lids), 'uids', to_jsonb(f.uids), 'courses', to_jsonb(f.courses), 'tuids', to_jsonb(f.tuids))
  from ll_family() f;
$$;

create or replace function public.ll_row_ok(p text, d jsonb, c jsonb) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare lvl int := (c->>'lvl')::int; me text := c->>'me'; top text := split_part(p,'/',1); s2 text := split_part(p,'/',2);
        lids text[]; uids text[]; courses text[]; tuids text[]; k text;
begin
  if lvl is null or lvl = 0 then return false; end if;
  if lvl >= 4 then return true; end if;
  if lvl < ll_need(p,'r') then return false; end if;
  if lvl >= 3 or top not in ('learners','profiles','progress','answers','kp','tw','sessions','batches','ptmb','evr') then return true; end if;
  lids := array(select jsonb_array_elements_text(c->'lids')); uids := array(select jsonb_array_elements_text(c->'uids'));
  courses := array(select jsonb_array_elements_text(c->'courses')); tuids := array(select jsonb_array_elements_text(c->'tuids'));
  if top = 'learners' then return s2 = any(lids);
  elsif top = 'profiles' then return s2 = me or s2 = any(tuids);
  elsif top in ('progress','answers','kp') then return s2 = any(uids);
  elsif top in ('ptmb','evr') then return s2 = me;
  elsif top = 'sessions' then
    return coalesce(d->'forLids','[]'::jsonb) ?| lids
        or (jsonb_array_length(coalesce(d->'forLids','[]'::jsonb)) = 0 and d->>'courseId' = any(courses));
  elsif top = 'batches' then return coalesce(d->'learners','[]'::jsonb) ?| lids;
  elsif top = 'tw' then
    k := d->>'kind';
    if k in ('assess','award','sticker','pc','voice','report') then return d->>'lid' = any(lids); end if;
    if k = 'mark' then
      return coalesce(d->'m','{}'::jsonb) ?| lids
         and not exists (select 1 from jsonb_object_keys(coalesce(d->'m','{}'::jsonb)) x where x <> all(lids))
         and not exists (select 1 from jsonb_object_keys(coalesce(d->'notes','{}'::jsonb)) x where x <> all(lids));
    end if;
    if k = 'hw' then
      return (coalesce(d->'learnerIds','[]'::jsonb) ?| lids
              or (jsonb_array_length(coalesce(d->'learnerIds','[]'::jsonb)) = 0 and d->>'courseId' = any(courses)))
         and not exists (select 1 from jsonb_object_keys(coalesce(d->'feedback','{}'::jsonb)) x where x <> all(lids));
    end if;
    if k = 'note' then
      return (d->>'audience' = 'course' and d->>'courseId' = any(courses)) or (coalesce(d->>'audience','') <> 'course' and s2 = any(tuids));
    end if;
    if k in ('settings','run') then return s2 = any(tuids); end if;
    return false;
  end if;
  return false;
end $$;

drop policy if exists docs_read on public.docs;
create policy docs_read on public.docs for select to authenticated
  using ((select ll_level()) = 4 or (select ll_level()) >= ll_need(path,'w') or ll_row_ok(path, data, (select ll_ctx())));

revoke all on function public.ll_ctx(), public.ll_row_ok(text,jsonb,jsonb) from public, anon;
grant execute on function public.ll_ctx(), public.ll_row_ok(text,jsonb,jsonb) to authenticated;
