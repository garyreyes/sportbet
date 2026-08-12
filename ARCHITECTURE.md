# Architecture — Bet Tracker Rebuild

## What the app does

A personal sports-betting journal with group leaderboards. Users log bets
(straight or parlay), see their own performance (dashboard metrics,
calendar heatmap, analytics, Monte Carlo simulation, AI-coach insights), and
optionally join groups to compare P&L/win-rate against other members —
with per-stat privacy controls and no cross-currency conversion.

Rebuild scope: **frontend only**. The existing Supabase project (real
users, bets, groups) is reused as-is — see "Data source decision" below.

## Data source decision

**Same Supabase project, not a fresh one.** The project has real, actively
used data (per `MIGRATION_EXTRACTION.md`). A fresh project would require
manually re-exporting data and re-creating every function/trigger/RLS
policy recovered below, for no benefit. Only the frontend gets rebuilt.

## Entities

- **Profile** (`profiles`) — one per auth user. `id` (= `auth.users.id`),
  `username`, `display_name`, `avatar_url`, `currency`, `hide_overall_pnl`,
  `hide_overall_winrate`, `hide_week_stats`, `hide_month_stats`,
  `hide_today_stats`, `created_at`. (Unit value, odds format, date format,
  and theme choice also live here or in a small prefs extension —
  confirm current column set against live schema before first migration.)
- **Bet** (`bets`) — one per logged wager, owned by a Profile. `id`,
  `user_id`, `date` (plain `YYYY-MM-DD`, local), `sport`, `league`, `pick`,
  `odds` (decimal, canonical), `stake`, `status` (`win`/`loss`/`push`/
  `pending`), `confidence`, `num_legs` (derived, never hand-entered),
  `legs` (jsonb array of `{sport, league, pick}`, null for straight bets),
  `created_at` (tiebreaker sort for same-day bets).
- **Group** (`groups`) — `id`, `name`, `owner_id` (→ Profile), `invite_code`,
  `created_at`.
- **GroupMember** (`group_members`) — join table between Group and Profile.
  `id`, `group_id`, `user_id`, `joined_at`. No client INSERT policy —
  membership rows are only ever created by `handle_new_group` (owner
  auto-join) or `join_group_by_invite_code` (everyone else). Preserve this
  intentionally; do not "fix" by adding a direct insert policy.

### Relationships

```
Profile 1---* Bet
Profile 1---* Group            (owner_id)
Profile *---* Group  via GroupMember
```

### Open item to confirm against live schema before writing migrations

The doc's UI inventory includes an "Add Sport/League" modal for custom
sport/league entries, but no table for it appears in the recovered RLS
policies or CSV exports. Confirm during the migration-baseline step
whether custom entries are actually persisted server-side (missing table)
or currently local-only (e.g. `localStorage`) — the rebuild should make
this explicit either way rather than silently guessing.

## Server-side logic (already live in Supabase — reused, not rewritten)

Carried forward as-is via the first Supabase CLI migration (`supabase db
pull`), with one deliberate change:

- `calculate_bet_profit`, `handle_new_group`, `is_group_member`,
  `is_group_owner`, `shares_group_with`, `join_group_by_invite_code` —
  unchanged.
- `handle_new_user` — becomes the **sole** owner of profile creation on
  signup (decision below). The client-side `ensureProfile()` upsert is
  **removed**, not duplicated.
- `get_group_leaderboard` — its week boundary changes from
  `date_trunc('week', ...)` to match whatever single "week" definition is
  chosen in the unification pass (decision below), so client and server
  agree for the first time.

## Decisions

- **Framework:** React + Vite + Tailwind (unchanged) — PWA install
  behavior, `localStorage` draft-merge pattern, and theme derivation math
  all carry over directly without translation.
- **Routing:** Add real routing (React Router). Each tab gets a real URL;
  refresh preserves the current tab instead of always resetting to
  Dashboard; invite links (`?invite=CODE`) can deep-link straight to
  `/groups` after auto-join instead of relying on ad hoc state-switching.
- **"Week" definitions:** Unify to one meaning everywhere — calendar week
  (Monday start, Asia/Manila) — instead of the three different, colliding
  definitions in the original (client rolling-7-day filters, client
  calendar-month goal, server `date_trunc('week', ...)`). Rolling-window
  filters get relabeled "Past 7 Days" to stop colliding with "week"
  terminology; `get_group_leaderboard`'s week column and any client "week"
  UI now mean the same calendar week.
- **Profile creation:** DB trigger (`handle_new_user`) only. Client no
  longer upserts a profile row on auth state change — removes the
  two-independent-mechanisms race the original had.
- **Migrations:** Supabase CLI migrations from day one
  (`supabase/migrations/*.sql`, committed to git). First migration is a
  `supabase db pull` snapshot of the live schema (tables, functions,
  triggers, RLS policies) so history starts accurate instead of from zero
  — this was the single biggest structural risk flagged in
  `MIGRATION_EXTRACTION.md`.
