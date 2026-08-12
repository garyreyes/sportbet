import { calculateStreak } from '../../shared/utils/streak'
import { cardClass } from '../../shared/styles'
import type { Bet } from '../../shared/types/bet'

export function StreakCard({ bets }: { bets: Bet[] }) {
  const { type, count } = calculateStreak(bets)

  const label = type === null ? 'No decisive bets yet' : type === 'win' ? 'Win streak' : 'Loss streak'
  const color = type === 'win' ? 'text-emerald-400' : type === 'loss' ? 'text-red-400' : 'text-slate-400'

  return (
    <div className={`flex flex-1 flex-col gap-2 p-5 ${cardClass}`}>
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
        <span className="text-[10px] text-slate-600">All time</span>
      </div>
      <span className={`text-3xl font-semibold ${color}`}>{type === null ? '—' : count}</span>
    </div>
  )
}
