import { toLocalDateKey } from '../../shared/utils/date'
import { calculateProfit } from '../../shared/utils/profit'
import { filterSettled } from '../../shared/utils/betFilters'
import type { Bet } from '../../shared/types/bet'

export interface GridDay {
  date: Date
  dateKey: string
  isCurrentMonth: boolean
}

/** Full 6-row grid (Sun-Sat), including leading/trailing days from adjacent months. */
export function getMonthGridDays(year: number, month: number): GridDay[] {
  const firstOfMonth = new Date(year, month, 1)
  const gridStart = new Date(year, month, 1 - firstOfMonth.getDay())

  const days: GridDay[] = []
  const cursor = new Date(gridStart)
  for (let i = 0; i < 42; i++) {
    days.push({
      date: new Date(cursor),
      dateKey: toLocalDateKey(cursor),
      isCurrentMonth: cursor.getMonth() === month,
    })
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

/** Net settled profit per day within the given YYYY-MM month, keyed by date. */
export function computeDailyTotals(bets: Bet[], forMonthPrefix: string): Map<string, number> {
  const totals = new Map<string, number>()
  for (const bet of filterSettled(bets)) {
    if (!bet.date.startsWith(forMonthPrefix)) continue
    const profit = calculateProfit(bet.odds, bet.stake, bet.status)
    totals.set(bet.date, (totals.get(bet.date) ?? 0) + profit)
  }
  return totals
}

/**
 * Days with at least one bet logged but no settled total (i.e. every bet
 * that day is still pending) — these must render differently from a day
 * with no bets at all, or the grid silently claims "nothing happened"
 * on a day that actually has open action.
 */
export function computeDaysWithOnlyPending(
  bets: Bet[],
  forMonthPrefix: string,
  dailyTotals: Map<string, number>,
): Set<string> {
  const days = new Set<string>()
  for (const bet of bets) {
    if (!bet.date.startsWith(forMonthPrefix)) continue
    if (!dailyTotals.has(bet.date)) days.add(bet.date)
  }
  return days
}
