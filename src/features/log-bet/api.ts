import { supabase } from '../../lib/supabaseClient'
import type { BetInput } from './types'

export async function createBet(userId: string, input: BetInput): Promise<void> {
  const { error } = await supabase.from('bets').insert({ ...input, user_id: userId })

  if (error) {
    console.error('createBet failed:', error)
    throw new Error('Could not save that bet. Please try again.')
  }
}
