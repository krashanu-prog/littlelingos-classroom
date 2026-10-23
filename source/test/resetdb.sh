#!/bin/bash
cd /tmp/claude-0/-home-claude/e46c440f-a2dc-5219-9a0e-fc980d1e0e9c/scratchpad/web
service postgresql start >/dev/null 2>&1; sleep 1; export PGPASSWORD=pw
psql -h 127.0.0.1 -U postgres -qc 'drop database if exists e2e' -c 'create database e2e' 2>&1 | grep -v NOTICE
for f in test/stub.sql supabase/schema.sql supabase/auto-link.sql supabase/security-v2.sql supabase/security-v2-compat.sql supabase/bank.sql supabase/journal.sql supabase/pip.sql supabase/upi.sql supabase/adapt.sql supabase/screentime.sql supabase/wall.sql supabase/boards.sql supabase/storage.sql supabase/conf.sql supabase/missions.sql supabase/passport.sql supabase/share.sql supabase/security-v3.sql supabase/security-v4.sql supabase/security-v5.sql supabase/security-v6.sql test/e2e_seed.sql test/adapt_seed.sql; do psql -h 127.0.0.1 -U postgres -d e2e -q -v ON_ERROR_STOP=1 -f $f >/dev/null 2>&1 || echo FAIL $f; done
