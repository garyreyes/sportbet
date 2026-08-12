import { toLocalDateKey } from '../../shared/utils/date'
import { focusRingOnSurface } from '../../shared/styles'
import { getMonthGridDays } from './monthGridData'

const WEEKDAY_LABELS = [
  { short: 'S', full: 'Sunday' },
  { short: 'M', full: 'Monday' },
  { short: 'T', full: 'Tuesday' },
  { short: 'W', full: 'Wednesday' },
  { short: 'T', full: 'Thursday' },
  { short: 'F', full: 'Friday' },
  { short: 'S', full: 'Saturday' },
]

interface MonthGridProps {
  year: number
  month: number
  dailyTotals: Map<string, number>
  pendingOnlyDays: Set<string>
  selectedDateKey: string | null
  onSelect: (dateKey: string) => void
}

function cellClass(total: number | undefined, isCurrentMonth: boolean): string {
  if (!isCurrentMonth) return 'bg-slate-950 text-slate-700'
  if (total === undefined) return 'bg-slate-900 text-slate-400'
  if (total > 0) return 'bg-emerald-900/50 text-emerald-300'
  if (total < 0) return 'bg-red-900/50 text-red-300'
  return 'bg-blue-900/50 text-blue-300'
}

function describeDay(date: Date, total: number | undefined, hasPendingOnly: boolean): string {
  const base = date.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  if (total !== undefined) return `${base}, net ${total.toFixed(2)}`
  if (hasPendingOnly) return `${base}, pending bets not yet settled`
  return `${base}, no bets logged`
}

export function MonthGrid({
  year,
  month,
  dailyTotals,
  pendingOnlyDays,
  selectedDateKey,
  onSelect,
}: MonthGridProps) {
  const days = getMonthGridDays(year, month)
  const todayKey = toLocalDateKey(new Date())

  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 pb-2 text-center text-xs text-slate-500">
        {WEEKDAY_LABELS.map((day, i) => (
          <span key={i} title={day.full} aria-hidden="true">
            {day.short}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5" role="grid">
        {days.map(({ date, dateKey, isCurrentMonth }) => {
          const total = dailyTotals.get(dateKey)
          const hasPendingOnly = pendingOnlyDays.has(dateKey)
          const isToday = dateKey === todayKey
          const isSelected = dateKey === selectedDateKey
          return (
            <button
              key={dateKey}
              type="button"
              role="gridcell"
              onClick={() => onSelect(dateKey)}
              aria-label={describeDay(date, total, hasPendingOnly)}
              aria-current={isToday ? 'date' : undefined}
              aria-selected={isSelected}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-lg text-xs transition-colors ${focusRingOnSurface} ${cellClass(
                total,
                isCurrentMonth,
              )} ${isSelected ? 'ring-2 ring-white' : isToday ? 'ring-2 ring-emerald-500' : ''}`}
            >
              <span>{date.getDate()}</span>
              {total !== undefined && isCurrentMonth && (
                <span className="text-[9px] font-medium">{total.toFixed(0)}</span>
              )}
              {total === undefined && hasPendingOnly && isCurrentMonth && (
                <span
                  className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-amber-400"
                  aria-hidden="true"
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
