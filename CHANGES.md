## Unreleased

### 2026-08-12 — Phase 3 design critique + fixes
Ran the Phase 3 Impeccable checkpoint on Dashboard, scored 24/40. Fixed a
real bug the recent depth pass introduced: the shared `focusRing` token
hardcoded a page-level ring-offset color, so keyboard focus on any button
sitting inside a card or modal (Monthly Goal's Edit/Save/Cancel, the
Profit Chart view toggles, a bet row's Delete button, the Add Sport/League
modal) showed a visibly mismatched notch instead of a clean ring. Split
into `focusRing` (page-level) and `focusRingOnSurface` (card/modal/nav
level) and applied the correct one everywhere. Also added visible "All
time"/"This calendar month" captions to the Streak and Monthly Goal cards,
since they silently don't respond to the time-range tabs sitting directly
below them while Metrics and the chart do — the critique flagged this as
a real recognition-vs-recall gap, not just polish. Remaining findings
(metric grid hierarchy/ordering, number formatting, error retry) logged
for a later pass.

### 2026-08-12 — Profit Chart (Phase 3b) + shared UI depth pass
Dashboard's Profit Chart is live: Cumulative (running total, line),
Per Bet (status-colored bars), and Daily (bars diverging around zero),
all filtered by the same time-range tabs as the metric grid. Added
Recharts as a new dependency and followed the project's `dataviz` skill
for chart form, color, and mark decisions.

Mid-build, direct feedback that the built screens felt too flat/skeletal
prompted a shared styling pass rather than deferring it: added
`shared/styles.ts` (card, button, input, focus-ring tokens) and applied
it across every shared component and the Log/Dashboard/Auth screens —
real shadows, a card surface distinct from the page background,
hover/active states on every button (there were none before), and
themed focus rings. Also closed two items already flagged in the Phase 2
critique while `BetForm` was open anyway: missing labels on Sport/
League/Pick, and the "Save bet"/"Update bet" button label. Scoped to
structure, not new colors, since Phase 7b's real theming re-skins this
rather than replacing it.

### 2026-08-12 — Dashboard Metrics (Phase 3a)
Dashboard tab is live: a Streak card and an editable Monthly Goal card
(backed by a new `profiles.monthly_goal` column) sit above time-range
tabs — Today / Past 7 Days / Past 30 Days / Past Year / All Time, the
relabeled rolling windows from the Phase 1b schema-drift correction —
which filter an 8-card metric grid (Net Profit, ROI, Win Rate, Wagers,
Staked (Settled), Pending, Biggest Win, Biggest Loss). This is the first
feature outside Log to need bet data, so `useBets()` moved from being
local to `LogPage` into a shared `BetsProvider` wrapping the app layout —
Dashboard and Log now genuinely share one fetch, matching the original
app's "fetched once, every page derives its own view" rule. Verified
end-to-end against the real account, including that a bet logged on the
Log tab shows up on Dashboard immediately, no refresh needed.

### 2026-08-12 — Phase 2 design critique + correctness fixes
Ran the Phase 2 Impeccable checkpoint (dual-agent critique) on the Log
tab. Fixed the two correctness issues from the findings: the Projected
Profit readout was hardcoded to a win-scenario calculation regardless of
the selected status, so marking a bet Loss or Push still showed a
positive win amount — now it reflects the actual selected status and
relabels once a bet is settled. Also fixed a real data-integrity bug the
review surfaced: editing an old bet after its custom sport/league had
been deleted could silently save a different league than the one
actually recorded, because the dropdown had no matching option; the
bet's own sport/league is now guaranteed to remain selectable regardless
of custom-entry deletions. Remaining findings (field labels, status-color
consistency, delete confirmation feedback, history filtering, currency
display) are logged for a later pass rather than bundled into this one.

### 2026-08-12 — History Rail + Add Sport/League (Phase 2c)
Bet History can now be minimized to a two-icon rail (expand, add
sport/league) instead of always showing the full list. Added an "Add
Sport/League" modal so users can extend the built-in sport/league list
with their own — stored server-side in a new `custom_sport_leagues`
table (per-user, RLS-scoped like `bets`) rather than localStorage, so it
syncs across devices. The modal's sport field is a dropdown of existing
sports plus "add new," not free text, so adding a league under an
existing sport (e.g. Basketball) can't create a case-mismatched
duplicate. `BetForm`/`LegEditor` now take a merged sport/league list as
a prop instead of importing a hardcoded constant. First schema change
made during the rebuild itself (as opposed to the Phase 1b baseline
capture) — applied with `supabase db push`, which turned out not to need
Docker the way `db pull`/`db dump` did.

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
