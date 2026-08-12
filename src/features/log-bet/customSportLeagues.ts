import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export interface CustomSportLeague {
  id: string
  sport: string
  league: string
}

export async function createCustomSportLeague(
  userId: string,
  sport: string,
  league: string,
): Promise<CustomSportLeague> {
  const { data, error } = await supabase
    .from('custom_sport_leagues')
    .insert({ user_id: userId, sport, league })
    .select('id, sport, league')
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error('You already added that sport/league.')
    }
    console.error('createCustomSportLeague failed:', error)
    throw new Error('Could not add that sport/league. Please try again.')
  }

  return data
}

export async function deleteCustomSportLeague(id: string): Promise<void> {
  const { error } = await supabase.from('custom_sport_leagues').delete().eq('id', id)

  if (error) {
    console.error('deleteCustomSportLeague failed:', error)
    throw new Error('Could not remove that sport/league. Please try again.')
  }
}

export function useCustomSportLeagues(userId: string) {
  const [entries, setEntries] = useState<CustomSportLeague[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('custom_sport_leagues')
      .select('id, sport, league')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.error('useCustomSportLeagues fetch failed:', error)
        } else {
          setEntries(data ?? [])
        }
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  return { entries, setEntries, loading }
}
