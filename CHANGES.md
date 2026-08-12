## Unreleased

### 2026-08-12 — Analytics: Rolling Form Trend + Stake Discipline (Phase 5c)
Two more Analytics charts, with a scope change confirmed with the user
first: Confidence Calibration is dropped from this sub-phase entirely,
since the confidence rating it needs doesn't exist in the live schema
(removed deliberately back in Phase 1b) — re-adding it was considered
and declined rather than silently reopened. Rolling Form Trend plots win
rate over a trailing 10-decisive-bet window as a line. Stake Discipline
plots stake per bet against a running average stake, so sizing-up spikes
(e.g. chasing a loss) are visually obvious without needing a
bankroll/balance concept the app doesn't track. Extracted
`shared/utils/chartTheme.ts` and `shared/components/ChartTooltip.tsx` out
of `ProfitChart` since this is now the third and fourth chart needing the
identical dark-theme axis/grid/tooltip treatment. Verified in a real
browser against the real account.

### 2026-08-12 — Analytics: Leg Breakdown, Bet Type Comparison, Parlay Sport Composition (Phase 5b)
Three more Analytics panels. Leg Breakdown groups decisive parlays by
leg count (2/3/4/5/6+, folding the long tail like the odds buckets do)
as a whole-parlay-outcome win rate, with a collapse toggle since it's
the one panel the UI inventory actually describes as collapsible. Bet
Type Comparison is a simple Straight-vs-Parlay win rate reusing the
existing `WinRateList` shape. Parlay Sport Composition counts how often
each sport appears across all parlay legs — a frequency count rather
than a win rate, so it got its own `FrequencyList` display component;
this is the one place per-leg data gets aggregated at all, since the
documented rule only restricts attributing a parlay's *outcome* to each
leg's sport, not counting composition. Verified against the real
account: leg buckets match actual parlay sizes, Straight/Parlay totals
sum correctly, and sport counts match logged parlay legs.

### 2026-08-12 — Analytics: Category Win Rates + Odds Range Breakdown (Phase 5a)
Analytics tab is live with its shared time-range tabs and two panels:
Category Win Rates (by league, with all parlays deliberately collapsed
into one "Parlay" bucket rather than exploded per leg, per the documented
rule) and Win Rate by Odds Range (a standard 6-bucket favorite→longshot
scheme, 1.01–1.50 through 10.01+). Fourth feature to consume the shared
`useBetsContext()`. `AnalyticsPage` owns time-range state and passes
ranged bets to each panel — this is the template the remaining four
Analytics sub-phases will follow. Verified against the real account,
including that parlay bets aren't exploded across categories and bucket
counts sum correctly.

### 2026-08-12 — Phase 4 design critique + fixes
Ran the Phase 4 Impeccable checkpoint on Calendar, scored 26/40. Fixed
the P0: a day with only pending bets (no settled ones) rendered as an
identical neutral gray cell to a day with no bets logged at all, while
tapping either could reveal the day panel showed unfiltered bets —
tapping an apparently "empty" day could silently surface pending
activity the cell gave no hint of. Day cells with pending-only activity
now carry a small amber dot. Also added full `aria-label`s to all 42 day
cells (previously just the bare day number, giving screen reader users
zero information about outcome or activity). Confirmed the Phase 3
`focusRingOnSurface` fix wasn't regressed by this new code. Remaining
findings (no magnitude encoding in cell color, misleading "0.00" on an
empty month, no legend) logged for a later pass.

### 2026-08-12 — Calendar (Phase 4a)
Calendar tab is live: a month grid with day cells colored by that day's
net settled profit (sign-based, matching the Dashboard chart's Daily
view treatment), month back/forward navigation, a running calendar-month
total in the header, and a day detail panel (read-only bet list,
side-by-side on desktop / stacked on mobile, minimizable) that opens on
tap. Third feature to consume the shared `useBetsContext()`. Extracted
`monthPrefix()` out of `MonthlyGoalCard` into `shared/utils/date.ts`
since Calendar needed the identical calendar-month logic — now both
screens compute "this month" the same way, so their totals are
guaranteed to agree rather than risk silently drifting apart. Verified
end-to-end against the real account, including cross-checking Calendar's
month total against Dashboard's Monthly Goal figure.

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
