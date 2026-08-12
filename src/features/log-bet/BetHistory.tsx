import type { Dispatch, SetStateAction } from 'react'
import { BetHistoryRow } from './BetHistoryRow'
import { deleteBet, sortBets, updateBet } from './api'
import type { Bet, BetInput } from './types'

interface BetHistoryProps {
  userId: string
  bets: Bet[]
  setBets: Dispatch<SetStateAction<Bet[]>>
  loading: boolean
  error: string | null
}

export function BetHistory({ userId, bets, setBets, loading, error }: BetHistoryProps) {
  if (loading) return <p className="p-4 text-sm text-slate-500">Loading bets…</p>
  if (error) return <p className="p-4 text-sm text-red-400">{error}</p>
  if (bets.length === 0) {
    return <p className="p-4 text-sm text-slate-500">No bets logged yet.</p>
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      {bets.map((bet) => (
        <BetHistoryRow
          key={bet.id}
          bet={bet}
          userId={userId}
          onSave={async (input: BetInput) => {
            const updated = await updateBet(bet.id, input)
            setBets((prev) => sortBets(prev.map((b) => (b.id === bet.id ? updated : b))))
          }}
          onDelete={async () => {
            await deleteBet(bet.id)
            setBets((prev) => prev.filter((b) => b.id !== bet.id))
          }}
        />
      ))}
    </div>
  )
}
