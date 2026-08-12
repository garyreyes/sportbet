# Roadmap — sportsbet rebuild

Decomposes `ARCHITECTURE.md` into sub-phases sized for one `feature-planner`
pass each. Status tracked here; matching entries land in `CHANGES.md` as
each sub-phase ships. Keep the two in sync — this file says what's left,
`CHANGES.md` says what happened.

Status values: `not started` / `in progress` / `done`.

**Design checkpoints:** each sub-phase gets a lightweight `/impeccable
audit` (accessibility, responsiveness, broken states) as part of its
correctness gate. Once every sub-phase in a phase is done, that phase
gets a heavier `/impeccable critique` + `/impeccable polish` pass,
tracked as its own checklist item below — related screens get judged for
visual consistency together, not one sub-phase at a time.

**Theming risk:** Phase 7b defines the real visual system (5 themes,
custom color derivation) — everything polished in Phases 1–6 before that
lands is judged against a provisional look only. See Phase 7's re-audit
item below.

## Phase 1 — Foundation

- [x] **1a. App shell + Supabase auth** — done. Routing, bottom nav, OAuth
      sign-in, route guard, invite-link passthrough.
- [x] **1b. Seed schema migration baseline** — done. `db pull` needed
      Docker (unavailable here), so used a direct `pg_dump`/`psql`
      connection instead. Discovered real schema drift vs
      `MIGRATION_EXTRACTION.md` (confirmed intentional by the user);
      `ARCHITECTURE.md`'s entity model updated to match live reality. See
      `supabase/migrations/README.md` and `ARCHITECTURE.md` → "Schema
      drift note".
- [ ] **Impeccable critique + polish (Phase 1)** — not started. Run once
      1a/1b are both done (they are) — review app shell + nav together.

## Phase 2 — Log (core bet data)

- [x] **2a. Bet Form** — done. Single/parlay toggle, dynamic add/remove
      leg list, decimal odds, stake, live Projected Profit, Win/Loss/
      Push/Pending buttons, localStorage draft autosave/merge. No
      confidence stars (column doesn't exist — see Phase 1b's drift
      note). Built as a reusable `BetForm` (optional `initialBet` +
      `onSubmit`) so Phase 2b's edit flow can reuse it without
      duplicating the form.
- [x] **2b. Bet History** — done. List of logged bets (reuses `BetForm`
      for inline edit), delete with inline "tap again to confirm".
      `useBets()` introduced and lifted to `LogPage` so the form and list
      share one fetch — the single-source-of-truth pattern Dashboard/
      Calendar/Analytics will reuse later.
- [x] **2c. History Rail + Add Sport/League modal** — done. Bet History
      now has a minimize toggle (rail state = two icon buttons: expand,
      add sport/league); the modal itself has a sport dropdown (existing
      sports + "add new") rather than always requiring free text, so
      adding a league under an existing sport doesn't risk a
      case-mismatched duplicate. New table `custom_sport_leagues`
      (per-user, RLS-scoped) — first schema change made *during* the
      rebuild itself, applied via `supabase db push` (works without
      Docker, unlike `db pull`/`db dump`).
- [x] **Impeccable critique + polish (Phase 2)** — done. Dual-agent
      critique scored 19/40 (Poor band), code-only review (no dev
      server/browser available to the sub-agents). Fixed the two
      correctness issues chosen as this pass's scope: Projected Profit
      was hardcoded to the win scenario regardless of selected status
      (now reflects Loss/Push/Pending correctly, relabels to "Profit"
      once settled); editing a bet after its custom league was deleted
      could silently swap the recorded league on save (now guaranteed
      via `ensureBetOptions`). Remaining findings (missing field labels,
      status-color inconsistency between form and history, no delete
      countdown/success toast, no filter/sort on history, no currency
      symbol — deferred to Phase 7a) logged in
      `.impeccable/critique/2026-08-12T10-41-37Z__src-features-log-bet.md`
      for a later pass.

## Phase 3 — Dashboard

- [x] **3a. Metrics** — done. Streak card, editable Monthly Goal card
      (calendar-month, new `profiles.monthly_goal` column), rolling time
      range tabs (Today/Past 7 Days/Past 30 Days/Past Year/All Time — the
      relabeled rolling windows per `ARCHITECTURE.md`'s revised decision,
      not calendar-aligned), 8-card metric grid. `useBets()` promoted
      from log-bet-local to a shared `BetsProvider` (wraps the router
      `<Outlet>` in `AppLayout`) so Dashboard and Log now share one fetch
      — the first real test of the "fetched once, every page derives its
      own view" pattern. `Bet`/`BetStatus`/`Leg`/`BetInput` types, filter
      helpers (decisive/settled), time-range config, and streak calc all
      moved to `shared/` since this is the first feature to need them
      outside Log.
