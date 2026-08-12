import { focusRing } from '../styles'
import { TIME_RANGES, type TimeRange } from '../utils/timeRanges'

interface TimeRangeTabsProps {
  value: TimeRange
  onChange: (range: TimeRange) => void
}

export function TimeRangeTabs({ value, onChange }: TimeRangeTabsProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto">
      {TIME_RANGES.map((range) => (
        <button
          key={range.label}
          type="button"
          onClick={() => onChange(range)}
          className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${focusRing} ${
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
