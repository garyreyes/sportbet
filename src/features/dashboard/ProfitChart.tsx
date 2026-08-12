import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  cumulativeSeries,
  dailySeries,
  perBetSeries,
} from '../../shared/utils/profitSeries'
import { STATUS_HEX } from '../../shared/utils/statusColor'
import { cardClass, focusRingOnSurface } from '../../shared/styles'
import { CHART_ACCENT as ACCENT, CHART_AXIS_COLOR as AXIS_COLOR, CHART_GRID_COLOR as GRID_COLOR } from '../../shared/utils/chartTheme'
import { ChartTooltip } from '../../shared/components/ChartTooltip'
import type { Bet } from '../../shared/types/bet'

const VIEWS = ['Cumulative', 'Per Bet', 'Daily'] as const
type View = (typeof VIEWS)[number]

export function ProfitChart({ bets }: { bets: Bet[] }) {
  const [view, setView] = useState<View>('Cumulative')

  return (
    <div className={`p-5 ${cardClass}`}>
      <div className="mb-4 flex gap-1.5">
        {VIEWS.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${focusRingOnSurface} ${
              view === v
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-slate-100'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {view === 'Per Bet' && (
        <div className="mb-2 flex gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: STATUS_HEX.win }}
            />
            Win
          </span>
          <span className="flex items-center gap-1">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: STATUS_HEX.loss }}
            />
            Loss
          </span>
          <span className="flex items-center gap-1">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: STATUS_HEX.push }}
            />
            Push
          </span>
        </div>
      )}

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {view === 'Cumulative' ? (
            <LineChart data={cumulativeSeries(bets)}>
              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="date" stroke={AXIS_COLOR} tick={{ fontSize: 11 }} />
              <YAxis stroke={AXIS_COLOR} tick={{ fontSize: 11 }} />
              <ReferenceLine y={0} stroke={AXIS_COLOR} strokeDasharray="3 3" />
              <Tooltip content={ChartTooltip} />
              <Line
                type="monotone"
                dataKey="total"
                stroke={ACCENT}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: '#0f172a', strokeWidth: 2 }}
              />
            </LineChart>
          ) : view === 'Per Bet' ? (
            <BarChart data={perBetSeries(bets)} barCategoryGap={2}>
              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="index" stroke={AXIS_COLOR} tick={{ fontSize: 11 }} />
              <YAxis stroke={AXIS_COLOR} tick={{ fontSize: 11 }} />
              <ReferenceLine y={0} stroke={AXIS_COLOR} />
              <Tooltip content={ChartTooltip} />
              <Bar dataKey="profit" maxBarSize={24} radius={[4, 4, 4, 4]}>
                {perBetSeries(bets).map((point) => (
                  <Cell key={point.index} fill={STATUS_HEX[point.status]} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <BarChart data={dailySeries(bets)} barCategoryGap={2}>
              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="date" stroke={AXIS_COLOR} tick={{ fontSize: 11 }} />
              <YAxis stroke={AXIS_COLOR} tick={{ fontSize: 11 }} />
              <ReferenceLine y={0} stroke={AXIS_COLOR} />
              <Tooltip content={ChartTooltip} />
              <Bar dataKey="total" maxBarSize={24} radius={[4, 4, 4, 4]}>
                {dailySeries(bets).map((point) => (
                  <Cell
                    key={point.date}
                    fill={point.total >= 0 ? STATUS_HEX.win : STATUS_HEX.loss}
                  />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {bets.length === 0 && (
        <p className="mt-2 text-center text-sm text-slate-500">No settled bets in this range.</p>
      )}
    </div>
  )
}
