import { computeCategoryWinRates } from './categoryStats'
import { WinRateList } from './WinRateList'
import type { Bet } from '../../shared/types/bet'

export function CategoryWinRates({ bets }: { bets: Bet[] }) {
  return <WinRateList title="Category Win Rates" rows={computeCategoryWinRates(bets)} />
}