- [x] **3b. Profit chart** — done. Cumulative (line) / Per Bet (bar,
      status-colored) / Daily (bar, diverging around zero) views, built
      with Recharts (new dependency, chosen over hand-rolled SVG). Shares
      the dashboard's active time-range filter. Followed the `dataviz`
      skill's procedure for form/color/mark choices.
- [x] **Shared UI depth pass** — done, ahead of the formal Phase 3
      Impeccable checkpoint. User feedback mid-build: the built screens
      (Log, Dashboard, Auth) felt "skeletal" — flat borders, no surface
      layering, zero hover/focus feedback. Added `shared/styles.ts`
      (card/button/input/focus tokens) and applied it across every
      shared component and both features' screens: real offset+blur
      shadows, a card surface color distinct from the page background,
      hover/active states on every button (previously had none), and
      themed focus rings (also closes two accessibility gaps flagged in
      the Phase 2 critique: missing focus indicators and unlabeled
      Sport/League/Pick fields, fixed in the same pass since `BetForm`
      was already being touched). Deliberately scoped to structure, not
      new colors — Phase 7b's real theming re-skins this, doesn't
      replace it.
- [x] **Impeccable critique + polish (Phase 3)** — done. Dual-agent
      critique scored 24/40 (Acceptable band). Fixed the two P1/correctness
      issues chosen for this pass: `focusRingOnSurface` split from
      `focusRing` (the shared button/input tokens had hardcoded a
      page-level ring-offset color that showed a mismatched notch on
      every button sitting inside a card/modal — a bug the depth pass
      itself introduced); Streak and Monthly Goal cards now carry visible
      "All time"/"This calendar month" captions since they don't respond
      to the time-range tabs sitting directly below them, unlike Metrics
      and the chart. Remaining findings (MetricGrid has no internal
      hierarchy and ends on Biggest Loss, money values unformatted, no
      retry on load error, goal input unlabeled) logged in
      `.impeccable/critique/2026-08-12T11-38-13Z__src-features-dashboard.md`
      for a later pass.

## Phase 4 — Calendar

- [x] **4a. Month grid + day detail** — done. P/L-colored day cells
      (sign-based, matching `ProfitChart`'s Daily view — not
      magnitude-scaled), month nav, running calendar-month total in the
      header, read-only day detail panel (side-by-side desktop / stacked
      mobile, minimizable). Third consumer of `useBetsContext()`.
      Extracted `monthPrefix()` to `shared/utils/date.ts` (was duplicated
      inline in `MonthlyGoalCard`) since Calendar needed the identical
      calendar-month logic — now the one shared source both use, so the
      Calendar month total and Dashboard's Monthly Goal figure are
      guaranteed to agree for the same month.
- [x] **Impeccable critique + polish (Phase 4)** — done. Dual-agent
      critique scored 26/40 (Acceptable band). Fixed the P0 + P1
      issues: `computeDaysWithOnlyPending()` distinguishes a
      pending-only day (small amber dot) from a genuinely empty day —
      previously both rendered as the identical neutral gray cell,
      while the day panel showed unfiltered bets, so tapping an
      "empty" cell could silently reveal pending activity; day cells
      now carry a full `aria-label` (date + net profit or pending/empty
      status) instead of just the bare day number. Confirmed the
      Phase 3 `focusRingOnSurface` fix was **not** regressed by this
      new code. Remaining findings (no magnitude encoding — a -$5 and
      -$5,000 day render identically, misleading green "0.00" on a
      zero-data month, no legend, no jump-to-month) logged in
      `.impeccable/critique/2026-08-12T12-11-17Z__src-features-calendar.md`
      for a later pass.

## Phase 5 — Analytics

