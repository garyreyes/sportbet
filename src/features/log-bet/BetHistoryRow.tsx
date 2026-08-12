import { useState } from 'react'
import { calculateProfit } from '../../shared/utils/profit'
import { STATUS_TEXT_COLOR } from '../../shared/utils/statusColor'
import { cardClass, focusRingOnSurface } from '../../shared/styles'
import { BetForm } from './BetForm'
import type { Bet, BetInput } from './types'

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
    <div className={cardClass}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={`flex w-full items-center justify-between rounded-xl p-4 text-left text-sm transition-colors hover:bg-slate-800/60 ${focusRingOnSurface}`}
      >
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">{label}</span>
          <span className="text-xs text-slate-500">{bet.date}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`font-semibold ${STATUS_TEXT_COLOR[bet.status]}`}>
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
            className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${focusRingOnSurface} ${
              confirmingDelete
                ? 'bg-red-600 text-white shadow-sm shadow-red-950/40'
                : 'bg-slate-800 text-red-300 hover:bg-red-900/40'
            }`}
          >
            {confirmingDelete ? 'Confirm delete?' : 'Delete'}
          </button>
        </div>
      </button>

      {deleteError && <p className="px-4 pb-3 text-xs text-red-400">{deleteError}</p>}

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
