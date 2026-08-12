import type { BetStatus } from '../../features/log-bet/types'

/** Decimal odds = total payout multiplier including stake. Mirrors calculate_bet_profit(). */
export function calculateProfit(odds: number, stake: number, status: BetStatus): number {
  if (status === 'win') return stake * (odds - 1)
  if (status === 'loss') return -stake
  return 0
}
