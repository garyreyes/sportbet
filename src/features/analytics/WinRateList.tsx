import { cardClass } from '../../shared/styles'
import type { GroupWinRate } from './categoryStats'

interface WinRateRowsProps {
  rows: GroupWinRate[]
  emptyMessage?: string
  labelWidthClass?: string
}

export function WinRateRows({
  rows,
  emptyMessage = 'No decisive bets in this range.',
  labelWidthClass = 'w-24',
}: WinRateRowsProps) {
  if (rows.length === 0) {
    return <p className="text-sm text-slate-500">{emptyMessage}</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2">
            <span className={`${labelWidthClass} shrink-0 text-sm text-slate-300`}>
              {row.label}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${row.winRate}%` }}
              />
            </div>
          </div>
          <span className="shrink-0 whitespace-nowrap text-right text-sm font-semibold">
            {row.winRate.toFixed(0)}%{' '}
            <span className="text-xs font-normal text-slate-500">({row.total})</span>{' '}
            <span
              className={`text-xs font-normal ${row.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
            >
              · P/L {row.profit >= 0 ? '+' : ''}
              {row.profit.toFixed(2)}
            </span>
          </span>
        </div>
      ))}
    </div>
  )
}

interface WinRateListProps {
  title: string
  rows: GroupWinRate[]
}

export function WinRateList({ title, rows }: WinRateListProps) {
  return (
    <div className={`flex flex-col gap-3 p-5 ${cardClass}`}>
      <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</h2>
      <WinRateRows rows={rows} />
    </div>
  )
}
