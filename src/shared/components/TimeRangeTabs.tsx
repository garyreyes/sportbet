import { focusRing, focusRingOnSurface } from '../styles'
import { TIME_RANGES, type TimeRange } from '../utils/timeRanges'

interface TimeRangeTabsProps {
  value: TimeRange
  onChange: (range: TimeRange) => void
  /** Set when this control sits inside a card/modal (bg-slate-900) rather than directly on the page background. */
  onSurface?: boolean
}

export function TimeRangeTabs({ value, onChange, onSurface = false }: TimeRangeTabsProps) {
  const ring = onSurface ? focusRingOnSurface : focusRing

  return (
    <div className="flex gap-1.5 overflow-x-auto">
      {TIME_RANGES.map((range) => (
        <button
          key={range.label}
          type="button"
          onClick={() => onChange(range)}
          className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${ring} ${
            value.label === range.label
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950/40'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-slate-100'
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  )
}
