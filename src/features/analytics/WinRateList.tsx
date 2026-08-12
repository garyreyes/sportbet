import { cardClass } from '../../shared/styles'
import type { GroupWinRate } from './categoryStats'

interface WinRateListProps {
  title: string
  rows: GroupWinRate[]
}

export function WinRateList({ title, rows }: WinRateListProps) {
  return (
    <div className={`flex flex-col gap-3 p-5 ${cardClass}`}>
      <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</h2>

      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">No decisive bets in this range.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-3">
              <div className="flex flex-1 items-center gap-2">
                <span className="w-24 shrink-0 text-sm text-slate-300">{row.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${row.winRate}%` }}
                  />
                </div>
              </div>
              <span className="w-20 shrink-0 text-right text-sm font-semibold">
                {row.winRate.toFixed(0)}%{' '}
                <span className="text-xs font-normal text-slate-500">({row.total})</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
