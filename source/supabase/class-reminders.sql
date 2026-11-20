-- Class reminders for families (email + phone notifications). Run once in the Supabase SQL editor.
-- It adds three private tables (only the class-reminders function can read them) and a timer that
-- calls the function every 5 minutes. Safe to run again.
create extension if not exists pg_cron;
create extension if not exists pg_net;

create table if not exists public.ll_kv (k text primary key, v jsonb not null, updated_at timestamptz default now());
create table if not exists public.push_subs (
  endpoint text primary key, uid uuid not null, sub jsonb not null, ua text,
  created_at timestamptz default now(), last_ok timestamptz);
create index if not exists push_subs_uid on public.push_subs (uid);
create table if not exists public.class_reminders_sent (
  session_id text not null, kind text not null, sent_at timestamptz default now(), info jsonb,
  primary key (session_id, kind));
-- no policies: nobody signed in to the app can read or change these; only the function (service key) can
alter table public.ll_kv enable row level security;
alter table public.push_subs enable row level security;
alter table public.class_reminders_sent enable row level security;
revoke all on public.ll_kv, public.push_subs, public.class_reminders_sent from anon, authenticated;

-- a private password the timer sends, so only the timer can start a reminder run
insert into public.ll_kv (k, v) values ('cron_token', to_jsonb(md5(random()::text || clock_timestamp()::text) || md5(random()::text)))
on conflict (k) do nothing;

-- the 5-minute timer
select cron.unschedule(jobid) from cron.job where jobname = 'll-class-reminders';
select cron.schedule('ll-class-reminders', '*/5 * * * *', $job$
  select net.http_post(
    url := 'https://ldfhdbsxphwxklrpvgul.supabase.co/functions/v1/class-reminders',
    headers := jsonb_build_object('content-type', 'application/json',
                                  'x-cron', (select v #>> '{}' from public.ll_kv where k = 'cron_token')),
    body := '{"action":"run"}'::jsonb,
    timeout_milliseconds := 55000)
$job$);

-- old "already sent" marks are not needed after a month
select cron.unschedule(jobid) from cron.job where jobname = 'll-class-reminders-tidy';
select cron.schedule('ll-class-reminders-tidy', '17 3 * * *',
  $job$ delete from public.class_reminders_sent where sent_at < now() - interval '35 days' $job$);
