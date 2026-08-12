import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartTooltip } from '../../shared/components/ChartTooltip'
import { cardClass } from '../../shared/styles'
import { CHART_AXIS_COLOR, CHART_GRID_COLOR } from '../../shared/utils/chartTheme'
import { computeStakeDiscipline } from './rollingSeries'
import type { Bet } from '../../shared/types/bet'

export function StakeDiscipline({ bets }: { bets: Bet[] }) {
  const data = computeStakeDiscipline(bets)

  return (
    <div className={`p-5 ${cardClass}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Stake Discipline
        </h2>
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <span className="inline-block h-0.5 w-3 bg-amber-400" />
          Running average stake
        </span>
      </div>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid stroke={CHART_GRID_COLOR} vertical={false} />
            <XAxis dataKey="index" stroke={CHART_AXIS_COLOR} tick={{ fontSize: 11 }} />
            <YAxis stroke={CHART_AXIS_COLOR} tick={{ fontSize: 11 }} />
            <Tooltip content={ChartTooltip} />
            <Bar dataKey="stake" fill="#334155" maxBarSize={16} radius={[3, 3, 0, 0]} />
            <Line
              type="monotone"
              dataKey="avgStake"
              stroke="#fbbf24"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {data.length === 0 && (
        <p className="mt-2 text-center text-sm text-slate-500">No bets in this range.</p>
      )}
    </div>
  )
}
