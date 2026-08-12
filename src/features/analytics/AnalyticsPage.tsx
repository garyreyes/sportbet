import { useState } from 'react'
import { useBetsContext } from '../../shared/bets/useBetsContext'
import { TimeRangeTabs } from '../../shared/components/TimeRangeTabs'
import { TIME_RANGES, filterByRange, type TimeRange } from '../../shared/utils/timeRanges'
import { AICoachPanel } from './AICoachPanel'
import { BetTypeComparison } from './BetTypeComparison'
import { CategoryWinRates } from './CategoryWinRates'
import { LegBreakdown } from './LegBreakdown'
import { MonteCarloSimulation } from './MonteCarloSimulation'
import { OddsRangeBreakdown } from './OddsRangeBreakdown'
import { ParlaySportComposition } from './ParlaySportComposition'
import { RollingFormTrend } from './RollingFormTrend'
import { StakeDiscipline } from './StakeDiscipline'

export function AnalyticsPage() {
  const { bets, loading, error } = useBetsContext()
  const [range, setRange] = useState<TimeRange>(TIME_RANGES[4])

  if (loading) return <p className="p-4 text-sm text-slate-500">Loading…</p>
  if (error) return <p className="p-4 text-sm text-red-400">{error}</p>

  const rangedBets = filterByRange(bets, range.daysBack)

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 pb-8 sm:p-6">
      <AICoachPanel bets={bets} />
      <TimeRangeTabs value={range} onChange={setRange} />

      <h2 className="mt-2 border-t border-slate-800 pt-4 text-sm font-semibold text-slate-300">
        Breakdowns
      </h2>
      <CategoryWinRates bets={rangedBets} />
      <OddsRangeBreakdown bets={rangedBets} />
      <LegBreakdown bets={rangedBets} />
      <BetTypeComparison bets={rangedBets} />
      <ParlaySportComposition bets={rangedBets} />

      <h2 className="mt-2 border-t border-slate-800 pt-4 text-sm font-semibold text-slate-300">
        Trends
      </h2>
      <RollingFormTrend bets={rangedBets} />
      <StakeDiscipline bets={rangedBets} />

      <h2 className="mt-2 border-t border-slate-800 pt-4 text-sm font-semibold text-slate-300">
        Simulation
      </h2>
      <MonteCarloSimulation bets={bets} />
    </div>
  )
}
