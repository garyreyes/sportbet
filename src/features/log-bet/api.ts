import { supabase } from '../../lib/supabaseClient'
import type { Bet, BetInput } from './types'

export { sortBets } from '../../shared/bets/sortBets'

export async function createBet(userId: string, input: BetInput): Promise<Bet> {
  const { data, error } = await supabase
    .from('bets')
    .insert({ ...input, user_id: userId })
    .select()
    .single()

  if (error || !data) {
    console.error('createBet failed:', error)
    throw new Error('Could not save that bet. Please try again.')
  }

  return data
}

export async function updateBet(id: string, input: BetInput): Promise<Bet> {
  const { data, error } = await supabase
    .from('bets')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error || !data) {
    console.error('updateBet failed:', error)
    throw new Error('Could not save that change. Please try again.')
  }

  return data
}

export async function deleteBet(id: string): Promise<void> {
  const { error } = await supabase.from('bets').delete().eq('id', id)

  if (error) {
    console.error('deleteBet failed:', error)
    throw new Error('Could not delete that bet. Please try again.')
  }
}
