import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartTooltip } from '../../shared/components/ChartTooltip'
import { cardClass } from '../../shared/styles'
import { CHART_ACCENT, CHART_AXIS_COLOR, CHART_GRID_COLOR } from '../../shared/utils/chartTheme'
import { computeRollingFormTrend } from './rollingSeries'
import type { Bet } from '../../shared/types/bet'

const WINDOW_SIZE = 10

export function RollingFormTrend({ bets }: { bets: Bet[] }) {
  const data = computeRollingFormTrend(bets, WINDOW_SIZE)

  return (
    <div className={`p-5 ${cardClass}`}>
      <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-slate-500">
        Rolling Form Trend (last {WINDOW_SIZE} bets)
      </h2>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke={CHART_GRID_COLOR} vertical={false} />
            <XAxis dataKey="index" stroke={CHART_AXIS_COLOR} tick={{ fontSize: 11 }} />
            <YAxis
              stroke={CHART_AXIS_COLOR}
              tick={{ fontSize: 11 }}
              domain={[0, 100]}
              tickFormatter={(v: number) => `${v}%`}
            />
            <ReferenceLine y={50} stroke={CHART_AXIS_COLOR} strokeDasharray="3 3" />
            <Tooltip content={ChartTooltip} />
            <Line
              type="monotone"
              dataKey="winRate"
              stroke={CHART_ACCENT}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: '#0f172a', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {data.length === 0 && (
        <p className="mt-2 text-center text-sm text-slate-500">No decisive bets in this range.</p>
      )}
    </div>
  )
}
