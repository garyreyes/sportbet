import { useAuth } from '../auth/useAuth'
import { BetForm } from './BetForm'
import { createBet } from './api'
import type { BetInput } from './types'

export function LogPage() {
  const { session } = useAuth()
  const userId = session?.user.id

  if (!userId) return null

  const handleSubmit = async (input: BetInput) => {
    await createBet(userId, input)
  }

  return <BetForm userId={userId} onSubmit={handleSubmit} />
}
