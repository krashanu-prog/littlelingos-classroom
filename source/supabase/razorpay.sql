-- Online fee payments with Razorpay (security-v7).
-- Paste into Supabase > SQL Editor > Run. Safe to run again.
--
-- Parents pay from their Fees page; the Edge Function "razorpay" (supabase/functions/razorpay) creates the
-- order, checks Razorpay's signature and then calls ll_rzp_record below, which writes the payment into the
-- learner's fee record and a receipt the parent can read under rzp/<parent uid>/x/<payment>.

-- Who can read the online-payment records: the admin sees all, a parent sees their own. Nobody writes them
-- from the app; only the Edge Function does (service role).
insert into public.ll_rules(pattern, r, w) values
  ('rzp/*/x/*', 4, 4),
  ('rzp/{self}/x/*', 2, 4)
on conflict (pattern) do update set r = excluded.r, w = excluded.w;

create or replace function public.ll_rzp_record(p_lid text, p_uid text, p_pid text, p_pay jsonb)
returns boolean language plpgsql security definer set search_path = public as $$
declare d jsonb;
begin
  if p_lid !~ '^[A-Za-z0-9_.~:@+-]+$' or p_uid !~ '^[0-9a-f-]{36}$' or p_pid !~ '^[A-Za-z0-9_]{4,60}$' then
    raise exception 'bad id';
  end if;
  select data into d from public.docs where path = 'fees/' || p_lid for update;
  if d is null then raise exception 'no fee plan'; end if;
  if (coalesce(d->'payments', '{}'::jsonb)) ? p_pid then return false; end if;   -- already recorded
  update public.docs
     set data = jsonb_set(d, '{payments}', coalesce(d->'payments', '{}'::jsonb) || jsonb_build_object(p_pid, p_pay)),
         updated_at = now()
   where path = 'fees/' || p_lid;
  insert into public.docs(path, data)
  values ('rzp/' || p_uid || '/x/' || p_pid, p_pay || jsonb_build_object('lid', p_lid, 'status', 'paid'))
  on conflict (path) do update set data = excluded.data, updated_at = now();
  return true;
end $$;
revoke all on function public.ll_rzp_record(text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.ll_rzp_record(text, text, text, jsonb) to service_role;
