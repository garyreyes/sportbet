import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export function useMonthlyGoal(userId: string) {
  const [goal, setGoal] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('profiles')
      .select('monthly_goal')
      .eq('id', userId)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.error('useMonthlyGoal fetch failed:', error)
        } else {
          setGoal(data?.monthly_goal ?? 0)
        }
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  return { goal, setGoal, loading }
}

export async function updateMonthlyGoal(userId: string, goal: number): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ monthly_goal: goal })
    .eq('id', userId)

  if (error) {
    console.error('updateMonthlyGoal failed:', error)
    throw new Error('Could not save your goal. Please try again.')
  }
}
