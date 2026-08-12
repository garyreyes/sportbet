import { useState } from 'react'
import { cardClass, secondaryButtonClass } from '../../shared/styles'
import { computeLegBreakdown } from './categoryStats'
import { WinRateRows } from './WinRateList'
import type { Bet } from '../../shared/types/bet'

export function LegBreakdown({ bets }: { bets: Bet[] }) {
  const [expanded, setExpanded] = useState(true)
  const rows = computeLegBreakdown(bets)

  return (
    <div className={`flex flex-col gap-3 p-5 ${cardClass}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Leg Breakdown
        </h2>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={`px-2.5 py-1 text-xs ${secondaryButtonClass}`}
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {expanded && (
        <WinRateRows
          rows={rows}
          emptyMessage="No decisive parlays in this range."
          labelWidthClass="w-16"
        />
      )}
    </div>
  )
}
