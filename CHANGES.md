## Unreleased

### 2026-08-12 — Bet History (Phase 2b)
Log tab now lists every logged bet (most recent first), each expandable
into the same `BetForm` used to create it for inline editing, plus delete
with an inline "tap again to confirm" step since deletion is permanent.
Introduced `useBets()` and lifted it to `LogPage` so the form and the
list share one fetch instead of the list going stale after a new bet is
saved — this is the pattern Dashboard/Calendar/Analytics will reuse once
they need the same data. Caught and fixed two bugs before shipping: the
new-bet and every open edit row were sharing one localStorage draft key
(scoped it per-bet-id instead), and a failed delete had no visible error
(now surfaces one instead of failing silently). Verified end-to-end
against the real account: create, edit, and delete all confirmed working.

### 2026-08-12 — Bet Form (Phase 2a)
Log tab now has a working Bet Form: Single/Parlay toggle, dynamic leg
list for parlays, decimal odds, stake, a live Projected Profit readout,
and Win/Loss/Push/Pending buttons. Autosaves to localStorage as you type
and merges over defaults on reload so an in-progress entry survives a
closed tab. Saving inserts into `bets` under the signed-in user, with
validation mirroring the database's own `odds > 0`/`stake > 0` checks so
errors show up before a save attempt rather than as a raw Postgres
message. Verified end to end against the real account. Built as a
reusable component (`BetForm` takes an optional existing bet) so editing
in Phase 2b won't need a second form.

### 2026-08-12 — Schema migration baseline + drift correction
Captured the live Supabase schema as the first two tracked migrations
(`supabase/migrations/`), working around a missing Docker install by
connecting directly with `pg_dump` through Supabase's IPv4 pooler. This
surfaced real, intentional schema drift since `MIGRATION_EXTRACTION.md`
was written: `bets` no longer has `confidence`/`prep_time_mins`/
`num_legs`; `profiles` was restructured (`full_name`/`email` instead of
`username`/`display_name`, new `theme_main`/`theme_accent` columns,
simplified privacy toggles); `get_group_leaderboard` now uses rolling
7/30-day windows instead of calendar weeks, which resolves the doc's
"three week definitions" problem on its own. `ARCHITECTURE.md` updated to
match the live schema as ground truth. Also found (not fixed): duplicate
avatar storage RLS policies, functionally harmless but redundant.

### 2026-08-12 — App shell + Supabase auth
Wired the real Supabase client to the live project, added the pre-login
screen (Google/GitHub sign-in), the 6-tab bottom nav with routed pages for
Dashboard/Calendar/Log/Analytics/Groups/Settings (placeholders for now),
and a route guard so every tab requires sign-in. Invite links
(`?invite=CODE`, with or without a path) now redirect to `/groups` with
the code preserved for the Groups feature to pick up later. No bet/group
data logic yet — this is pure app-shell infrastructure everything else
plugs into.
