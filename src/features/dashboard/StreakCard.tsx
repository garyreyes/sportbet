import { calculateStreak } from '../../shared/utils/streak'
import type { Bet } from '../../shared/types/bet'

export function StreakCard({ bets }: { bets: Bet[] }) {
  const { type, count } = calculateStreak(bets)

  const label = type === null ? 'No decisive bets yet' : type === 'win' ? 'Win streak' : 'Loss streak'
  const color = type === 'win' ? 'text-emerald-400' : type === 'loss' ? 'text-red-400' : 'text-slate-400'

  return (
    <div className="flex flex-1 flex-col gap-1 rounded-md border border-slate-800 p-4">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`text-2xl font-semibold ${color}`}>{type === null ? '—' : count}</span>
    </div>
  )
}
