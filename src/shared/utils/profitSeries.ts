import { calculateProfit } from './profit'
import { filterSettled } from './betFilters'
import { sortBets } from '../bets/sortBets'
import type { Bet } from '../types/bet'

export interface CumulativePoint {
  date: string
  total: number
}

export interface PerBetPoint {
  index: number
  date: string
  profit: number
  status: Bet['status']
}

export interface DailyPoint {
  date: string
  total: number
}

/** Chronological order (oldest first) — the natural reading order for all 3 views. */
function chronologicalSettled(bets: Bet[]): Bet[] {
  return sortBets(filterSettled(bets)).reverse()
}

export function cumulativeSeries(bets: Bet[]): CumulativePoint[] {
  let running = 0
  return chronologicalSettled(bets).map((bet) => {
    running += calculateProfit(bet.odds, bet.stake, bet.status)
    return { date: bet.date, total: running }
  })
}

export function perBetSeries(bets: Bet[]): PerBetPoint[] {
  return chronologicalSettled(bets).map((bet, index) => ({
    index: index + 1,
    date: bet.date,
    profit: calculateProfit(bet.odds, bet.stake, bet.status),
    status: bet.status,
  }))
}

export function dailySeries(bets: Bet[]): DailyPoint[] {
  const byDate = new Map<string, number>()
  for (const bet of chronologicalSettled(bets)) {
    const profit = calculateProfit(bet.odds, bet.stake, bet.status)
    byDate.set(bet.date, (byDate.get(bet.date) ?? 0) + profit)
  }
  return [...byDate.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, total]) => ({ date, total }))
}
