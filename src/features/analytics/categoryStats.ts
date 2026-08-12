import { filterDecisive } from '../../shared/utils/betFilters'
import type { Bet } from '../../shared/types/bet'
import { bucketForOdds, ODDS_BUCKETS } from './oddsBuckets'

export interface GroupWinRate {
  label: string
  wins: number
  total: number
  winRate: number
}

function toWinRates(groups: Map<string, { wins: number; total: number }>): GroupWinRate[] {
  return [...groups.entries()].map(([label, { wins, total }]) => ({
    label,
    wins,
    total,
    winRate: total > 0 ? (wins / total) * 100 : 0,
  }))
}

/** Win rate by league — parlays deliberately collapse into one "Parlay" bucket, not exploded per leg. */
export function computeCategoryWinRates(bets: Bet[]): GroupWinRate[] {
  const groups = new Map<string, { wins: number; total: number }>()
  for (const bet of filterDecisive(bets)) {
    const category = bet.legs ? 'Parlay' : bet.league
    const entry = groups.get(category) ?? { wins: 0, total: 0 }
    entry.total += 1
    if (bet.status === 'win') entry.wins += 1
    groups.set(category, entry)
  }
  return toWinRates(groups).sort((a, b) => b.total - a.total)
}

/** Win rate by decimal-odds bucket. */
export function computeOddsBucketWinRates(bets: Bet[]): GroupWinRate[] {
  const groups = new Map<string, { wins: number; total: number }>()
  for (const bet of filterDecisive(bets)) {
    const label = bucketForOdds(bet.odds).label
    const entry = groups.get(label) ?? { wins: 0, total: 0 }
    entry.total += 1
    if (bet.status === 'win') entry.wins += 1
    groups.set(label, entry)
  }
  const order = ODDS_BUCKETS.map((bucket) => bucket.label)
  return toWinRates(groups).sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label))
}
