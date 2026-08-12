import { filterDecisive } from '../../shared/utils/betFilters'
import type { Bet } from '../../shared/types/bet'
import { bucketForOdds, ODDS_BUCKETS } from './oddsBuckets'

export interface GroupWinRate {
  label: string
  wins: number
  total: number
  winRate: number
}

export function toWinRates(groups: Map<string, { wins: number; total: number }>): GroupWinRate[] {
  return [...groups.entries()].map(([label, { wins, total }]) => ({
    label,
    wins,
    total,
    winRate: total > 0 ? (wins / total) * 100 : 0,
  }))
}

function bump(groups: Map<string, { wins: number; total: number }>, key: string, isWin: boolean) {
  const entry = groups.get(key) ?? { wins: 0, total: 0 }
  entry.total += 1
  if (isWin) entry.wins += 1
  groups.set(key, entry)
}

function sortByOrder(rows: GroupWinRate[], order: string[]): GroupWinRate[] {
  return [...rows].sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label))
}

/** Win rate by league — parlays deliberately collapse into one "Parlay" bucket, not exploded per leg. */
export function computeCategoryWinRates(bets: Bet[]): GroupWinRate[] {
  const groups = new Map<string, { wins: number; total: number }>()
  for (const bet of filterDecisive(bets)) {
    bump(groups, bet.legs ? 'Parlay' : bet.league, bet.status === 'win')
  }
  return toWinRates(groups).sort((a, b) => b.total - a.total)
}

/** Win rate by decimal-odds bucket. */
export function computeOddsBucketWinRates(bets: Bet[]): GroupWinRate[] {
  const groups = new Map<string, { wins: number; total: number }>()
  for (const bet of filterDecisive(bets)) {
    bump(groups, bucketForOdds(bet.odds).label, bet.status === 'win')
  }
  return sortByOrder(toWinRates(groups), ODDS_BUCKETS.map((b) => b.label))
}

const LEG_BUCKET_ORDER = ['2 legs', '3 legs', '4 legs', '5 legs', '6+ legs']

function legBucketLabel(legCount: number): string {
  if (legCount >= 6) return '6+ legs'
  return `${legCount} legs`
}

/** Win rate of N-leg parlays as a unit — only the whole parlay's outcome is known, not each leg's. */
export function computeLegBreakdown(bets: Bet[]): GroupWinRate[] {
  const groups = new Map<string, { wins: number; total: number }>()
  for (const bet of filterDecisive(bets)) {
    if (!bet.legs) continue
    bump(groups, legBucketLabel(bet.legs.length), bet.status === 'win')
  }
  return sortByOrder(toWinRates(groups), LEG_BUCKET_ORDER)
}

/** Straight vs Parlay win rate. */
export function computeBetTypeComparison(bets: Bet[]): GroupWinRate[] {
  const groups = new Map<string, { wins: number; total: number }>()
  for (const bet of filterDecisive(bets)) {
    bump(groups, bet.legs ? 'Parlay' : 'Straight', bet.status === 'win')
  }
  return sortByOrder(toWinRates(groups), ['Straight', 'Parlay'])
}
