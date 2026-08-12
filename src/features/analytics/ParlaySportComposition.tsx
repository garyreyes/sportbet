import { computeParlaySportComposition } from './parlayComposition'
import { FrequencyList } from './FrequencyList'
import type { Bet } from '../../shared/types/bet'

export function ParlaySportComposition({ bets }: { bets: Bet[] }) {
  return (
    <FrequencyList title="Parlay Sport Composition" rows={computeParlaySportComposition(bets)} />
  )
}