- [x] **5a. Category Win Rates + Odds Range Breakdown** — done. Shared
      `TimeRangeTabs` wired into Analytics (fourth `useBetsContext()`
      consumer). Category grouping deliberately collapses all parlays
      into one "Parlay" bucket rather than exploding per leg (Keep #5).
      Odds bucketed into a standard 6-range favorite→longshot scheme
      (1.01–1.50 ... 10.01+). `AnalyticsPage` owns time-range state and
      passes ranged bets down to panels — the template `5b`–`5e` follow.
- [x] **5b. Leg Breakdown + Bet Type Comparison + Parlay Sport Composition**
      — done. Leg Breakdown groups whole-parlay outcomes by leg count
      (2/3/4/5/6+, long tail bucketed per the odds-bucket precedent),
      with a collapse toggle (only this panel is described as
      collapsible in the UI inventory). Bet Type Comparison (Straight
      vs Parlay) reuses the `WinRateList` shape directly. Parlay Sport
      Composition counts sport frequency across all parlay legs — the
      one place per-leg data is aggregated, since Keep #5 restricts
      *outcome* attribution per leg, not composition counting; got its
      own `FrequencyList` display component since counts aren't
      percentages. Extracted `WinRateRows` out of `WinRateList` so
      Leg Breakdown's collapsible variant didn't duplicate the row
      markup.
- [x] **5c. Rolling Form Trend + Stake Discipline** — done. **Scope
      change confirmed with the user:** Confidence Calibration dropped
      entirely — the `confidence` rating column doesn't exist in the
      live schema (removed per Phase 1b's drift correction, Bet Form
      already built without it); re-adding it was considered and
      declined rather than silently reopened. Rolling Form Trend: win
      rate over a trailing 10-decisive-bet window, line chart. Stake
      Discipline: stake per bet (bars) against a running average stake
      (line) — a proxy for "am I sizing up after losses" without a
      bankroll concept the app doesn't track. Extracted
      `shared/utils/chartTheme.ts` and `shared/components/ChartTooltip.tsx`
      out of `ProfitChart` since this is now the third/fourth chart
      needing the identical dark-theme treatment.
- [x] **5d. Monte Carlo Simulation** — done. Bootstrap resampling (500
      trials, draw-with-replacement from real historical settled-bet
      profits), 5-bet minimum guard, Both/Straight/Parlay filter,
      bet-count slider (1–100, default 20), expected profit/probability-
      of-profit/range stats, histogram. Initially wired to the shared
      Analytics time-range tabs like every other panel, then given its
      **own local time-range control** per user feedback after seeing it
      live — the panel sits far down the page, so scrolling to the top
      tabs to change range was annoying enough to warrant a dedicated
      one, decoupled from the page-level range.
- [x] **Impeccable critique + polish (5a–5d)** — done. Dual-agent
      critique scored ~21/40, two P0s fixed: `TimeRangeTabs` gained an
      `onSurface` prop so its focus ring matches the surface it's on
      (Monte Carlo's card was the first reuse inside a card — a
      regression of the exact bug Phase 3's critique already fixed
      once); Monte Carlo's independent time-range control now carries a
      visible disclosure caption so its numbers can't be misread as
      reflecting the page's shared range. Also fixed two live-reported
      bugs alongside: Monte Carlo's bet-count slider debounced (100ms)
      so dragging no longer recomputes 500 trials per tick; app-wide
      fluid root `font-size` via `clamp()` so text scales on narrow
      viewports instead of staying fixed. Findings logged in
      `.impeccable/critique/2026-08-12T14-29-53Z__src-features-analytics.md`.
      Full Phase 5 critique (including 5e) still to come once AI Coach
      ships.
- [x] **5e. AI Coach Panel** — done. Ranked insight list (streak,
      best/worst league gap, best/worst odds-bucket gap, Straight vs
      Parlay gap), tuned thresholds per `MIGRATION_EXTRACTION.md` §8 (min
      3 decisive bets per group, ≥15pp win-rate gap, ≥3-bet streak),
      one-line count summary at top, expandable past the first 4, empty
      state below threshold. Reuses existing computation entirely
      (`calculateStreak`, `computeCategoryWinRates`,
      `computeOddsBucketWinRates`, `computeBetTypeComparison`) — no new
      data pattern. Deliberately does **not** carry over the old "prep
      time paying off" insight (§"Don't carry over" #5 — the underlying
      field doesn't exist in this schema). Placed at the top of Analytics
      and, like Monte Carlo, uses full history rather than the shared
      time-range tabs (confirmed with the user) since its thresholds need
      more sample than a narrow range would leave. Also added a `profit`
      figure alongside win rate on the four win-rate panels (Category,
      Odds Range, Leg Breakdown, Bet Type Comparison) per live user
      feedback after seeing the plain win-rate bars — `GroupWinRate` now
      carries `profit`, computed the same way as everywhere else via
      `calculateProfit`. Parlay Sport Composition intentionally excluded
      (frequency count, not a per-bet outcome — no clean profit
      attribution per leg).
- [x] **Impeccable critique + polish (Phase 5 full, 5a–5e)** — done.
      Dual-agent critique scored 26/40 (Acceptable), up from 21/40 on the
      earlier 5a–5d-only pass. Fixed all 5 findings: profit figures on the
      four win-rate panels now carry a "P/L" label instead of a bare
      signed number (P0 — no currency utility exists yet, so this labels
      the figure rather than guessing a symbol, deferred properly to
      Phase 7a); Parlay Sport Composition gained an explanatory caption
      for why it has no win-rate/profit figure unlike the panels above it
      (P1); the page now groups its nine data panels under "Breakdowns" /
      "Trends" / "Simulation" section labels instead of reading as one
      flat stack of ten same-weight cards (P1); a new shared `ScopeBadge`
      pill (amber, dot + text) replaces the plain caption text on AI
      Coach and Monte Carlo's independent-scope disclosures, so the two
      "this control isn't linked to the tabs" panels are visually
      distinct at a glance, not just via small caption text (P2), and
      gives AI Coach's presentation a idiom it can share with another
      panel instead of being a one-off style (P3). Findings logged in
      `.impeccable/critique/2026-08-12T15-09-31Z__src-features-analytics.md`.
      **Phase 5 (Analytics) is complete.**

## Phase 6 — Groups

- [x] **6a. Join/Create card** — done. Tabbed (Join/Create), collapsible
      (defaults expanded if the user has zero groups, collapsed once
      they have at least one). `groups`/`group_members` and both
      `handle_new_group` (trigger)/`join_group_by_invite_code` (RPC)
      already existed in the baseline schema — owner auto-join needed no
      client insert. One new migration added:
      `get_group_preview_by_invite_code`, a narrow `SECURITY DEFINER`
      RPC returning just `{id, name}` by invite code with no membership
      check, since `groups_select_member`'s RLS blocks a plain SELECT
      for a non-member and the confirm-before-joining flow (chosen over
      silent auto-join) needs to show the group's name before the user
      commits. Both the `?invite=CODE` deep-link path and manually typed
      codes go through the same preview-then-confirm step. Applied via
      `supabase db push` after explicit user confirmation, per the
      project's live-database rule.
- [x] **6b. Your Groups list** — done. One collapsible card per group
      (defaults expanded only if the user has exactly one group), each
      with: invite link + copy button (`origin/groups?invite=CODE`);
      member list showing name/owner tag with a kick button per non-self
      member (owner only); rename (owner only, edit-button → input +
      Save/Cancel, not autosave-on-blur — that pattern doesn't exist yet
      elsewhere in the app); delete (owner) or leave (member), reusing
      `BetHistoryRow`'s tap-again-to-confirm pattern rather than a new
      modal. No schema changes needed — `groups_update_owner` already
      covered rename, kick/leave/delete were already fully covered by
      existing RLS policies. `getUserGroups()` fetches group_members,
      groups, and profiles as three separate queries and merges
      client-side, since `group_members.user_id` references
      `auth.users`, not `profiles`, so PostgREST can't embed a profile
      join directly off it.
- [ ] **6c. Leaderboard** — not started. `get_group_leaderboard` RPC,
      group switcher, medal badges, hero stat with relative bar,
      mixed-currency warning banner.
- [ ] **6d. Privacy Toggles** — not started. Per-stat visibility
      (overall P&L, overall win rate, week/month/today).
- [ ] **Impeccable critique + polish (Phase 6)** — not started.

## Phase 7 — Settings

- [ ] **7a. Account + Preferences** — not started. Avatar upload, display
      name autosave-on-blur, sign out; currency picker, odds format
      (American/Decimal), date format.
- [ ] **7b. Unit Value + Appearance** — not started. "1 unit = $X"
      reference value; 5 themes (Dark Slate, OLED Black, Dark Emerald,
      Light, Custom with two-color derivation).
- [ ] **7c. Data Management** — not started. Export PDF, export JSON,
      reset all data (confirmation dialog required).
- [ ] **Impeccable critique + polish (Phase 7)** — not started.
- [ ] **Re-audit Phases 1–6 against final theme system** — not started.
      7b is where the real 5-theme visual system lands; anything polished
      in Phases 1–6 before this was judged against a provisional look
      only. Re-run `/impeccable polish` across those phases once 7b ships
      and all 5 themes are actually testable, unless `DESIGN.md`'s
      original tokens are confirmed to already fully cover them.

## Phase 8 — Production readiness

- [ ] **8a. PWA** — not started. Manifest, `autoUpdate` service worker,
      installability testable in `npm run dev`.
- [ ] **8b. Deployment + security headers** — not started. Hosting config,
      CSP/HSTS/X-Frame-Options (open item from `SECURITY_BASELINE.md` §12).
- [ ] **8c. Final QA pass** — not started. Walk the full UI/UX inventory
      checklist in `MIGRATION_EXTRACTION.md` against the live app.
- [ ] **8d. Full-app Impeccable polish** — not started. Whole-app
      `/impeccable polish`, not per-section — final shipping-readiness
      design pass before calling the rebuild production-ready.
