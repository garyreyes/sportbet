import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import type { Bet, BetInput } from './types'

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

/** Keeps the date-desc, created_at-desc order after a local insert/update. */
export function sortBets(bets: Bet[]): Bet[] {
  return [...bets].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1
    return a.created_at < b.created_at ? 1 : -1
  })
}

export function useBets(userId: string) {
  const [bets, setBets] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('bets')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (cancelled) return
        if (fetchError) {
          console.error('useBets fetch failed:', fetchError)
          setError('Could not load your bets. Please refresh.')
        } else {
          setBets(data ?? [])
        }
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  return { bets, setBets, loading, error }
}
