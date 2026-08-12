---
target: Calendar (src/features/calendar)
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 1
timestamp: 2026-08-12T12-11-17Z
slug: src-features-calendar
---
**Method: dual-agent (A: design review · B: detector scan)**

Code-only review — no live browser evidence this pass.

### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 2 | A zero-bet month renders "0.00" in win-green — indistinguishable from an actual break-even month |
| 2 | Match System / Real World | 3 | Green/red/blue-push matches money-tracking convention |
| 3 | User Control and Freedom | 3 | Month nav is free; clicking the same day twice doesn't deselect |
| 4 | Consistency and Standards | 4 | Correctly reuses focusRingOnSurface everywhere — Phase 3's ring-offset bug was not reintroduced |
| 5 | Error Prevention | 3 | Read-only surface, low risk |
| 6 | Recognition Rather Than Recall | 2 | No on-page legend for what the colors mean |
| 7 | Flexibility and Efficiency | 2 | No jump-to-month or "today" shortcut, only one-month-at-a-time nav |
| 8 | Aesthetic and Minimalist Design | 3 | Clean, but the day total is 9px — likely unreadable |
| 9 | Error Recovery | 2 | Bare error string, no retry |
| 10 | Help and Documentation | 2 | No legend/tooltip anywhere |
| Total | | 26/40 | Acceptable band |

### Design Specificity Verdict

Sign-based coloring is deliberate, correctly wired to filterSettled/STATUS_HEX -- but half-finished: encodes direction, abandons magnitude, and nothing discloses the settled-vs-pending scoping.

### What's Working

- focusRingOnSurface used correctly everywhere -- Phase 3's ring-offset bug not reintroduced
- Real timezone discipline: toLocalDateKey/monthPrefix consistently used
- DayDetailPanel's minimize/expand is a genuinely good progressive-disclosure pattern

### Priority Issues

[P0] Silent scope mismatch, same pattern class as the Phase 3 fix: computeDailyTotals filters to settled bets only, so a pending-only day renders identically to a no-bets day, but DayDetailPanel shows unfiltered bets -- tapping an "empty" cell can reveal pending activity. Nothing discloses grid colors are settled-only.
[P1] Day cells have no accessible name beyond the bare number -- no aria-label.
[P2] Zero-data month renders as a misleading green "0.00" instead of an honest empty state.
[P2] Magnitude has no visual encoding -- a -$5 day and a -$5,000 day render identically.
[P3] No legend anywhere for the color scheme.

### Persona Red Flags

Jordan: opens Calendar with nothing logged, sees green "0.00" -- reads as breaking even, not "nothing logged."
Sam: 42 unlabeled buttons, no ARIA grid pattern, 30+ tab presses to reach a late-month day.
Riley: every loss day renders identical red regardless of size -- a blow-up loss is camouflaged.

### Questions to Consider

1. Should day-cell intensity scale with magnitude, not just sign?
2. Is "can't tell pending-only from empty" acceptable for v1, or a real information loss?
