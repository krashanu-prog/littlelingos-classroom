-- Every class needs a joining link: a signed-in user can't create a class without an https:// link,
-- and can't remove the link from a class that has one. (Older classes without a link can still be
-- moved or edited; the app asks for the link when they are edited.)
create or replace function public.ll_session_needs_link() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.path like 'sessions/%' and auth.uid() is not null
     and coalesce(new.data->>'joinUrl', '') !~ '^https://[^[:space:]]+$' then
    if tg_op = 'INSERT' or coalesce(old.data->>'joinUrl', '') ~ '^https://' then
      raise exception 'Add the class joining link (Zoom, Google Meet or Teams, starting with https://). A class can''t be scheduled without it.'
        using errcode = 'P0001';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists ll_session_needs_link on public.docs;
create trigger ll_session_needs_link before insert or update on public.docs
  for each row execute function public.ll_session_needs_link();
