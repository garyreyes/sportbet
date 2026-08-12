## Baseline migration (done 2026-08-12)

This project reuses the existing live Supabase project (see
`ARCHITECTURE.md` → "Data source decision"). The live schema was captured
as the first two migrations here (`..._baseline_public_schema.sql`,
`..._baseline_storage_and_auth.sql`) so history starts accurate instead
of from zero. Both are marked `applied` in Supabase's remote migration
history — don't try to re-run or delete them.

`npx supabase db pull` (the normal way to do this) needs Docker locally
and failed here — Docker Desktop isn't installed on this machine. Worked
around it with a direct connection instead:

```sh
export SUPABASE_ACCESS_TOKEN=<personal access token, from
  supabase.com/dashboard/account/tokens>

npx supabase link --project-ref mbytqdkgwpzaensnphwd

# The direct db.<ref>.supabase.co host is IPv6-only and may be
# unreachable depending on network — use the IPv4 connection pooler
# instead (find the exact host/port under the dashboard's "Connect" →
# "Direct" tab if the project's region changes):
export PGPASSWORD=<database password, from dashboard "Connect" modal>
pg_dump --schema-only --schema=public --no-owner --no-privileges \
  -h aws-0-ap-northeast-1.pooler.supabase.com -p 5432 \
  -U postgres.mbytqdkgwpzaensnphwd -d postgres \
  -f supabase/migrations/<timestamp>_name.sql
unset PGPASSWORD
```

After writing a new migration this way (or via a normal `db pull` if
Docker becomes available), mark it applied so `db push` doesn't try to
re-run it against objects that already exist:

```sh
npx supabase migration repair <timestamp> --status applied
```

Neither the access token nor the database password should ever be
committed — both were used interactively for this one-off baseline and
discarded afterward, not stored in `.env.local` or anywhere else in this
repo.

## Ongoing migrations

Every schema change (tables, RLS policies, functions, triggers) from here
on gets its own migration file in this folder and is applied with
`supabase db push` — never a manual paste into the Supabase dashboard SQL
editor again (see `MIGRATION_EXTRACTION.md` → "Don't carry over" #1, and
`ARCHITECTURE.md` → "Schema drift note" for what happened the one time
this got skipped even during the rebuild itself).
