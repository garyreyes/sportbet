export type BetStatus = 'win' | 'loss' | 'push' | 'pending'

export interface Leg {
  sport: string
  league: string
  pick: string
}

export interface Bet {
  id: string
  user_id: string
  sport: string
  league: string
  pick: string | null
  odds: number
  stake: number
  status: BetStatus
  date: string
  legs: Leg[] | null
  created_at: string
}

export type BetInput = Omit<Bet, 'id' | 'user_id' | 'created_at'>

export const BASE_SPORT_LEAGUES: Record<string, string[]> = {
  MMA: ['UFC', 'PFL', 'Rizin'],
  Tennis: ['WTA'],
  Basketball: ['NBA', 'WNBA'],
  Football: ['ASEAN', 'Champions League', 'Carabao Cup', 'Other'],
  'Kickboxing/Muay Thai': ['ONE'],
}

export const MIN_LEGS = 2

export interface CustomEntry {
  sport: string
  league: string
}

/** Built-in list plus the user's custom additions, deduped per sport. */
export function mergeSportLeagues(custom: CustomEntry[]): Record<string, string[]> {
  const merged: Record<string, string[]> = {}
  for (const [sport, leagues] of Object.entries(BASE_SPORT_LEAGUES)) {
    merged[sport] = [...leagues]
  }
  for (const { sport, league } of custom) {
    if (!merged[sport]) merged[sport] = []
    if (!merged[sport].includes(league)) merged[sport].push(league)
  }
  return merged
}

export function emptyLeg(sportLeagues: Record<string, string[]>): Leg {
  const sport = Object.keys(sportLeagues)[0]
  return { sport, league: sportLeagues[sport][0], pick: '' }
}
