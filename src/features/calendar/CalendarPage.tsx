import { useMemo, useState } from 'react'
import { useBetsContext } from '../../shared/bets/useBetsContext'
import { monthPrefix } from '../../shared/utils/date'
import { cardClass, secondaryButtonClass } from '../../shared/styles'
import { DayDetailPanel } from './DayDetailPanel'
import { MonthGrid } from './MonthGrid'
import { computeDailyTotals } from './monthGridData'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function CalendarPage() {
  const { bets, loading, error } = useBetsContext()
  const [cursor, setCursor] = useState(() => new Date())
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null)

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const currentMonthPrefix = monthPrefix(cursor)

  const dailyTotals = useMemo(
    () => computeDailyTotals(bets, currentMonthPrefix),
    [bets, currentMonthPrefix],
  )
  const monthTotal = useMemo(
    () => [...dailyTotals.values()].reduce((sum, v) => sum + v, 0),
    [dailyTotals],
  )

  const goToPrevMonth = () => {
    setCursor(new Date(year, month - 1, 1))
    setSelectedDateKey(null)
  }
  const goToNextMonth = () => {
    setCursor(new Date(year, month + 1, 1))
    setSelectedDateKey(null)
  }

  if (loading) return <p className="p-4 text-sm text-slate-500">Loading…</p>
  if (error) return <p className="p-4 text-sm text-red-400">{error}</p>

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 p-4 pb-8 sm:p-6 lg:flex-row lg:items-start">
      <div className={`flex-1 p-5 ${cardClass}`}>
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={goToPrevMonth}
            className={`px-3 py-1.5 text-sm ${secondaryButtonClass}`}
            aria-label="Previous month"
          >
            ←
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-sm font-medium">
              {MONTH_NAMES[month]} {year}
            </h1>
            <span
              className={`text-xs font-semibold ${
                monthTotal >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {monthTotal.toFixed(2)}
            </span>
          </div>
          <button
            type="button"
            onClick={goToNextMonth}
            className={`px-3 py-1.5 text-sm ${secondaryButtonClass}`}
            aria-label="Next month"
          >
            →
          </button>
        </div>

        <MonthGrid
          year={year}
          month={month}
          dailyTotals={dailyTotals}
          selectedDateKey={selectedDateKey}
          onSelect={setSelectedDateKey}
        />
      </div>

      <div className="lg:w-72">
        <DayDetailPanel dateKey={selectedDateKey} bets={bets} />
      </div>
    </div>
  )
}
