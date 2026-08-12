import { useBetsContext } from '../../shared/bets/useBetsContext'
import { cardClass } from '../../shared/styles'
import { useAuth } from '../auth/useAuth'
import { BetForm } from './BetForm'
import { BetHistory } from './BetHistory'
import { createBet, sortBets } from './api'
import { useCustomSportLeagues } from './customSportLeagues'
import { mergeSportLeagues, type BetInput } from './types'

export function LogPage() {
  const { session } = useAuth()
  const userId = session?.user.id
  const { bets, setBets, loading, error } = useBetsContext()
  const { entries: customEntries, setEntries: setCustomEntries } = useCustomSportLeagues(
    userId ?? '',
  )

  if (!userId) return null

  const sportLeagues = mergeSportLeagues(customEntries)

  const handleSubmit = async (input: BetInput) => {
    const created = await createBet(userId, input)
    setBets((prev) => sortBets([...prev, created]))
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 pb-8 sm:p-6">
      <div className={cardClass}>
        <BetForm userId={userId} sportLeagues={sportLeagues} onSubmit={handleSubmit} />
      </div>
      <BetHistory
        userId={userId}
        bets={bets}
        setBets={setBets}
        loading={loading}
        error={error}
        sportLeagues={sportLeagues}
        customEntries={customEntries}
        setCustomEntries={setCustomEntries}
      />
    </div>
  )
}
