import { useState } from 'react'
import { calculateProfit } from '../../shared/utils/profit'
import { filterSettled } from '../../shared/utils/betFilters'
import { cardClass, focusRingOnSurface, inputClass, primaryButtonClass, secondaryButtonClass } from '../../shared/styles'
import type { Bet } from '../../shared/types/bet'
import { updateMonthlyGoal, useMonthlyGoal } from './api'

function currentMonthPrefix(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function MonthlyGoalCard({ userId, bets }: { userId: string; bets: Bet[] }) {
  const { goal, setGoal, loading } = useMonthlyGoal(userId)
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const monthPrefix = currentMonthPrefix()
  const monthProfit = filterSettled(bets)
    .filter((bet) => bet.date.startsWith(monthPrefix))
    .reduce((sum, bet) => sum + calculateProfit(bet.odds, bet.stake, bet.status), 0)

  const progressPct = goal > 0 ? Math.min(100, Math.max(0, (monthProfit / goal) * 100)) : 0

  const startEditing = () => {
    setInput(String(goal))
    setEditing(true)
  }

  const handleSave = async () => {
    const value = Number(input)
    if (!(value >= 0)) {
      setError('Goal must be 0 or greater.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await updateMonthlyGoal(userId, value)
      setGoal(value)
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your goal.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className={`flex-1 p-5 text-sm text-slate-500 ${cardClass}`}>Loading…</div>
    )
  }

  return (
    <div className={`flex flex-1 flex-col gap-3 p-5 ${cardClass}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Monthly Goal
          </span>
          <span className="text-[10px] text-slate-600">This calendar month</span>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={startEditing}
            className={`rounded px-1.5 py-1 text-xs text-slate-400 transition-colors hover:text-slate-200 ${focusRingOnSurface}`}
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex flex-col gap-2">
          <input
            type="number"
            step="0.01"
            min="0"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={inputClass}
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className={`flex-1 py-1.5 text-xs ${primaryButtonClass}`}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className={`flex-1 py-1.5 text-xs ${secondaryButtonClass}`}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <span className="text-3xl font-semibold">
            {monthProfit.toFixed(2)} <span className="text-lg text-slate-500">/ {goal.toFixed(2)}</span>
          </span>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-emerald-500 transition-[width]"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </>
      )}
    </div>
  )
}
