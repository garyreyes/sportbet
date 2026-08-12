import { sortBets } from '../../shared/bets/sortBets'
import { filterDecisive } from '../../shared/utils/betFilters'
import type { Bet } from '../../shared/types/bet'

export interface FormPoint {
  index: number
  date: string
  winRate: number
}

/** Chronological order (oldest first) — the natural reading order for a trend line. */
function chronological(bets: Bet[]): Bet[] {
  return sortBets(bets).reverse()
}

/** Win rate over a trailing window of decisive bets — expands until it reaches windowSize, then slides. */
export function computeRollingFormTrend(bets: Bet[], windowSize = 10): FormPoint[] {
  const decisive = chronological(filterDecisive(bets))
  return decisive.map((bet, i) => {
    const windowStart = Math.max(0, i - windowSize + 1)
    const window = decisive.slice(windowStart, i + 1)
    const wins = window.filter((b) => b.status === 'win').length
    return { index: i + 1, date: bet.date, winRate: (wins / window.length) * 100 }
  })
}

export interface StakePoint {
  index: number
  date: string
  stake: number
  avgStake: number
}

/** Stake per bet against the running average stake — staking behavior isn't outcome-dependent, so all statuses count. */
export function computeStakeDiscipline(bets: Bet[]): StakePoint[] {
  const ordered = chronological(bets)
  let runningTotal = 0
  return ordered.map((bet, i) => {
    runningTotal += bet.stake
    return {
      index: i + 1,
      date: bet.date,
      stake: bet.stake,
      avgStake: runningTotal / (i + 1),
    }
  })
}
