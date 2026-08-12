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
import type { TooltipContentProps } from 'recharts'
import {
  cumulativeSeries,
  dailySeries,
  perBetSeries,
} from '../../shared/utils/profitSeries'
import { STATUS_HEX } from '../../shared/utils/statusColor'
import { cardClass, focusRingOnSurface } from '../../shared/styles'
import type { Bet } from '../../shared/types/bet'

const VIEWS = ['Cumulative', 'Per Bet', 'Daily'] as const
type View = (typeof VIEWS)[number]

const GRID_COLOR = '#1e293b' // slate-800, hairline gridline
const AXIS_COLOR = '#64748b' // slate-500, muted axis text
const ACCENT = '#34d399' // emerald-400

// recharts v3's TooltipContentProps generics don't unify across our 3 chart types; `any` avoids fighting that here.
function ChartTooltip({ active, payload, label }: TooltipContentProps<any, any>) {
  if (!active || !payload || payload.length === 0) return null
  const value = payload[0].value as number
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs shadow-lg shadow-black/30">
      <p className="text-slate-400">{label}</p>
      <p className={`font-semibold ${value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
        {value.toFixed(2)}
      </p>
    </div>
  )
}

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
