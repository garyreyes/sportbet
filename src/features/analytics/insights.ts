import { calculateStreak } from '../../shared/utils/streak'
import type { Bet } from '../../shared/types/bet'
import {
  computeBetTypeComparison,
  computeCategoryWinRates,
  computeOddsBucketWinRates,
  type GroupWinRate,
} from './categoryStats'

export interface Insight {
  headline: string
  detail: string
  /** Magnitude used only to rank insights against each other, not shown to the user. */
  weight: number
}

const MIN_GROUP_SIZE = 3
const MIN_GAP_PP = 15
const MIN_STREAK = 3

function streakInsight(bets: Bet[]): Insight | null {
  const streak = calculateStreak(bets)
  if (streak.type === null || streak.count < MIN_STREAK) return null

  const isWin = streak.type === 'win'
  return {
    headline: isWin
      ? `You're on a ${streak.count}-bet winning streak`
      : `You're on a ${streak.count}-bet losing streak`,
    detail: isWin
      ? "Keep doing what's working — no change in approach indicated."
      : 'Consider a smaller stake size until the pattern breaks.',
    weight: streak.count,
  }
}

/** Largest win-rate gap between two groups that both clear the minimum sample size. */
function gapInsight(
  rows: GroupWinRate[],
  describe: (best: GroupWinRate, worst: GroupWinRate) => { headline: string; detail: string },
): Insight | null {
  const eligible = rows.filter((r) => r.total >= MIN_GROUP_SIZE)
  if (eligible.length < 2) return null

  const best = eligible.reduce((a, b) => (b.winRate > a.winRate ? b : a))
  const worst = eligible.reduce((a, b) => (b.winRate < a.winRate ? b : a))
  const gap = best.winRate - worst.winRate
  if (gap < MIN_GAP_PP) return null

  return { ...describe(best, worst), weight: gap }
}

function categoryInsight(bets: Bet[]): Insight | null {
  return gapInsight(computeCategoryWinRates(bets), (best, worst) => ({
    headline: `${best.label} is your strongest league`,
    detail: `${best.winRate.toFixed(0)}% win rate vs ${worst.winRate.toFixed(0)}% in ${worst.label}.`,
  }))
}

function oddsInsight(bets: Bet[]): Insight | null {
  return gapInsight(computeOddsBucketWinRates(bets), (best, worst) => ({
    headline: `You perform best at ${best.label} odds`,
    detail: `${best.winRate.toFixed(0)}% win rate vs ${worst.winRate.toFixed(0)}% at ${worst.label}.`,
  }))
}

function betTypeInsight(bets: Bet[]): Insight | null {
  return gapInsight(computeBetTypeComparison(bets), (best, worst) => ({
    headline: `${best.label} bets are your strength`,
    detail: `${best.winRate.toFixed(0)}% win rate vs ${worst.winRate.toFixed(0)}% on ${worst.label.toLowerCase()} bets.`,
  }))
}

/** Ranked insights, strongest pattern first. Tuned thresholds (not statistically derived): minimum 3 decisive bets per group, >=15pp win-rate gap, >=3-bet streak. */
export function computeInsights(bets: Bet[]): Insight[] {
  const insights = [streakInsight(bets), categoryInsight(bets), oddsInsight(bets), betTypeInsight(bets)]
  return insights
    .filter((insight): insight is Insight => insight !== null)
    .sort((a, b) => b.weight - a.weight)
}
