# Roadmap — sportsbet rebuild

Decomposes `ARCHITECTURE.md` into sub-phases sized for one `feature-planner`
pass each. Status tracked here; matching entries land in `CHANGES.md` as
each sub-phase ships. Keep the two in sync — this file says what's left,
`CHANGES.md` says what happened.

Status values: `not started` / `in progress` / `done`.

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

## Phase 2 — Log (core bet data)

- [ ] **2a. Bet Form** — not started. Single/parlay toggle, dynamic
      add/remove leg list, odds, stake, live Projected Profit, confidence
      stars, Win/Loss/Push/Pending buttons, localStorage draft
      autosave/merge.
- [ ] **2b. Bet History** — not started. List of logged bets, inline edit
      (reuses the Bet Form component, parameterized new-vs-editing), delete.
- [ ] **2c. History Rail + Add Sport/League modal** — not started.
      Minimized icon-rail state of Bet History; modal for custom
      sport/league entries.

## Phase 3 — Dashboard

- [ ] **3a. Metrics** — not started. Streak card, Monthly Goal card, time
      range tabs (Today/Past Week/Past Month/Past Year/All Time), 8-card
      metric grid (Net Profit, ROI, Win Rate, Wagers, Staked, Pending,
      Biggest Win, Biggest Loss).
- [ ] **3b. Profit chart** — not started. Cumulative / Per Bet / Daily
      switchable views.

## Phase 4 — Calendar

- [ ] **4a. Month grid + day detail** — not started. P/L-colored day cells,
      month nav, running month total, day detail panel (side-by-side
      desktop / stacked mobile, minimizable).

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

## Phase 7 — Settings

- [ ] **7a. Account + Preferences** — not started. Avatar upload, display
      name autosave-on-blur, sign out; currency picker, odds format
      (American/Decimal), date format.
- [ ] **7b. Unit Value + Appearance** — not started. "1 unit = $X"
      reference value; 5 themes (Dark Slate, OLED Black, Dark Emerald,
      Light, Custom with two-color derivation).
- [ ] **7c. Data Management** — not started. Export PDF, export JSON,
      reset all data (confirmation dialog required).

## Phase 8 — Production readiness

- [ ] **8a. PWA** — not started. Manifest, `autoUpdate` service worker,
      installability testable in `npm run dev`.
- [ ] **8b. Deployment + security headers** — not started. Hosting config,
      CSP/HSTS/X-Frame-Options (open item from `SECURITY_BASELINE.md` §12).
- [ ] **8c. Final QA pass** — not started. Walk the full UI/UX inventory
      checklist in `MIGRATION_EXTRACTION.md` against the live app.
