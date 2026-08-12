import { useState } from 'react'
import { dangerButtonClass, focusRing, inputClass, primaryButtonClass } from '../../shared/styles'
import {
  createCustomSportLeague,
  deleteCustomSportLeague,
  type CustomSportLeague,
} from './customSportLeagues'

const NEW_SPORT = '__new__'

interface AddSportLeagueModalProps {
  userId: string
  sportLeagues: Record<string, string[]>
  entries: CustomSportLeague[]
  setEntries: (updater: (prev: CustomSportLeague[]) => CustomSportLeague[]) => void
  onClose: () => void
}

export function AddSportLeagueModal({
  userId,
  sportLeagues,
  entries,
  setEntries,
  onClose,
}: AddSportLeagueModalProps) {
  const existingSports = Object.keys(sportLeagues)
  const [sportChoice, setSportChoice] = useState(existingSports[0] ?? NEW_SPORT)
  const [newSport, setNewSport] = useState('')
  const [league, setLeague] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const isNewSport = sportChoice === NEW_SPORT

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedSport = (isNewSport ? newSport : sportChoice).trim()
    const trimmedLeague = league.trim()
    if (!trimmedSport || !trimmedLeague) {
      setError('Both sport and league are required.')
      return
    }

    setSaving(true)
    try {
      const created = await createCustomSportLeague(userId, trimmedSport, trimmedLeague)
      setEntries((prev) => [...prev, created])
      setNewSport('')
      setLeague('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add that sport/league.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteCustomSportLeague(id)
      setEntries((prev) => prev.filter((entry) => entry.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove that sport/league.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Add Sport/League</h2>
          <button
            type="button"
            onClick={onClose}
            className={`rounded px-1 text-sm text-slate-400 transition-colors hover:text-slate-200 ${focusRing}`}
          >
            Close
          </button>
        </div>

        <form onSubmit={handleAdd} className="flex flex-col gap-2.5">
          <select
            value={sportChoice}
            onChange={(e) => setSportChoice(e.target.value)}
            className={`text-sm ${inputClass}`}
          >
            {existingSports.map((sport) => (
              <option key={sport} value={sport}>
                {sport}
              </option>
            ))}
            <option value={NEW_SPORT}>+ Add new sport…</option>
          </select>

          {isNewSport && (
            <input
              type="text"
              value={newSport}
              onChange={(e) => setNewSport(e.target.value)}
              placeholder="New sport name (e.g. Cricket)"
              className={`text-sm ${inputClass}`}
            />
          )}

          <input
            type="text"
            value={league}
            onChange={(e) => setLeague(e.target.value)}
            placeholder="League (e.g. IPL)"
            className={`text-sm ${inputClass}`}
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button type="submit" disabled={saving} className={`py-2 text-sm ${primaryButtonClass}`}>
            {saving ? 'Adding…' : 'Add'}
          </button>
        </form>

        {entries.length > 0 && (
          <div className="mt-4 flex flex-col gap-1.5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Your custom entries
            </p>
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs"
              >
                <span>
                  {entry.sport} · {entry.league}
                </span>
                <button
                  type="button"
                  onClick={() => void handleDelete(entry.id)}
                  className={`rounded px-1.5 py-0.5 transition-colors ${focusRing} ${dangerButtonClass}`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
