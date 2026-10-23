-- UPI payment claims: each parent writes their own "I've paid" notes; only the admin sees all and confirms.
insert into public.ll_rules(pattern, r, w) values
  ('upi/*/x/*', 4, 4),
  ('upi/{self}/x/*', 2, 2)
on conflict (pattern) do update set r = excluded.r, w = excluded.w;
