/** Symbol-prefixed amount — used where two members' different currencies can appear side by side (the group leaderboard), unlike every other panel in the app which still shows bare numbers pending Phase 7a's currency picker. */
export function formatCurrency(amount: number, symbol: string): string {
  const sign = amount < 0 ? '-' : ''
  return `${sign}${symbol}${Math.abs(amount).toFixed(2)}`
}
