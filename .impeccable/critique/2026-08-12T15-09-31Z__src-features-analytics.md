---
target: src/features/analytics (Phase 5 full, 5a-5e)
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
timestamp: 2026-08-12T15-09-31Z
slug: src-features-analytics
---
Method: dual-agent (A: a270c4107d8009e75 · B: ae8d0374e1c710fc8)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Monte Carlo's 100ms debounce recompute has no in-flight indicator |
| 2 | Match System / Real World | 2 | Profit rendered as bare `+12.34`/`-8.00` in `WinRateRows` with no currency unit — contradicts the project's own `formatCurrency` rule |
| 3 | User Control and Freedom | 3 | Two independent, unsynced time-range controls (shared tabs vs. Monte Carlo's own) risk confusion about what's filtered |
| 4 | Consistency and Standards | 2 | Four panels show win-rate-bar + inline profit; one (Parlay Sport Composition) is count-only; two chart panels are percentage-only — three different "how do we show performance" languages on one page |
| 5 | Error Prevention | 3 | Read-only data views, low error surface |
| 6 | Recognition Rather Than Recall | 3 | Card headers consistently styled and scannable |
| 7 | Flexibility and Efficiency | 2 | No sort/filter-by-league, no cross-panel filtering; power users get no shortcuts |
| 8 | Aesthetic and Minimalist Design | 2 | 10 stacked, near-identically-shaped cards read as visually monotonous; no panel is promoted/demoted except AI Coach's copy tone |
| 9 | Error Recovery | 3 | Empty-state copy present and reasonably worded per panel |
| 10 | Help and Documentation | 3 | AI Coach functions as in-context interpretation — correctly not scored n/a — but its disclosure caption ("not linked to the tabs...") repeats without a shared visual treatment, reading as a bug notice rather than a designed affordance |
| **Total** | | **26/40** | **Acceptable** |

## Design Specificity Verdict

**LLM assessment**: Generic-leaning, with one genuine spark. AI Coach's insight copy (streak, odds-bucket gaps, Straight vs Parlay) is the one place this reads as authored for a bettor's mental model. Six of the nine sub-panels below it are the same `WinRateRows` horizontal-bar primitive with a different title — efficient reuse, but it flattens the domain. Nothing visually signals "sportsbook" specifically (no odds-format distinctiveness, no bet-slip metaphor, no sport/league color-coding).

**Deterministic scan**: `detect.mjs --json src/features/analytics` returned exit 0, `[]` — zero mechanical findings across all 19 files. Cross-checked against the whole `src/` tree (also clean) and against a deliberately non-compliant scratch file, which also returned `[]` — the regex engine appears built around CSS files/`<style>` blocks/CSS-in-JS rather than inline JSX `style={{}}` objects, so this is a real clean pass on what the detector covers, not a validated guarantee of zero raw-style issues in JSX attributes.

**Visual overlays**: Not available this run — no browser-automation tool was exposed in this session, so live injection could not run. This is a code-only critique for the visual-inspection portion; all source-level findings below come from reading the 19 files under `src/features/analytics/` plus `shared/styles.ts` and `shared/components/TimeRangeTabs.tsx`.

## Overall Impression

The Analytics tab works and each panel individually is well-built, but as a *cohesive surface* it reads as a flat stack of ten same-weight cards with no point of view on what matters most. AI Coach's placement at the top is the right instinct — lead with synthesis — but the six win-rate-bar panels beneath it are an unrewarding scan, and the newest addition (profit-next-to-win-rate) introduces both a real correctness gap (no currency unit) and a new visual-consistency question (why does Parlay Sport Composition, alone among the list panels, show no profit?).

## What's Working

- `WinRateRows` is a well-factored, accessible shared primitive — consistent bar/count/profit formatting reused across four panels without drift.
- Chart theming (`chartTheme.ts`, `ChartTooltip`) keeps the two Recharts trend panels and Monte Carlo's histogram visually coherent with each other.
- AI Coach's empty-state and expand/collapse copy ("Log a few more decisive bets to unlock insights") is genuinely warm, on-brand microcopy — not boilerplate.

## Priority Issues

**[P0] Profit has no currency unit** — `WinRateRows.tsx` renders `{row.profit.toFixed(2)}` raw with no symbol, unit, or label, on all four panels that now show it (Category Win Rates, Odds Range Breakdown, Leg Breakdown, Bet Type Comparison). A user sees "33% (3) · +12.34" with no indication whether that's dollars, points, or units. This directly contradicts `CLAUDE.md`'s standing rule that currency formatting always goes through a shared utility. *Fix*: label the figure or route it through a shared formatter once one exists (there is currently no `formatCurrency` utility anywhere in the codebase — every other money display in the app, e.g. `MetricGrid`, `ProfitChart`, has the identical gap, so this is a pre-existing pattern being extended, not a new regression — but it should be tracked as a real gap for Phase 7a's currency-picker work). *Suggested command*: `/impeccable clarify`

**[P1] Inconsistent "how we show performance" language across the page** — four panels are bar+inline-profit, one (Parlay Sport Composition) is count-only, two chart panels are percentage-only. No visual or textual bridge explains why. *Fix*: either give Parlay Sport Composition a comparable stat or add a one-line note explaining the exclusion (per-leg profit attribution isn't meaningful — this reasoning already exists in `ROADMAP.md` but isn't visible in the UI). *Suggested command*: `/impeccable layout`

**[P1] Flat hierarchy across 10 stacked cards** — nothing on the page signals which panel matters most today; AI Coach, six near-identical win-rate cards, two trend charts, and Monte Carlo all carry the same visual weight. *Fix*: promote one hero metric (e.g. current streak or net profit) above the fold as a standalone stat, and/or group the six list-style panels under a lighter visual treatment so they read as one family, not six separate decisions. *Suggested command*: `/impeccable layout`

**[P2] Two unsynced time-range controls disambiguated only by 11px caption text** — the shared Analytics tabs and Monte Carlo's own local range control sit on the same page with only small caption copy telling the user they're different. *Fix*: give Monte Carlo's control a distinct visual treatment (not just caption text) so the difference is legible without reading. *Suggested command*: `/impeccable clarify`

**[P3] AI Coach's insight-card style doesn't echo anywhere else on the page** — its `bg-slate-950/60` boxes are a one-off idiom against an otherwise bar-row page, making the newest and most prominent panel feel visually bolted-on rather than the page's leading voice. *Suggested command*: `/impeccable layout`

## Persona Red Flags

**Alex (Power User)**: No way to sort leagues by worst-performing, no cross-panel filter (pick a league, see it reflected in odds/leg/type breakdowns). Six list-style panels but zero shortcuts or bulk views — Alex will bounce to a spreadsheet for anything beyond a glance.

**Sam (Accessibility-Dependent)**: Profit color-coding (`text-emerald-400`/`text-red-400`) is close to but not purely color-only, since the `+`/`-` sign carries meaning too — acceptable. Bigger gap: the three chart-based panels (`RollingFormTrend`, `StakeDiscipline`, Monte Carlo's histogram) have no `aria-label` or textual/tabular fallback, so a screen-reader user gets nothing from three of ten panels on the page.

## Minor Observations

- `LegBreakdown` defaults to expanded while no other panel is collapsible at all — inconsistent default-state logic worth a second look, not a real bug.
- Monte Carlo's 3-stat grid (`grid-cols-3`) may wrap awkwardly at narrow widths since "Range" shows two numbers in one cell.

## Questions to Consider

- If six of nine panels render the identical `WinRateRows` component, should this page be one "Breakdowns" panel with a dimension picker (League / Odds / Legs / Type) instead of six stacked cards?
- Is AI Coach earning its top slot on design merit, or is it prime real estate because it's the newest feature — would a single hero stat (current streak, this month's P/L) serve the emotional open even better than the insight list does?
- Now that profit sits next to win rate in four places, does win rate alone even remain the primary metric, or has profit quietly become the thing users actually care about — and should the visual hierarchy of each row reflect that?
