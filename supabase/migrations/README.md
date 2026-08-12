## Seeding the first migration

This project reuses the existing live Supabase project (see
`ARCHITECTURE.md` → "Data source decision") — it is not a fresh database.
Before writing any new migration, capture the current live schema as
migration `0000` so history starts accurate instead of from zero:

```sh
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db pull
```

This requires the real project's credentials and has not been run yet —
do this as a deliberate, human-confirmed step, not something to script
unattended, since it links local tooling directly to the production
database referenced throughout `MIGRATION_EXTRACTION.md`.

After that, every schema change (tables, RLS policies, functions,
triggers) gets its own migration file here and is applied with
`supabase db push` — never a manual paste into the Supabase dashboard SQL
editor again (see `MIGRATION_EXTRACTION.md` → "Don't carry over" #1).
