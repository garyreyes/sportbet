import { useState } from 'react'
import { calculateProfit } from '../../shared/utils/profit'
import { BetForm } from './BetForm'
import type { Bet, BetInput } from './types'

const STATUS_COLOR: Record<Bet['status'], string> = {
  win: 'text-emerald-400',
  loss: 'text-red-400',
  push: 'text-blue-400',
  pending: 'text-slate-400',
}

interface BetHistoryRowProps {
  bet: Bet
  userId: string
  sportLeagues: Record<string, string[]>
  onSave: (input: BetInput) => Promise<void>
  onDelete: () => Promise<void>
}

export function BetHistoryRow({
  bet,
  userId,
  sportLeagues,
  onSave,
  onDelete,
}: BetHistoryRowProps) {
  const [expanded, setExpanded] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const label = bet.legs ? `Parlay (${bet.legs.length} legs)` : `${bet.sport} · ${bet.league}`
  const profit = calculateProfit(bet.odds, bet.stake, bet.status)

  const handleDeleteClick = async () => {
    if (!confirmingDelete) {
      setConfirmingDelete(true)
      setTimeout(() => setConfirmingDelete(false), 3000)
      return
    }
    setDeleting(true)
    setDeleteError(null)
    try {
      await onDelete()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Could not delete that bet.')
      setConfirmingDelete(false)
    } finally {
      setDeleting(false)
    }
  }

  const handleSave = async (input: BetInput) => {
    await onSave(input)
    setExpanded(false)
  }

  return (
    <div className="rounded-md border border-slate-800">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between p-3 text-left text-sm"
      >
        <div className="flex flex-col">
          <span>{label}</span>
          <span className="text-xs text-slate-500">{bet.date}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={STATUS_COLOR[bet.status]}>
            {bet.status === 'pending' || bet.status === 'push'
              ? bet.status
              : profit.toFixed(2)}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              void handleDeleteClick()
            }}
            disabled={deleting}
            className={`rounded-md px-2 py-1 text-xs ${
              confirmingDelete ? 'bg-red-600' : 'bg-slate-800'
            }`}
          >
            {confirmingDelete ? 'Confirm delete?' : 'Delete'}
          </button>
        </div>
      </button>

      {deleteError && <p className="px-3 pb-2 text-xs text-red-400">{deleteError}</p>}

      {expanded && (
        <div className="border-t border-slate-800">
          <BetForm
            userId={userId}
            sportLeagues={sportLeagues}
            initialBet={bet}
            onSubmit={handleSave}
          />
        </div>
      )}
    </div>
  )
}
