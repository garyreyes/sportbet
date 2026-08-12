---
target: Log tab (src/features/log-bet)
total_score: 19
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-08-12T10-41-37Z
slug: src-features-log-bet
---
**Method: dual-agent (A: design review · B: detector scan)**

Neither assessment had a running dev server or browser available, so this run is code-only — no live browser inspection or overlay evidence.

### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 2 | No success confirmation after save/delete; delete-confirm silently reverts after 3s with no visible countdown |
| 2 | Match System / Real World | 3 | Decimal odds, Win/Loss/Push/Pending vocabulary are domain-correct — a genuine strength |
| 3 | User Control and Freedom | 2 | No explicit Cancel on inline edit; no undo after a confirmed delete |
| 4 | Consistency and Standards | 1 | Selected status pills are always emerald (a selected "Loss" renders green), contradicting the red/blue/green semantic mapping used elsewhere; inconsistent labeling (Date/Odds/Stake labeled, Sport/League/Pick not) |
| 5 | Error Prevention | 2 | Submit-time-only validation; deleting a custom league in use by past bets is unguarded |
| 6 | Recognition Rather Than Recall | 2 | "+ Add new sport…" buried as the last dropdown option |
| 7 | Flexibility and Efficiency | 1 | No filter/sort/search on Bet History — flat chronological dump |
| 8 | Aesthetic and Minimalist Design | 3 | Slate/emerald palette consistent, uncluttered |
| 9 | Error Recovery | 2 | Errors are generic strings, no field-level detail |
| 10 | Help and Documentation | 1 | Zero inline help anywhere (no odds-format example, no "what is Push" hint) |
| **Total** | | **19/40** | **Poor band — significant improvements needed** |

### Design Specificity Verdict

Reads as a generic CRUD form-plus-list with betting vocabulary dropped in, not a surface authored around how bettors think about a log. Decimal odds and the 4-way status are correct domain choices, but nothing else is betting-specific — no currency symbol anywhere on stake/odds/profit, and the standout bug: the Projected Profit readout always assumes a win, even after you've explicitly marked a bet Loss or Push.

The deterministic scan came back clean ([], exit 0) — verified this isn't a broken detector: the regex engine's rule set for .tsx files only covers a narrow list (hex colors, banned fonts, gradient text, bounce easing, etc.), and several page-level analyzers don't run on component files at all. A clean scan here means "no anti-patterns in that narrow rule set," not "no design issues."

### What's Working

- `useDraft.ts` — per-bet-id localStorage autosave that merges over defaults, so a stale draft never silently drops a field.
- `BetHistoryRow` reusing `BetForm` for inline edit — create and edit share identical fields/order/behavior.
- `AddSportLeagueModal`'s progressive disclosure — the new-sport text field only appears when needed.

### Priority Issues

**[P1] Projected Profit ignores the selected status.** `BetForm.tsx:77` calls `calculateProfit(odds, stake, 'win')` unconditionally, regardless of `draft.status`. Fix: pass `draft.status` in; relabel contextually.

**[P1] No accessible labels on Sport, League, Pick, or any Leg field.** Unlike Date/Odds/Stake, these are raw `<select>`/`<input>` with no label — a WCAG failure on the fields that determine what the bet actually is.

**[P2] Status color coding contradicts itself between the form and the history list.** Selected status pills in BetForm.tsx are always emerald; BetHistoryRow.tsx's STATUS_COLOR correctly maps loss→red/push→blue/pending→slate.

**[P2] Delete has no countdown and no success confirmation.** Tap-again-to-confirm reverts silently after a fixed 3s; nothing confirms a completed delete either.

**[P2] No filter/sort/search on Bet History.** Fine now, degrades fast once bets accumulate.

### Persona Red Flags

**Sam (accessibility-dependent):** unlabeled Sport/League/Pick fields; AddSportLeagueModal has no role="dialog", no focus trap, no Escape-to-close; no focus:ring classes anywhere in these files.

**Riley (stress tester):** deleting a custom league via the modal doesn't check whether past bets reference it. Editing an old bet afterward hits a `<select value={draft.league}>` matching no `<option>` — the browser silently shows a different league, and saving can quietly swap the bet's recorded league with no warning.

### Minor Observations

No currency symbol anywhere on stake/odds/profit; Save button always reads "Save bet," never "Update bet" in edit context; LegEditor allows unlimited legs with no visual cap; modal backdrop click doesn't close it.

### Questions to Consider

1. The status pills and the Save button share the exact same emerald treatment — is there real visual hierarchy between "I selected this" and "I'm committing this"?
2. This is a money-tracking app that never shows a currency symbol anywhere — deliberate, or just not addressed yet?
