import { calculateProfit } from '../../shared/utils/profit'
import { filterDecisive, filterSettled } from '../../shared/utils/betFilters'
import { cardClass } from '../../shared/styles'
import type { Bet } from '../../shared/types/bet'

interface Metric {
  label: string
  value: string
  positive?: boolean
}

function computeMetrics(bets: Bet[]): Metric[] {
  const decisive = filterDecisive(bets)
  const settled = filterSettled(bets)
  const pending = bets.filter((bet) => bet.status === 'pending')

  const settledProfits = settled.map((bet) => calculateProfit(bet.odds, bet.stake, bet.status))
  const netProfit = settledProfits.reduce((sum, p) => sum + p, 0)
  const staked = settled.reduce((sum, bet) => sum + bet.stake, 0)
  const pendingStaked = pending.reduce((sum, bet) => sum + bet.stake, 0)
  const wins = decisive.filter((bet) => bet.status === 'win').length
  const winRate = decisive.length > 0 ? (wins / decisive.length) * 100 : null
  const roi = staked > 0 ? (netProfit / staked) * 100 : null

  const winProfits = decisive
    .filter((bet) => bet.status === 'win')
    .map((bet) => calculateProfit(bet.odds, bet.stake, bet.status))
  const lossProfits = decisive
    .filter((bet) => bet.status === 'loss')
    .map((bet) => calculateProfit(bet.odds, bet.stake, bet.status))
  const biggestWin = winProfits.length > 0 ? Math.max(...winProfits) : null
  const biggestLoss = lossProfits.length > 0 ? Math.min(...lossProfits) : null

  return [
    { label: 'Net Profit', value: netProfit.toFixed(2), positive: netProfit >= 0 },
    { label: 'ROI', value: roi === null ? '—' : `${roi.toFixed(1)}%`, positive: (roi ?? 0) >= 0 },
    { label: 'Win Rate', value: winRate === null ? '—' : `${winRate.toFixed(1)}%` },
    { label: 'Wagers', value: String(bets.length) },
    { label: 'Staked (Settled)', value: staked.toFixed(2) },
    { label: 'Pending', value: pendingStaked.toFixed(2) },
    {
      label: 'Biggest Win',
      value: biggestWin === null ? '—' : biggestWin.toFixed(2),
      positive: true,
    },
    {
      label: 'Biggest Loss',
      value: biggestLoss === null ? '—' : biggestLoss.toFixed(2),
      positive: false,
    },
  ]
}

export function MetricGrid({ bets }: { bets: Bet[] }) {
  const metrics = computeMetrics(bets)

  return (
    <div className="grid grid-cols-2 gap-3">
      {metrics.map((metric) => (
        <div key={metric.label} className={`p-4 ${cardClass}`}>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {metric.label}
          </p>
          <p
            className={`mt-1 text-xl font-semibold ${
              metric.positive === undefined
                ? ''
                : metric.positive
                  ? 'text-emerald-400'
                  : 'text-red-400'
            }`}
          >
            {metric.value}
          </p>
        </div>
      ))}
    </div>
  )
}
