import type { Bet } from '../../shared/types/bet'

export interface SportFrequency {
  label: string
  count: number
}

/** How often each sport appears across all parlay legs — composition, not outcome, so all parlay bets count regardless of status. */
export function computeParlaySportComposition(bets: Bet[]): SportFrequency[] {
  const counts = new Map<string, number>()
  for (const bet of bets) {
    if (!bet.legs) continue
    for (const leg of bet.legs) {
      counts.set(leg.sport, (counts.get(leg.sport) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
}
