import type { Bet } from '../types/bet'

/** Date-desc, created_at-desc — the project's one same-day tiebreak rule. */
export function sortBets(bets: Bet[]): Bet[] {
  return [...bets].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1
    return a.created_at < b.created_at ? 1 : -1
  })
}
