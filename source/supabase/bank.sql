-- Activity bank: trainers and admins can read and add homework activities.
-- Families and learners can't see the bank (they only see the homework set for them).
insert into public.ll_rules(pattern, r, w) values ('bank/*', 3, 3)
on conflict (pattern) do update set r = excluded.r, w = excluded.w;
