import { computeOddsBucketWinRates } from './categoryStats'
import { WinRateList } from './WinRateList'
import type { Bet } from '../../shared/types/bet'

export function OddsRangeBreakdown({ bets }: { bets: Bet[] }) {
  return <WinRateList title="Win Rate by Odds Range" rows={computeOddsBucketWinRates(bets)} />
}
