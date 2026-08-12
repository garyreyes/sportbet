---
target: Analytics (src/features/analytics, 5a-5d)
total_score: 21
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 1
timestamp: 2026-08-12T14-29-53Z
slug: src-features-analytics
---
**Method: dual-agent (A: design review · B: detector scan)**

Scoped to sub-phases 5a-5d only; 5e (AI Coach) doesn't exist yet. Code-only review, no live browser evidence this pass.

### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 2 | Single page-level loading/error; Monte Carlo recomputes 500 trials per slider tick with no busy indicator |
| 2 | Match System / Real World | 3 | Labels domain-correct |
| 3 | User Control and Freedom | 2 | Only 1 of 8 panels collapsible, defaults open |
| 4 | Consistency and Standards | 2 | TimeRangeTabs reused verbatim in two places meaning different things, zero visual distinction |
| 5 | Error Prevention | 3 | Monte Carlo's 5-bet guard explicit |
| 6 | Recognition Rather Than Recall | 2 | Nothing discloses Monte Carlo's range is independent |
| 7 | Flexibility and Efficiency | 1 | No jump-to-panel nav across 8 stacked cards |
| 8 | Aesthetic and Minimalist Design | 2 | Page as a whole is a uniform wall |
| 9 | Error Recovery | 2 | Raw error string, no retry |
| 10 | Help and Documentation | 2 | No explanation Monte Carlo numbers are simulated |
| Total | | ~21/40 | Acceptable-to-Poor boundary |

### Design Specificity Verdict

Competently generic analytics boilerplate. WinRateList/FrequencyList reuse is good engineering but 8 panels at identical weight in phase-shipping order, not narrative order.

### What's Working

- WinRateRows/WinRateList reusable primitive, 5 panels consume without duplication
- Monte Carlo's explicit null-below-minimum guard
- focusRingOnSurface correctly applied on every interactive element these components wrote themselves

### Priority Issues

[P0] TimeRangeTabs regresses the Phase 3 focus-ring bug -- confirmed independently by both assessments. Hardcodes page-level focusRing with no surface-aware variant; correct at page level, wrong inside MonteCarloSimulation's card.
[P0] Monte Carlo's independent time range disclosed nowhere in the UI -- visually identical TimeRangeTabs, full unfiltered history instead of rangedBets.
[P1] No page-level IA for 8 stacked panels -- pure scroll-and-hope.
[P2] Sparse account sees 8 near-duplicate "not enough data" messages stacked vertically.
[P3] LegBreakdown's collapse toggle is the only one of 8 panels, defaults open.

### Persona Red Flags

Alex: sets "Last 7 Days" up top, scrolls to Monte Carlo, silently misreads full-history numbers as recent form.
Jordan: wall of "not enough data" messages with no framing this is normal.

### Questions to Consider

1. Wasn't Monte Carlo's local-range fix a workaround for the page's real problem (no navigation)?
2. With 8 equal-weight panels, is this a 30-second glance or an end-to-end read?
