import { useState } from 'react'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-md bg-slate-900 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium">Add Sport/League</h2>
          <button type="button" onClick={onClose} className="text-slate-400">
            Close
          </button>
        </div>

        <form onSubmit={handleAdd} className="flex flex-col gap-2">
          <select
            value={sportChoice}
            onChange={(e) => setSportChoice(e.target.value)}
            className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-sm"
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
              className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-sm"
            />
          )}

          <input
            type="text"
            value={league}
            onChange={(e) => setLeague(e.target.value)}
            placeholder="League (e.g. IPL)"
            className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-sm"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-emerald-600 py-2 text-sm font-medium disabled:opacity-50"
          >
            {saving ? 'Adding…' : 'Add'}
          </button>
        </form>

        {entries.length > 0 && (
          <div className="mt-4 flex flex-col gap-1">
            <p className="text-xs text-slate-500">Your custom entries</p>
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-md bg-slate-800 px-2 py-1 text-xs"
              >
                <span>
                  {entry.sport} · {entry.league}
                </span>
                <button
                  type="button"
                  onClick={() => void handleDelete(entry.id)}
                  className="text-red-400"
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
