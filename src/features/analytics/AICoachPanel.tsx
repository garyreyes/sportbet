import { useState } from 'react'
import { ScopeBadge } from '../../shared/components/ScopeBadge'
import { cardClass, secondaryButtonClass } from '../../shared/styles'
import { computeInsights } from './insights'
import type { Bet } from '../../shared/types/bet'

const VISIBLE_COUNT = 4

/** Takes the full, unfiltered bet history — insight thresholds (min 3 bets per group, streaks) need more sample than a narrow time-range tab would leave, same reasoning as Monte Carlo's independent range. */
export function AICoachPanel({ bets }: { bets: Bet[] }) {
  const [expanded, setExpanded] = useState(false)
  const insights = computeInsights(bets)
  const visible = expanded ? insights : insights.slice(0, VISIBLE_COUNT)

  return (
    <div className={`flex flex-col gap-3 p-5 ${cardClass}`}>
      <div className="flex flex-col gap-1.5">
        <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">AI Coach</h2>
        <ScopeBadge>Full history</ScopeBadge>
      </div>

      {insights.length === 0 ? (
        <p className="text-sm text-slate-500">
          Log a few more decisive bets to unlock insights.
        </p>
      ) : (
        <>
          <p className="text-sm font-medium text-slate-100">
            {insights.length === 1
              ? '1 pattern worth knowing about'
              : `${insights.length} patterns worth knowing about`}
          </p>
          <ul className="flex flex-col gap-3">
            {visible.map((insight) => (
              <li key={insight.headline} className="rounded-lg bg-slate-950/60 p-3">
                <p className="text-sm font-medium text-slate-200">{insight.headline}</p>
                <p className="text-xs text-slate-500">{insight.detail}</p>
              </li>
            ))}
          </ul>
          {insights.length > VISIBLE_COUNT && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className={`self-start px-2.5 py-1 text-xs ${secondaryButtonClass}`}
            >
              {expanded ? 'Show fewer' : `Show ${insights.length - VISIBLE_COUNT} more`}
            </button>
          )}
        </>
      )}
    </div>
  )
}
