# sportsbet — project instructions

Bet-tracking PWA with group leaderboards, rebuilt on React + Vite + TS +
Tailwind + Supabase. Read `ARCHITECTURE.md` (entities, decisions, folder
structure) and `MIGRATION_EXTRACTION.md` (business logic, UI inventory,
recovered server-side SQL) before making structural or logic changes —
they are the source of truth this rebuild is derived from.

## Where things live

- `ARCHITECTURE.md` — entities, tech decisions, folder structure, security
  baseline.
- `MIGRATION_EXTRACTION.md` — business rules, UI/UX inventory checklist,
  recovered SQL functions/triggers/RLS policies, structural debt to avoid
  repeating.
- `CHANGES.md` — running log of completed features, appended by
  `feature-planner` as work lands.
- `supabase/migrations/` — tracked schema history. See its `README.md`
  before running anything against the live database.

## Rules that override default judgment

- **This project reuses the live Supabase project.** There is no
  disposable "dev database" — `bets`, `groups`, `group_members`, `profiles`
  contain real user data. Never run a migration, `db reset`, or any
  destructive SQL against it without the user explicitly confirming first,
  even if a change seems obviously safe.
- **Schema changes are migration files, not dashboard SQL pastes.** Every
  `ALTER TABLE`/policy/function/trigger change goes into
  `supabase/migrations/` and gets applied via `supabase db push`. This was
  the single biggest structural risk in the original app (see
  `MIGRATION_EXTRACTION.md` §"Don't carry over" #1) — do not regress to
  the old habit even for a "quick" one-off change.
- **`group_members` has no client INSERT policy on purpose.** Joins only
  happen through `handle_new_group` (trigger) or `join_group_by_invite_code`
  (function), both `SECURITY DEFINER`. Do not add a direct insert policy
  "to simplify" — that removes an intentional control.
- **Profile creation is owned solely by the `handle_new_user` DB trigger.**
  Do not add a client-side upsert-on-signup path alongside it — the
  original had two independent mechanisms that had to be kept in sync by
  hand; the rebuild deliberately picked one owner.
- **Never introduce a Supabase service-role key into this app.** Every
  privileged operation goes through `SECURITY DEFINER` Postgres functions
  instead. Only `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (safe for
  frontend exposure) belong in this codebase.
- **All bet/save operations must await their result and only close/reset
  the UI on success**, surfacing the real error otherwise (see
  `MIGRATION_EXTRACTION.md` §"Keep" #11 — a real production bug came from
  skipping this).
- **Date handling is always local, never `toISOString()`-derived**, for any
  code building or comparing a `bet.date` (`YYYY-MM-DD`). See `MIGRATION_
  EXTRACTION.md` §"Keep" #3 for the exact bug this caused before.
- **Currency formatting always goes through the shared `formatCurrency`
  utility** — never a hardcoded `$` literal in a new component (see
  §"Don't carry over" #7).

## Gates (enforced, not optional)

`npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` all
run in CI on every PR to `main` (`.github/workflows/ci.yml`) and locally
on every commit via a Husky pre-commit hook. A PR cannot merge to `main`
until CI passes — this applies to human, Claude Code, and any other
contributor equally.
