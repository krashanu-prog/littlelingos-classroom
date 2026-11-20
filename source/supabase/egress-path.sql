-- Lower data use: tell open apps WHICH record changed, so they re-read just that one record
-- instead of the whole list. Optional; the app works with or without it. Safe to run again.
alter table public.ll_changes add column if not exists path text;

create or replace function public.ll_bump() returns trigger
language plpgsql security definer set search_path = public as $$
declare t text := coalesce(new.parent, old.parent);
        p text := coalesce(new.path, old.path);
begin
  insert into ll_changes(topic, at, path) values (t, now(), p)
    on conflict (topic) do update set at = excluded.at, path = excluded.path;
  if t in ('learners','trainers','batches') then
    insert into ll_changes(topic, at) values ('_access', now()) on conflict (topic) do update set at = excluded.at;
  end if;
  return null;
end $$;
