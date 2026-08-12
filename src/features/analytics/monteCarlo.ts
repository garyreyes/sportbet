import { calculateProfit } from '../../shared/utils/profit'
import { filterSettled } from '../../shared/utils/betFilters'
import type { Bet } from '../../shared/types/bet'

export type MonteCarloFilter = 'both' | 'straight' | 'parlay'

const MIN_POOL_SIZE = 5
const TRIALS = 500

export interface MonteCarloResult {
  trials: number[]
  expectedProfit: number
  probabilityOfProfit: number
  min: number
  max: number
}

function poolForFilter(bets: Bet[], filter: MonteCarloFilter): number[] {
  const settled = filterSettled(bets).filter((bet) => {
    if (filter === 'straight') return !bet.legs
    if (filter === 'parlay') return !!bet.legs
    return true
  })
  return settled.map((bet) => calculateProfit(bet.odds, bet.stake, bet.status))
}

/** Bootstrap resampling: draw legCount historical profit values with replacement, sum, repeat 500 times. */
export function runMonteCarlo(
  bets: Bet[],
  filter: MonteCarloFilter,
  legCount: number,
): MonteCarloResult | null {
  const pool = poolForFilter(bets, filter)
  if (pool.length < MIN_POOL_SIZE) return null

  const trials: number[] = []
  for (let t = 0; t < TRIALS; t++) {
    let total = 0
    for (let i = 0; i < legCount; i++) {
      total += pool[Math.floor(Math.random() * pool.length)]
    }
    trials.push(total)
  }

  const expectedProfit = trials.reduce((sum, v) => sum + v, 0) / trials.length
  const probabilityOfProfit = (trials.filter((v) => v > 0).length / trials.length) * 100
  const min = Math.min(...trials)
  const max = Math.max(...trials)

  return { trials, expectedProfit, probabilityOfProfit, min, max }
}
