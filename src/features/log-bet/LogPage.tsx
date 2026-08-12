import { useAuth } from '../auth/useAuth'
import { BetForm } from './BetForm'
import { BetHistory } from './BetHistory'
import { createBet, sortBets, useBets } from './api'
import type { BetInput } from './types'

export function LogPage() {
  const { session } = useAuth()
  const userId = session?.user.id
  const { bets, setBets, loading, error } = useBets(userId ?? '')

  if (!userId) return null

  const handleSubmit = async (input: BetInput) => {
    const created = await createBet(userId, input)
    setBets((prev) => sortBets([...prev, created]))
  }

  return (
    <div>
      <BetForm userId={userId} onSubmit={handleSubmit} />
      <BetHistory
        userId={userId}
        bets={bets}
        setBets={setBets}
        loading={loading}
        error={error}
      />
    </div>
  )
}
