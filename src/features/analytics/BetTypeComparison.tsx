import { computeBetTypeComparison } from './categoryStats'
import { WinRateList } from './WinRateList'
import type { Bet } from '../../shared/types/bet'

export function BetTypeComparison({ bets }: { bets: Bet[] }) {
  return <WinRateList title="Bet Type Comparison" rows={computeBetTypeComparison(bets)} />
}
