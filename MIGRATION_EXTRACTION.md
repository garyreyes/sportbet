# Migration Extraction — Bet Tracker

Source project: this repo (`GAMBLING` / deployed as `gambling-eight-vert.vercel.app`).
Stack: React (Vite) + Tailwind, Supabase (Postgres, Auth, Storage, RLS).

This document separates what's worth carrying forward into a rebuild from
what's just accumulated structure. It is not a code copy — it's the
requirements and hard-won rules a rebuild needs to know about before its
architecture step, so the same lessons aren't re-learned the hard way.

---

## Server-side logic recovered from Supabase (was previously undocumented)

A meaningful amount of this app's real business logic was never written in
the JS codebase and was never committed to git — it exists only as live SQL
inside the Supabase project (functions, triggers, RLS policies). It's been
pulled out and is captured below. **A fresh Supabase project for the
rebuild will not have any of this** unless these definitions are carried
over deliberately.

### Functions

**`calculate_bet_profit(p_odds, p_stake, p_status)`** — an exact SQL mirror
of the JS `calculateProfit()`. No drift between the two found.
```sql
select case
  when p_status = 'win' then p_stake * (p_odds - 1)
  when p_status = 'loss' then -p_stake
  else 0
end;
```

**`get_group_leaderboard(p_group_id)`** — `SECURITY DEFINER`, called from
`useLeaderboard.js`. Requires the caller to already be a member of the
group (raises an exception otherwise, via `is_group_member`). For every
member, computes overall/week/month/today P&L and win rate. Three things
worth knowing that weren't visible from the client side:
- **Timezone is hardcoded to `Asia/Manila`** for all date-boundary math
  (`now() at time zone 'Asia/Manila'`) — not derived from each user's own
  locale. Every member's "today"/"this week" is calculated in Manila time
  regardless of where they actually are.
- **"Week" here means calendar week** (`date_trunc('week', ...)`, Postgres
  default = Monday start) — the client's Dashboard/Analytics "Past Week"
  filter is a *rolling* 7-days-back window instead. These are two different
  definitions that happen to share a label; a rebuild should either unify
  them or name them distinctly (e.g. "This Week" vs "Past 7 Days").
- **Privacy toggles only hide a stat from other viewers** — the `case when
  p.hide_x and gm.user_id <> v_caller then null` pattern means you always
  see your own numbers on your own leaderboard row regardless of your own
  privacy settings; the toggle only affects what groupmates see.

**`handle_new_group()`** — trigger, `AFTER INSERT ON groups`. Automatically
inserts the group's owner as a `group_members` row. This explains something
not visible in `useGroups.js`: `createGroup()` never explicitly adds the
owner to `group_members` — this trigger does it silently server-side.

**`handle_new_user()`** — trigger (inferred to be on `auth.users`, not
directly confirmed since it lives outside the `public` schema). Creates the
matching `profiles` row on signup, with the same `full_name → user_name →
email` fallback used client-side. **This duplicates `AuthContext.jsx`'s
`ensureProfile()`** — profile creation currently happens via two independent
mechanisms (this trigger, plus a client-side upsert with
`ignoreDuplicates: true` as a no-op safety net in practice). A rebuild
should pick one.

**`is_group_member(p_group_id)` / `is_group_owner(p_group_id)` /
`shares_group_with(p_other_user_id)`** — small `STABLE SECURITY DEFINER`
boolean helpers, used only inside RLS policies below (not called directly
from the client).

