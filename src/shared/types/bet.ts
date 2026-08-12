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
