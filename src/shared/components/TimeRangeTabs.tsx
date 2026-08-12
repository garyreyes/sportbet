import { TIME_RANGES, type TimeRange } from '../utils/timeRanges'

interface TimeRangeTabsProps {
  value: TimeRange
  onChange: (range: TimeRange) => void
}

export function TimeRangeTabs({ value, onChange }: TimeRangeTabsProps) {
  return (
    <div className="flex gap-1 overflow-x-auto">
      {TIME_RANGES.map((range) => (
        <button
          key={range.label}
          type="button"
          onClick={() => onChange(range)}
          className={`whitespace-nowrap rounded-md px-3 py-1 text-xs ${
            value.label === range.label ? 'bg-emerald-600' : 'bg-slate-800 text-slate-200'
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  )
}
