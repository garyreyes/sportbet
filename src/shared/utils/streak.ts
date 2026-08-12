import { sortBets } from '../bets/sortBets'
import { filterDecisive } from './betFilters'
import type { Bet, BetStatus } from '../types/bet'

export interface Streak {
  type: Extract<BetStatus, 'win' | 'loss'> | null
  count: number
}

/** Consecutive same-result decisive bets, most recent first (date desc, created_at desc tiebreak). */
export function calculateStreak(bets: Bet[]): Streak {
  const decisive = sortBets(filterDecisive(bets))
  if (decisive.length === 0) return { type: null, count: 0 }

  const type = decisive[0].status as 'win' | 'loss'
  let count = 0
  for (const bet of decisive) {
    if (bet.status !== type) break
    count++
  }
  return { type, count }
}
