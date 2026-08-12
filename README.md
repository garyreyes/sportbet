# sportsbet

Bet-tracking PWA with group leaderboards. Rebuild in progress — see
`ARCHITECTURE.md` for the plan and `MIGRATION_EXTRACTION.md` for the
business logic and UI inventory this rebuild is derived from.

## Stack

React + Vite + TypeScript + Tailwind CSS + Supabase (Postgres, Auth,
Storage, RLS).

## Getting started

```sh
npm install
cp .env.example .env.local   # fill in Supabase URL + anon key
npm run dev
```

## Gates

```sh
npm run lint       # oxlint
npm run typecheck  # tsc --noEmit
npm run test       # vitest
npm run build       # tsc -b && vite build
```

All four run in CI on every PR (`.github/workflows/ci.yml`) and locally
before every commit via a Husky pre-commit hook.

## Database

This project reuses the existing live Supabase project — see
`ARCHITECTURE.md` → "Data source decision". Schema changes are tracked
migrations in `supabase/migrations/`; see that folder's `README.md`
before running anything against the database.
