import { toLocalDateKey } from '../../shared/utils/date'
import { focusRingOnSurface } from '../../shared/styles'
import { getMonthGridDays } from './monthGridData'

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

interface MonthGridProps {
  year: number
  month: number
  dailyTotals: Map<string, number>
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

export function MonthGrid({ year, month, dailyTotals, selectedDateKey, onSelect }: MonthGridProps) {
  const days = getMonthGridDays(year, month)
  const todayKey = toLocalDateKey(new Date())

  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 pb-2 text-center text-xs text-slate-500">
        {WEEKDAY_LABELS.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map(({ date, dateKey, isCurrentMonth }) => {
          const total = dailyTotals.get(dateKey)
          const isToday = dateKey === todayKey
          const isSelected = dateKey === selectedDateKey
          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => onSelect(dateKey)}
              className={`flex aspect-square flex-col items-center justify-center rounded-lg text-xs transition-colors ${focusRingOnSurface} ${cellClass(
                total,
                isCurrentMonth,
              )} ${isSelected ? 'ring-2 ring-white' : isToday ? 'ring-2 ring-emerald-500' : ''}`}
            >
              <span>{date.getDate()}</span>
              {total !== undefined && isCurrentMonth && (
                <span className="text-[9px] font-medium">{total.toFixed(0)}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
