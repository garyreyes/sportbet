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

- [ ] **3a. Metrics** — not started. Streak card, Monthly Goal card, time
      range tabs (Today/Past Week/Past Month/Past Year/All Time), 8-card
      metric grid (Net Profit, ROI, Win Rate, Wagers, Staked, Pending,
      Biggest Win, Biggest Loss).
- [ ] **3b. Profit chart** — not started. Cumulative / Per Bet / Daily
      switchable views.
- [ ] **Impeccable critique + polish (Phase 3)** — not started. Run once
      3a/3b are both done — review Metrics + chart together.

## Phase 4 — Calendar

- [ ] **4a. Month grid + day detail** — not started. P/L-colored day cells,
      month nav, running month total, day detail panel (side-by-side
      desktop / stacked mobile, minimizable).
- [ ] **Impeccable critique + polish (Phase 4)** — not started.

## Phase 5 — Analytics

- [ ] **5a. Category Win Rates + Odds Range Breakdown** — not started.
      Plus the shared time-range tabs for this tab.
- [ ] **5b. Leg Breakdown + Bet Type Comparison + Parlay Sport Composition**
      — not started.
- [ ] **5c. Confidence Calibration + Rolling Form Trend + Stake Discipline**
      — not started.
- [ ] **5d. Monte Carlo Simulation** — not started. Bootstrap resampling,
      500 trials, 5-bet minimum guard, Both/Straight/Parlay filter.
- [ ] **5e. AI Coach Panel** — not started. Ranked insight list, tuned
      thresholds (min 3 decisive bets, ≥15pp gap, ≥3-bet streaks).
- [ ] **Impeccable critique + polish (Phase 5)** — not started. Run once
      5a–5e are all done — five sub-phases sharing one tab, review as one
      cohesive surface.

## Phase 6 — Groups

- [ ] **6a. Join/Create card** — not started. Tabbed, collapsible;
      `join_group_by_invite_code` wiring; owner auto-join via
      `handle_new_group` trigger (no client insert needed).
- [ ] **6b. Your Groups list** — not started. Invite link/copy, member
      list with kick (owner), rename (owner), delete (owner)/leave (member).
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
