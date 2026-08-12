---
target: Dashboard (src/features/dashboard)
total_score: 24
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-08-12T11-38-13Z
slug: src-features-dashboard
---
**Method: dual-agent (A: design review · B: detector scan)**

Code-only review — no live browser/overlay evidence this pass (no dev server available to the sub-agents).

### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | Save/loading states exist; chart/grid loading is just a bare "Loading…" line |
| 2 | Match System / Real World | 3 | Domain vocabulary (ROI, Streak, Push) appropriate for bettors |
| 3 | User Control and Freedom | 2 | Dashboard-level load error is a dead end, no retry |
| 4 | Consistency and Standards | 3 | Strong token reuse, but focusRing's ring-offset color is wrong on buttons inside cards |
| 5 | Error Prevention | 2 | Goal validation is submit-time only |
| 6 | Recognition Rather Than Recall | 2 | Streak/Goal silently ignore the time-range tabs while Metrics/Chart obey them |
| 7 | Flexibility and Efficiency | 2 | No custom date range; chart's 3-view switch is a genuine efficiency win |
| 8 | Aesthetic and Minimalist Design | 3 | Clean, but 8 identically-styled metric tiles read as repetitive |
| 9 | Error Recovery | 2 | Error strings exist, no retry action anywhere |
| 10 | Help and Documentation | 2 | No explanation for "Staked (Settled)" or how ROI is computed |
| **Total** | | **24/40** | **Acceptable band** |

### Design Specificity Verdict

The depth pass succeeded at consistency but not hierarchy: same elevation on hero row, all 8 stat tiles, and chart. Reads as generic KPI-dashboard template.

### What's Working

- shared/styles.ts tokens consistently consumed across every dashboard file
- ProfitChart's Per Bet legend ties dot colors directly to STATUS_HEX
- MonthlyGoalCard's Edit→Save/Cancel flow well-scoped

### Priority Issues

[P1] MetricGrid has no internal hierarchy and ends on the worst number (Biggest Loss last).
[P1] Streak/Goal cards silently ignore the time-range tabs — recognition vs recall bug.
[P2] Money values aren't formatted (no thousands separators).
[P2] focusRing's ring-offset is wrong inside cards (mismatched slate-950 vs slate-900 surface).
[P3] Monthly goal input has no accessible label.

### Persona Red Flags

Riley: dashboard load error has no retry; ProfitChart empty-state check uses pre-settlement-filter length.
Casey: Edit button under comfortable touch target; TimeRangeTabs scroll has no affordance cue.

### Questions to Consider

1. If every surface uses the same elevation, is anything actually elevated?
2. Streak/Goal ignoring the range tabs — intended, or an oversight?
