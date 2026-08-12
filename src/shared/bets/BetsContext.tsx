import { useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../../lib/supabaseClient'
import type { Bet } from '../types/bet'
import { BetsContext } from './betsContextDef'

/**
 * Fetches the signed-in user's bets exactly once and shares the result —
 * every page derives its own view (range-filtered, grouped, etc.) from
 * this single array rather than holding its own copy or re-fetching.
 */
export function BetsProvider({ userId, children }: { userId: string; children: ReactNode }) {
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
          console.error('BetsProvider fetch failed:', fetchError)
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

  return (
    <BetsContext.Provider value={{ bets, setBets, loading, error }}>
      {children}
    </BetsContext.Provider>
  )
}
