import { cardClass } from '../../shared/styles'
import type { SportFrequency } from './parlayComposition'

interface FrequencyListProps {
  title: string
  rows: SportFrequency[]
}

export function FrequencyList({ title, rows }: FrequencyListProps) {
  const max = Math.max(1, ...rows.map((row) => row.count))

  return (
    <div className={`flex flex-col gap-3 p-5 ${cardClass}`}>
      <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</h2>

      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">No parlay legs in this range.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-3">
              <div className="flex flex-1 items-center gap-2">
                <span className="w-32 shrink-0 truncate text-sm text-slate-300">{row.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${(row.count / max) * 100}%` }}
                  />
                </div>
              </div>
              <span className="w-10 shrink-0 text-right text-sm font-semibold">{row.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
