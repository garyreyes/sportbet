import { useState } from 'react'
import { calculateProfit } from '../../shared/utils/profit'
import { filterSettled } from '../../shared/utils/betFilters'
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
      <div className="flex-1 rounded-md border border-slate-800 p-4 text-sm text-slate-500">
        Loading…
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-2 rounded-md border border-slate-800 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">Monthly Goal</span>
        {!editing && (
          <button type="button" onClick={startEditing} className="text-xs text-slate-400">
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
            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="flex-1 rounded-md bg-emerald-600 py-1 text-xs disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="flex-1 rounded-md bg-slate-800 py-1 text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <span className="text-2xl font-semibold">
            {monthProfit.toFixed(2)} / {goal.toFixed(2)}
          </span>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full bg-emerald-500" style={{ width: `${progressPct}%` }} />
          </div>
        </>
      )}
    </div>
  )
}
