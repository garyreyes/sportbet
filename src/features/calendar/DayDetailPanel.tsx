import { useState } from 'react'
import { calculateProfit } from '../../shared/utils/profit'
import { STATUS_TEXT_COLOR } from '../../shared/utils/statusColor'
import { cardClass, secondaryButtonClass } from '../../shared/styles'
import type { Bet } from '../../shared/types/bet'

interface DayDetailPanelProps {
  dateKey: string | null
  bets: Bet[]
}

export function DayDetailPanel({ dateKey, bets }: DayDetailPanelProps) {
  const [minimized, setMinimized] = useState(false)

  if (!dateKey) {
    return (
      <div className={`p-5 text-sm text-slate-500 ${cardClass}`}>
        Tap a day to see its bets.
      </div>
    )
  }

  const dayBets = bets.filter((bet) => bet.date === dateKey)

  if (minimized) {
    return (
      <div className={`flex items-center justify-between p-4 ${cardClass}`}>
        <span className="text-sm text-slate-300">{dateKey}</span>
        <button
          type="button"
          onClick={() => setMinimized(false)}
          className={`px-3 py-1.5 text-xs ${secondaryButtonClass}`}
        >
          Expand
        </button>
      </div>
    )
  }

  return (
    <div className={`flex flex-col gap-3 p-5 ${cardClass}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">{dateKey}</h2>
        <button
          type="button"
          onClick={() => setMinimized(true)}
          className={`px-2.5 py-1 text-xs ${secondaryButtonClass}`}
        >
          Minimize
        </button>
      </div>

      {dayBets.length === 0 ? (
        <p className="text-sm text-slate-500">No bets logged this day.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {dayBets.map((bet) => {
            const label = bet.legs ? `Parlay (${bet.legs.length} legs)` : `${bet.sport} · ${bet.league}`
            const profit = calculateProfit(bet.odds, bet.stake, bet.status)
            return (
              <div
                key={bet.id}
                className="flex items-center justify-between rounded-lg bg-slate-950/60 px-3 py-2 text-sm"
              >
                <span>{label}</span>
                <span className={`font-semibold ${STATUS_TEXT_COLOR[bet.status]}`}>
                  {bet.status === 'pending' || bet.status === 'push' ? bet.status : profit.toFixed(2)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