- **Auth:** Supabase Auth, Google + GitHub OAuth only (unchanged) — both
  sign-in buttons stay fixed-brand-color, not theme-reactive.
- **Timezone:** All group-leaderboard date-boundary math stays hardcoded
  to `Asia/Manila`, matching the primary user base — not derived from each
  viewer's own locale (unchanged, confirmed intentional).

## Security baseline (Supabase + RLS)

- **Default-deny confirmed, not assumed.** RLS is already enabled on every
  table with explicit per-operation policies (`bets`, `groups`,
  `group_members`, `profiles`, `storage.objects`); the first migration
  pull must capture these exactly as they are today, not "clean them up."
- **`bets` stay strictly private** (`auth.uid() = user_id` on all four
  ops). The leaderboard only works because `get_group_leaderboard` is
  `SECURITY DEFINER` and bypasses RLS deliberately, inside a function —
  never by loosening the table policy itself.
- **`group_members` has no client INSERT policy** — joins only happen
  through the two privileged functions. Do not add a direct insert policy
  "for convenience."
- **Two key classes:** Supabase anon/public key is safe in frontend env
  vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`); a service-role key
  is never introduced into this app at all (nothing here needs it — every
  privileged operation goes through `SECURITY DEFINER` functions instead).
- **Nothing trusts client-claimed identity.** Every write path relies on
  `auth.uid()` evaluated server-side inside RLS/functions, never a
  `user_id` value the client sends.
- **Secrets stay out of git** — `.env.local` in `.gitignore`, real keys
  never committed; only `.env.example` with placeholder names is tracked.

## Folder structure

```
src/
  app/
    App.jsx              — router setup, top-level layout, auth gate
    routes.jsx
  features/
    auth/                — pre-login screen, OAuth buttons
    dashboard/
      components/        — Streak card, Monthly Goal card, metric grid, profit chart
    calendar/
      components/        — month grid, day detail panel
    log-bet/
      components/        — BetForm (new+edit, parameterized), LegEditor,
                            BetHistory, HistoryRail, AddSportLeagueModal
      api.ts              — useBets() single source of truth, called once
    analytics/
      components/         — category win rates, odds breakdown, leg breakdown,
                            bet-type comparison, parlay composition,
                            confidence calibration, rolling form, stake
                            discipline, Monte Carlo panel, AI Coach panel
      insights.ts          — AI Coach thresholds (min 3 decisive bets, ≥15pp
                            gap, ≥3-bet streaks — tuned constants, not derived)
      montecarlo.ts         — bootstrap resampling, 500 trials, 5-bet min guard
    groups/
      components/          — Join/Create card, group list, leaderboard,
                            privacy toggles
      api.ts                — get_group_leaderboard call, join/create/leave
    settings/
      components/           — account, preferences, unit value, appearance
                            (5 themes), data export/reset
  shared/
    utils/
      formatCurrency.ts      — the one place currency formatting happens
      date.ts                 — toLocalDateKey, week/range definitions (single
                              source, used by dashboard/analytics/groups alike)
      profit.ts                — calculateProfit (mirrors calculate_bet_profit)
      theme.ts                  — Main/Accent → derived palette math
    components/                 — generic UI primitives used by 2+ features
  lib/
    supabaseClient.ts
    router.ts
supabase/
  migrations/                    — tracked schema history, starting from
                                  `supabase db pull` of the live project
```

**Rule of thumb:** a new screen/capability gets a folder under `features/`;
anything two or more features need (currency formatting, date-range logic,
theme derivation) goes in `shared/`; infrastructure (Supabase client,
router config) goes in `lib/`. `bets` are fetched once in `log-bet/api.ts`
and passed down — no feature re-fetches or holds its own copy, matching
the original's verified single-source-of-truth pattern.

## UI/UX surface (from `MIGRATION_EXTRACTION.md` inventory — carried forward in full)

Bottom tab bar, 6 tabs: Dashboard, Calendar, Log, Analytics, Groups,
Settings — kept as a deliberate mobile-first PWA choice, not replaced with
a top nav. Every screen/card/modal listed in the source doc's UI inventory
(Dashboard's 8 metric cards + 3 chart views, Calendar's month grid + day
panel, Log's dual-mode bet form + history + rail + custom sport/league
modal, Analytics' 11 panels, Groups' join/create + leaderboard + privacy
toggles, Settings' 5 sections) is in scope for the rebuild — treat that
checklist as the acceptance list for feature-planner passes on each
feature folder above.

## Structural debt intentionally not carried over

No tracked migrations (fixed via Supabase CLI), duplicated add/edit bet
forms (fixed via one parameterized `BetForm`), currency hardcoded in
several places (fixed via mandatory `formatCurrency` usage, no direct `$`
literals), dead `sampleBets.js` mock data, and the two-mechanism profile
creation race (fixed — trigger only). See `MIGRATION_EXTRACTION.md`
"Don't carry over" section #1–9 for full detail.
