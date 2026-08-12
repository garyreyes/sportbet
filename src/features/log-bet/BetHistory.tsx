import type { Dispatch, SetStateAction } from 'react'
import { useState } from 'react'
import { AddSportLeagueModal } from './AddSportLeagueModal'
import { BetHistoryRow } from './BetHistoryRow'
import { deleteBet, sortBets, updateBet } from './api'
import type { CustomSportLeague } from './customSportLeagues'
import type { Bet, BetInput } from './types'

interface BetHistoryProps {
  userId: string
  bets: Bet[]
  setBets: Dispatch<SetStateAction<Bet[]>>
  loading: boolean
  error: string | null
  sportLeagues: Record<string, string[]>
  customEntries: CustomSportLeague[]
  setCustomEntries: Dispatch<SetStateAction<CustomSportLeague[]>>
}

export function BetHistory({
  userId,
  bets,
  setBets,
  loading,
  error,
  sportLeagues,
  customEntries,
  setCustomEntries,
}: BetHistoryProps) {
  const [expanded, setExpanded] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  if (!expanded) {
    return (
      <>
        <div className="flex justify-end gap-2 p-4">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="rounded-md bg-slate-800 px-3 py-2 text-sm"
            aria-label="Expand bet history"
          >
            History
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-md bg-slate-800 px-3 py-2 text-sm"
            aria-label="Add sport or league"
          >
            + Sport
          </button>
        </div>
        {modalOpen && (
          <AddSportLeagueModal
            userId={userId}
            sportLeagues={sportLeagues}
            entries={customEntries}
            setEntries={setCustomEntries}
            onClose={() => setModalOpen(false)}
          />
        )}
      </>
    )
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-300">Bet History</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-md bg-slate-800 px-2 py-1 text-xs"
          >
            + Sport/League
          </button>
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="rounded-md bg-slate-800 px-2 py-1 text-xs"
          >
            Minimize
          </button>
        </div>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading bets…</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
      {!loading && !error && bets.length === 0 && (
        <p className="text-sm text-slate-500">No bets logged yet.</p>
      )}

      {bets.map((bet) => (
        <BetHistoryRow
          key={bet.id}
          bet={bet}
          userId={userId}
          sportLeagues={sportLeagues}
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

      {modalOpen && (
        <AddSportLeagueModal
          userId={userId}
          sportLeagues={sportLeagues}
          entries={customEntries}
          setEntries={setCustomEntries}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
