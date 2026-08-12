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

export const SPORT_LEAGUES: Record<string, string[]> = {
  MMA: ['UFC', 'PFL', 'Rizin'],
  Tennis: ['WTA'],
  Basketball: ['NBA', 'WNBA'],
  Football: ['ASEAN', 'Champions League', 'Carabao Cup', 'Other'],
  'Kickboxing/Muay Thai': ['ONE'],
}

export const SPORTS = Object.keys(SPORT_LEAGUES)

export const MIN_LEGS = 2

export function emptyLeg(): Leg {
  return { sport: SPORTS[0], league: SPORT_LEAGUES[SPORTS[0]][0], pick: '' }
}
