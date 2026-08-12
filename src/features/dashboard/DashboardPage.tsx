import { useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { useBetsContext } from '../../shared/bets/useBetsContext'
import { TimeRangeTabs } from '../../shared/components/TimeRangeTabs'
import { TIME_RANGES, filterByRange, type TimeRange } from '../../shared/utils/timeRanges'
import { MetricGrid } from './MetricGrid'
import { MonthlyGoalCard } from './MonthlyGoalCard'
import { ProfitChart } from './ProfitChart'
import { StreakCard } from './StreakCard'

export function DashboardPage() {
  const { session } = useAuth()
  const userId = session?.user.id
  const { bets, loading, error } = useBetsContext()
  const [range, setRange] = useState<TimeRange>(TIME_RANGES[4])

  if (!userId) return null
  if (loading) return <p className="p-4 text-sm text-slate-500">Loading…</p>
  if (error) return <p className="p-4 text-sm text-red-400">{error}</p>

  const rangedBets = filterByRange(bets, range.daysBack)

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-4 pb-8 sm:p-6">
      <div className="flex gap-3">
        <StreakCard bets={bets} />
        <MonthlyGoalCard userId={userId} bets={bets} />
      </div>

      <TimeRangeTabs value={range} onChange={setRange} />

      <MetricGrid bets={rangedBets} />

      <ProfitChart bets={rangedBets} />
    </div>
  )
}