**`join_group_by_invite_code(p_invite_code)`** — `SECURITY DEFINER`, called
from `useGroups.js`. Looks up the group by code, raises `'Invalid invite
code'` if not found (matches the client's generic error message), inserts
into `group_members` with `ON CONFLICT DO NOTHING` (safe to "join" the same
group twice — a no-op, not an error).

### Row Level Security policies

- **`bets`** — strictly private per user for all four operations (`auth.uid()
  = user_id`). No policy ever lets one user read another's raw bet rows —
  the leaderboard only works because `get_group_leaderboard` is `SECURITY
  DEFINER` and bypasses RLS internally.
- **`group_members`** — has **no INSERT policy at all**. The client can
  never insert a membership row directly; the only two paths in are the
  `handle_new_group` trigger and the `join_group_by_invite_code` function,
  both privileged. This is a deliberate "all group joins go through a
  controlled function" pattern, not an oversight — worth preserving
  intentionally in a rebuild rather than "fixing" by adding a direct insert
  policy.
- **`groups`** — owner-only insert/update/delete; visible to members via
  `is_group_member`.
- **`profiles`** — owner-only update/insert; visible to yourself or anyone
  you `shares_group_with` — that's how groupmates' names/avatars/currency
  show up on the leaderboard and member list despite per-user RLS.
- **`storage.objects`** (`avatars` bucket) — matches exactly what was
  specified when this feature was built, confirming it was applied
  correctly to production.

### Schema history is entirely untracked

No migrations folder exists in this repo. Every schema change made during
this project's life (adding `num_legs`, `created_at`, `legs jsonb` to
`bets`; creating the `avatars` bucket + its policies; presumably the
functions/triggers/policies above, at some earlier point not captured in
this conversation at all) was handed over as a raw SQL snippet for manual
paste into the Supabase SQL editor — never committed anywhere. This already
caused a real bug once: a parlay save failed in production because a column
that had been "added" in conversation hadn't actually been run against the
live database yet, and the failure was silent until a separate bug (see
"Keep" #11, silent-failure discipline, below) was also fixed. **Fix in the
rebuild:** tracked migration files from day one.

---

## Keep — real business logic

### 1. Profit formula and status semantics
```js
// decimal odds = total payout multiplier including stake (e.g. 2.50 on a
// $100 bet returns $250, $150 profit)
function calculateProfit(bet) {
  if (bet.status === "win") return bet.stake * (bet.odds - 1)
  if (bet.status === "loss") return -bet.stake
  return 0 // push or pending
}
```
Odds are always stored **canonically as decimal**, regardless of the user's
display preference (American vs Decimal) — conversion to/from American only
happens at the UI edges (`americanToDecimal`/`decimalToAmerican`), never in
storage or in profit math. `push` and `pending` both contribute zero to
profit, but are tracked as separate statuses because they mean different
things downstream (a push doesn't count as a decisive bet for win-rate
purposes; a pending one does eventually resolve).

### 2. "Decisive" vs "settled" vs "all" bet filtering
Three different filters are used throughout, and mixing them up produces
subtly wrong stats:
- **decisive** = `status === "win" || "loss"` — used for win rate, streaks.
- **settled** = `status !== "pending"` (includes push) — used for net
  profit sums, since a push still "happened."
- **all** = no filter — used for total wager counts.

### 3. Local-date handling (a real bug that was found and fixed)
`bet.date` is a plain `YYYY-MM-DD` string with no time-of-day, always
constructed from **local** date components. Any code that builds a
comparison date using `new Date().toISOString()` is wrong — `toISOString()`
converts to UTC first, silently shifting date-range boundaries by a day for
any user not at UTC+0 (this app's primary user base is UTC+8). The fix
pattern used everywhere:
```js
function toLocalDateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}
```

### 4. Same-day bet ordering for streaks
`bet.date` has no time component, so when multiple bets share a date, their
true real-world order is unknowable from the date alone. The chosen
resolution: capture `created_at` at insert time and use it as a tiebreaker
sort key *after* date. This reflects **logging order**, not necessarily
**real-world order** (if three same-day bets are all logged at once at the
end of the day, in whatever order the user happens to type them, that's the
order used) — this limitation was discussed explicitly and accepted as a
tradeoff rather than adding a manual time-of-day field.

### 5. Parlay/multi-leg data model
- A bet is either a **straight bet** (`legs` is null) or a **parlay**
  (`legs` is a JSON array of `{sport, league, pick}` objects, minimum 2).
- `numLegs` is **always derived** from `legs.length` (or `1` for a straight
  bet) — never manually entered. This was a deliberate fix: an earlier
  version had a separate manual "number of legs" field that users
  consistently forgot to update, silently miscategorizing every parlay as a
  straight bet in analytics.
- Parlays store `sport: "Parlay"` and `league: ""` (empty string, **not**
  `null` — the `league` column has a `NOT NULL` constraint from before
  parlays existed, discovered via a live production error) at the top
  level, since a parlay spanning multiple sports/leagues can't be reduced to
  one value there.
- **Only the parlay's overall result is known — not each leg's own
  win/loss.** Category/league analytics deliberately group all parlays into
  one "Parlay" bucket rather than exploding a parlay's result across every
  league its legs touched, because doing so would misattribute one outcome
  (e.g. a loss) to every sport in the parlay, even ones that "hit"
  individually. Any future per-leg outcome tracking would be a genuinely new
  feature, not a small extension of this one.
- Pick/leg description text is **optional** everywhere (journaling context
  only) — only odds and stake are required to log a bet. Empty text renders
  as nothing, not a placeholder.

### 6. Currency is per-user and never converted
Each user picks a currency symbol (stored in `profiles.currency`, synced
specifically so groupmates can label a leaderboard entry correctly). The
leaderboard explicitly does **not** convert between currencies — if members
use different symbols, a warning banner says amounts are "shown as entered,
not converted." This was a deliberate scope decision, not an oversight.

### 7. Time-range filtering — two different meanings of "monthly"
- **Rolling windows** (`TIME_RANGES`: Today=0 days back, Past Week=6, Past
  Month=29, Past Year=364, All Time=none) drive the Dashboard/Analytics tab
  filters — always "last N days from today," not calendar-aligned.
- **Calendar month** is used separately, and deliberately differently, for
  the Monthly Goal progress bar (`getMonthToDateProfit` — matches on a
  `YYYY-MM` date prefix) so the goal actually resets at the start of each
  real month rather than rolling.
- These two are *not* interchangeable and the distinction was intentional.
- A **third** definition of "week" exists server-side: `get_group_leaderboard`
  uses Postgres's `date_trunc('week', ...)` (calendar week, Monday start,
  in `Asia/Manila` time) for the leaderboard's week column — different from
  both of the above. Three "week"s that don't agree is a real inconsistency
  worth deliberately resolving in the rebuild, not an intentional design
  like the month split above.

### 8. AI Coach insight thresholds (tuned, not derived)
The insight engine (`getAIInsights`) fires each insight only above specific
manually-chosen thresholds: minimum 3 decisive bets in a group before
judging it, a ≥15-percentage-point gap between two win rates or ROI figures
before calling it a real pattern, ≥3-bet streaks before flagging a hot/cold
run. These numbers aren't derived from anything statistical — they were
picked by feel to avoid the coach reacting to noise on small samples, and
should be preserved (or deliberately revisited) rather than silently
changed.

### 9. Monte Carlo simulation approach
Bootstrap resampling: draw a random historical bet's profit value (with
replacement), repeat for N simulated bets, sum, repeat for 500 trials. This
is intentionally simple (no odds-aware modeling) and preserves each bet
type's real historical proportion automatically. A minimum-sample guard (5
settled bets) blocks the Straight-only/Parlay-only filter views from
running on too few data points, since a resampled distribution from under 5
points just reshuffles the same handful of outcomes and looks more
precise than it is.

