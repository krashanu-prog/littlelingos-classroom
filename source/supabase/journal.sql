-- Trainer journals: each trainer reads and writes only their own journal (admins keep full access).
insert into public.ll_rules(pattern, r, w) values
  ('tj/*/x/*', 4, 4),
  ('tj/{self}/x/*', 3, 3)
on conflict (pattern) do update set r = excluded.r, w = excluded.w;
