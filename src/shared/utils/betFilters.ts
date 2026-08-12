import type { Bet } from '../types/bet'

/** Win/loss only — used for win rate, streaks. Push/pending aren't decisive. */
export function filterDecisive(bets: Bet[]): Bet[] {
  return bets.filter((bet) => bet.status === 'win' || bet.status === 'loss')
}

/** Everything except pending — used for profit/staked sums, since a push still "happened." */
export function filterSettled(bets: Bet[]): Bet[] {
  return bets.filter((bet) => bet.status !== 'pending')
}