### 10. Draft persistence must merge, not replace
The in-progress Log Bet form autosaves to `localStorage` on every keystroke
(so backgrounding the browser tab on mobile doesn't lose progress). The
critical rule: loading a saved draft must **merge over the current default
shape**, not replace it wholesale — a draft saved before a field existed
(e.g. `numLegs`, added later) would otherwise silently omit that key, and
the corresponding input would go blank without any visible error. This
exact bug happened once already.

### 11. Silent-failure discipline for save operations
Any "save" action that can fail against the network (bet edits, profile
updates) must **await the result and only close/reset the UI on success**,
surfacing the real error message otherwise. An earlier version of the bet
history edit flow fired the update and closed the edit form immediately
without checking the result — a failed save (e.g. because of the `league`
`NOT NULL` constraint above) looked visually identical to a successful one,
which made a real bug look like a UI glitch for a while.

### 12. Theme system: two knobs, not a full color picker
Custom theming exposes exactly two user-facing choices — "Main" (drives
background/surface/border/text-family shades) and "Accent" (drives
buttons/highlights/positive figures) — with the rest of a full palette
**algorithmically derived** from those two via HSL-ish luminance math
(`utils/theme.js`), including automatically choosing dark or light text on
the accent color based on its brightness. This was a deliberate scope
choice over exposing every token individually.

### 13. Semantic colors are never themeable
Win = green, loss = red, push = blue, star ratings = amber — these are
fixed regardless of which theme or custom colors are active, because they
carry meaning, not brand. Only decorative/brand colors route through the
theme token system.

### 14. Single source of truth for bet data
`useBets()` is called exactly once, at the top of `App.jsx`; every page
(Dashboard, Calendar, Log, Analytics, Settings) receives the same `bets`
array via props and derives its own view of it locally (range-filtered,
grouped, etc.) rather than each page independently fetching or holding its
own copy. This was verified explicitly at one point during development
specifically to rule out data-consistency bugs before adding more features
on top.

### 15. PWA update behavior
`registerType: 'autoUpdate'` with `devOptions.enabled: true` — service
worker updates apply automatically on next app open (no user-facing "update
available" prompt), and PWA install/update behavior can be tested during
`npm run dev`, not just in a production build.

### 16. Invite links
`?invite=CODE` in the URL triggers auto-join once signed in, then the query
param is stripped via `history.replaceState` — specifically so a page
refresh doesn't silently retry joining (or erroring) again.

---

## UI/UX surface inventory (checklist — confirm nothing here is missing)

This is deliberately separate from the business-logic list above. A screen
or nav entry is just as easy to silently drop in a rebuild as a business
rule, and unlike a business rule, there's no bug report to catch it —
the feature just quietly isn't there anymore. Confirm each line below
against the live app before treating this list as complete.

### Navigation — 6 entry points, confirmed exhaustive from `BottomNav.jsx`
Fixed **bottom tab bar** (not a top nav / sidebar), 6 equal-width tabs laid
out via CSS grid, active tab shown with an accent-colored icon + bolder
stroke weight. This is a **deliberate mobile-first choice, not a default**
— the app is explicitly built to be installed as a PWA on a phone home
screen (per the README), and bottom placement is the standard "reachable
with one thumb" pattern for that use case. A rebuild should keep this on
purpose, not default to a top nav just because that's more common for web
apps generally.

- [ ] Dashboard
- [ ] Calendar
- [ ] Log
- [ ] Analytics
- [ ] Groups
- [ ] Settings

**Also present, but outside the tab bar:** a pre-login Auth screen (Google
+ GitHub sign-in) shown instead of the tabbed app entirely when signed out.

**Notable navigation behavior:** there is no router / deep-linking — which
tab is active is just `useState` in `App.jsx`. Refreshing the page always
returns to Dashboard (the one exception: an invite link `?invite=CODE`
force-switches to Groups after auto-joining). Confirm whether "always
resets to Dashboard on reload" is intentional simplicity worth keeping, or
worth fixing in the rebuild — it wasn't a decision made explicitly at any
point, just what not having a router produces by default.

### Dashboard
- [ ] Streak card (current win/loss streak) + Monthly Goal card (editable
      target, progress bar) — a 2-up row above everything else
- [ ] Time range tabs: Today / Past Week / Past Month / Past Year / All Time
- [ ] Metric card grid — 8 cards: Net Profit, ROI, Win Rate, Wagers, Staked
      (Settled), Pending, Biggest Win, Biggest Loss
- [ ] Profit chart with 3 switchable views: Cumulative / Per Bet / Daily

### Calendar
- [ ] Month grid — cells colored by that day's profit/loss, month
      forward/back navigation, running "this month" total in the header
- [ ] Day detail panel — opens on tapping a day (side-by-side on desktop,
      stacked on mobile), lists every bet logged that day, minimizable

### Log
- [ ] Bet Form (new bet) — Single/Parlay toggle; date; sport+league (single)
      or a dynamic add/remove leg list (parlay, each leg with its own
      sport+league); odds; stake; live Projected Profit readout;
      confidence star rating; Win/Loss/Push/Pending status buttons
- [ ] Bet History — list of logged bets with inline edit (same field set as
      the form above) and delete, minimizable to a compact icon rail
- [ ] History Rail — the minimized state of Bet History: just two icon
      buttons (expand history, add a sport/league)
- [ ] Add Sport/League modal — lets a user add a custom sport or league not
      in the built-in list, reachable from both the full and minimized states

### Analytics
- [ ] Time range tabs (same pattern as Dashboard)
- [ ] Category Win Rates (by league)
- [ ] Odds Range Breakdown
- [ ] Leg Breakdown — win rate by number of legs, collapsible
- [ ] Bet Type Comparison — Straight vs Parlay side by side
- [ ] Parlay Sport Composition — frequency of each sport across parlay legs
- [ ] Confidence Calibration
- [ ] Rolling Form Trend
- [ ] Stake Discipline Chart
- [ ] Monte Carlo Simulation — Both/Straight/Parlay filter, bet-count slider,
      expected profit / probability-of-profit / range stats, histogram
- [ ] AI Coach Panel — ranked insight list (expandable beyond the first 4),
      one-line summary at the top

### Groups
- [ ] Join/Create card — tabbed (Join vs Create), collapsible
- [ ] Your Groups list — one collapsible card per group: invite link +
      copy button, member list with kick (owner only), rename (owner only),
      delete (owner) or leave (member), each independently collapsible
- [ ] Leaderboard — group switcher (if in more than one group), then ranked
      rows: medal badges for top 3, your own row highlighted, Overall as a
      hero stat with a bar relative to the group's top performer, Month/
      Week/Today as smaller secondary stats, a mixed-currency warning banner
      when members use different currencies
- [ ] Privacy Toggles — per-stat visibility control (overall P&L, overall
      win rate, week/month/today stats) for what groupmates can see of you

### Settings
- [ ] Account — avatar upload (camera icon overlay), editable display name
      (autosaves on blur), sign out
- [ ] Preferences — currency symbol picker, odds format (American/Decimal)
      toggle, date format toggle
- [ ] Unit Value — a reference "1 unit = $X" number used elsewhere for
      bet-sizing context
- [ ] Appearance — 5 theme options (Dark Slate, OLED Black, Dark Emerald,
      Light, Custom with two color pickers)
- [ ] Data Management — export as PDF, export as JSON, reset all data
      (confirmation dialog required)

### Auth (pre-login, outside the tab bar)
- [ ] Continue with Google (fixed white button — deliberately NOT
      theme-reactive, matches Google's own brand convention)
- [ ] Continue with GitHub (fixed black button — same reasoning, matches
      GitHub's own brand convention)

---

## Don't carry over — structural debt

1. **No tracked schema migrations.** Every `ALTER TABLE`/policy/bucket
   change this project ever needed was a one-off SQL snippet communicated
   in conversation, never committed to git. This is the single biggest
   structural risk found — it means the actual current database schema is
   not fully knowable from this repository alone, and already caused one
   production bug (a feature shipped in code before its matching column
   existed). **Fix in the rebuild:** tracked migration files from day one
   (Supabase CLI migrations, or equivalent).
2. **Hardcoded colors before theming existed.** ~260 hardcoded Tailwind
   color classes were scattered across 31 files before a theme-token layer
   was retrofitted in one large sweep. Happened because there was no design
   token decision made up front. Rebuild should decide on a token layer
   (even a minimal one) before writing the first styled component.
3. **Data computation location kept moving.** Derived stats (profit series,
   category breakdowns, etc.) were originally all computed once in `App.jsx`
   and prop-drilled down; this had to be unwound twice as pages needed
   independent filtering (Dashboard's range tabs, then Analytics' range
   tabs). A rebuild should decide up front which layer owns "derive stats
   from bets for range X" — probably each page/feature owning its own
   derivation from a shared raw data source, which is where this project
   ended up anyway after the rework.
4. **Duplicated form logic between add and edit.** The "log a new bet" form
   and the "edit an existing bet" form (in bet history) are two separate
   components with nearly identical field sets, validation, and submit
   logic. Only the parlay-leg-building sub-piece was ever extracted into a
   shared component (`LegEditor`); the rest is still duplicated. A rebuild
   should have one form component parameterized by "new vs editing," not
   two.
5. **A UI field was removed without removing what depended on it.** "Prep
   Time" was dropped from the bet-logging form (replaced by a live
   Projected Profit readout), but the AI Coach's "prep time paying off"
   insight kept running against the now-permanently-zero field for a while
   after, quietly generating a comparison against meaningless data. Removing
   a field needs a quick downstream-usage check as part of that change, not
   a separate afterthought.
6. **Dead code left in place.** `src/data/sampleBets.js` — a full mock
   dataset — is never imported anywhere in the app. Left over from early
   development.
7. **Currency hardcoded in several places despite a working currency
   setting existing.** Multiple components (Calendar month total, profit
   chart axis/tooltip, Monte Carlo stats, several AI Coach insight message
   strings) independently hardcoded a literal `$` instead of reading the
   user's currency setting, even though that setting already existed and
   worked correctly elsewhere. Suggests currency formatting should have been
   one shared utility called everywhere from the start, not something each
   new component remembers to wire up individually (a `formatCurrency`
   helper does exist in `utils/formatting.js`, but wasn't consistently used).
8. **Organic UI growth without an initial pass.** The Groups page originally
   had two separate always-visible "Join a Group" / "Create a Group" cards;
   later merged into one tabbed, collapsible component. Small sign that
   information architecture for secondary/setup screens wasn't decided
   before building, just before it started feeling cluttered.
9. **Profile creation happens twice, independently.** A `handle_new_user`
   database trigger and the client's `AuthContext.jsx` `ensureProfile()`
   both create the `profiles` row on signup, doing the same
   `full_name → user_name → email` fallback in two places that have to be
   kept in sync by hand. One of these should own it, not both.

---

## Your existing data — this document does not cover it

Everything above is about not losing *logic and UI surface*, not about the
actual data currently sitting in this app (real bet history, groups, group
members). Whether that data survives a rebuild depends entirely on a
decision this document doesn't make on its own:

- **Rebuild the frontend against the same Supabase project (recommended).**
  Nothing about the data changes — bets, groups, profiles, everything stays
  exactly where it is, because the database itself never moves. Only the
  frontend code gets restructured.
- **Start a fresh Supabase project.** None of the existing data comes with
  it automatically — it would need a deliberate export/import pass, *and*
  every function/trigger/policy recovered above would need to be re-applied
  by hand to the new project from scratch.

Given this app is actively used with real betting history and real groups
(per its own README), there's no upside to a fresh database here — only
risk, for no real benefit. The messy parts identified in this document are
almost entirely in the frontend (folder structure, duplicated forms,
hardcoded colors); the backend schema itself is in reasonable shape.

## Handoff

This document is meant as direct input to `app-architect` for the rebuild —
particularly the entity model in "Keep" #1–5 (bets, legs, streaks, currency,
time ranges), the recovered server-side logic section (functions, RLS
policies, and especially the three-different-definitions-of-"week"
inconsistency), and the UI/UX surface checklist above, which should be
walked through and confirmed complete before folder structure gets decided
— it's much easier to notice a missing screen on a checklist than to notice
its absence once the rebuild is already underway.
