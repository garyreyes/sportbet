import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartTooltip } from '../../shared/components/ChartTooltip'
import { ScopeBadge } from '../../shared/components/ScopeBadge'
import { TimeRangeTabs } from '../../shared/components/TimeRangeTabs'
import { cardClass, focusRingOnSurface } from '../../shared/styles'
import { CHART_ACCENT, CHART_AXIS_COLOR, CHART_GRID_COLOR } from '../../shared/utils/chartTheme'
import { TIME_RANGES, filterByRange, type TimeRange } from '../../shared/utils/timeRanges'
import { computeHistogram } from './histogram'
import { runMonteCarlo, type MonteCarloFilter } from './monteCarlo'
import type { Bet } from '../../shared/types/bet'

const FILTERS: MonteCarloFilter[] = ['both', 'straight', 'parlay']
const FILTER_LABEL: Record<MonteCarloFilter, string> = {
  both: 'Both',
  straight: 'Straight',
  parlay: 'Parlay',
}

/** Takes the full, unfiltered bet history — this panel has its own time-range control since it sits far down the page, independent of the Analytics tab's shared range. */
export function MonteCarloSimulation({ bets }: { bets: Bet[] }) {
  const [range, setRange] = useState<TimeRange>(TIME_RANGES[4])
  const [filter, setFilter] = useState<MonteCarloFilter>('both')
  const [sliderValue, setSliderValue] = useState(20)
  const [legCount, setLegCount] = useState(20)

  // Decouple the slider's visual position from the expensive recompute (500 trials +
  // chart re-render) — committing on every drag tick made the slider feel laggy.
  useEffect(() => {
    const timer = setTimeout(() => setLegCount(sliderValue), 100)
    return () => clearTimeout(timer)
  }, [sliderValue])

  const rangedBets = useMemo(() => filterByRange(bets, range.daysBack), [bets, range])
  const result = useMemo(
    () => runMonteCarlo(rangedBets, filter, legCount),
    [rangedBets, filter, legCount],
  )
  const histogram = useMemo(() => (result ? computeHistogram(result.trials) : []), [result])

  return (
    <div className={`flex flex-col gap-4 p-5 ${cardClass}`}>
      <div className="flex flex-col gap-1.5">
        <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Monte Carlo Simulation
        </h2>
        <ScopeBadge>Independent range</ScopeBadge>
      </div>

      <TimeRangeTabs value={range} onChange={setRange} onSurface />

      <div className="flex gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${focusRingOnSurface} ${
              filter === f
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-slate-100'
            }`}
          >
            {FILTER_LABEL[f]}
          </button>
        ))}
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Simulated bets per trial: {sliderValue}
        </span>
        <input
          type="range"
          min={1}
          max={100}
          value={sliderValue}
          onChange={(e) => setSliderValue(Number(e.target.value))}
          className={`accent-emerald-500 ${focusRingOnSurface}`}
        />
      </label>

      {result === null ? (
        <p className="text-sm text-slate-500">
          Not enough settled {filter === 'both' ? '' : `${FILTER_LABEL[filter].toLowerCase()} `}
          bets in this range to simulate (need at least 5).
        </p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-slate-950/60 p-3">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">Expected Profit</p>
              <p
                className={`text-lg font-semibold ${
                  result.expectedProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {result.expectedProfit.toFixed(2)}
              </p>
            </div>
            <div className="rounded-lg bg-slate-950/60 p-3">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">
                Probability of Profit
              </p>
              <p className="text-lg font-semibold">{result.probabilityOfProfit.toFixed(0)}%</p>
            </div>
            <div className="rounded-lg bg-slate-950/60 p-3">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">Range</p>
              <p className="text-lg font-semibold">
                {result.min.toFixed(0)} / {result.max.toFixed(0)}
              </p>
            </div>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogram}>
                <CartesianGrid stroke={CHART_GRID_COLOR} vertical={false} />
                <XAxis dataKey="label" stroke={CHART_AXIS_COLOR} tick={{ fontSize: 10 }} />
                <YAxis stroke={CHART_AXIS_COLOR} tick={{ fontSize: 11 }} />
                <Tooltip content={ChartTooltip} />
                <Bar dataKey="count" fill={CHART_ACCENT} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}
