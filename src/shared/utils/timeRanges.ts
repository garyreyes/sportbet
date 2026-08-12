import { toLocalDateKey } from './date'
import type { Bet } from '../types/bet'

export interface TimeRange {
  label: string
  /** Days back from today, inclusive of today. null = All Time. */
  daysBack: number | null
}

export const TIME_RANGES: TimeRange[] = [
  { label: 'Today', daysBack: 0 },
  { label: 'Past 7 Days', daysBack: 6 },
  { label: 'Past 30 Days', daysBack: 29 },
  { label: 'Past Year', daysBack: 364 },
  { label: 'All Time', daysBack: null },
]

/** Rolling window — not calendar-aligned. See ARCHITECTURE.md "week" decision. */
export function filterByRange(bets: Bet[], daysBack: number | null): Bet[] {
  if (daysBack === null) return bets
  const start = new Date()
  start.setDate(start.getDate() - daysBack)
  const startKey = toLocalDateKey(start)
  return bets.filter((bet) => bet.date >= startKey)
}
