export interface OddsBucket {
  label: string
  min: number
  max: number | null
}

/** Standard favorite -> longshot sportsbook convention. */
export const ODDS_BUCKETS: OddsBucket[] = [
  { label: '1.01–1.50', min: 1.01, max: 1.5 },
  { label: '1.51–2.00', min: 1.51, max: 2.0 },
  { label: '2.01–3.00', min: 2.01, max: 3.0 },
  { label: '3.01–5.00', min: 3.01, max: 5.0 },
  { label: '5.01–10.00', min: 5.01, max: 10.0 },
  { label: '10.01+', min: 10.01, max: null },
]

export function bucketForOdds(odds: number): OddsBucket {
  return (
    ODDS_BUCKETS.find((bucket) => odds >= bucket.min && (bucket.max === null || odds <= bucket.max)) ??
    ODDS_BUCKETS[ODDS_BUCKETS.length - 1]
  )
}
