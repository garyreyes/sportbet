import { useState } from 'react'
import { calculateProfit } from '../../shared/utils/profit'
import { toLocalDateKey } from '../../shared/utils/date'
import { LegEditor } from './LegEditor'
import { useDraft } from './useDraft'
import {
  MIN_LEGS,
  emptyLeg,
  type Bet,
  type BetInput,
  type BetStatus,
  type Leg,
} from './types'

interface DraftState {
  mode: 'single' | 'parlay'
  date: string
  sport: string
  league: string
  pick: string
  legs: Leg[]
  odds: string
  stake: string
  status: BetStatus
}

function defaultDraft(sportLeagues: Record<string, string[]>): DraftState {
  const sport = Object.keys(sportLeagues)[0]
  return {
    mode: 'single',
    date: toLocalDateKey(new Date()),
    sport,
    league: sportLeagues[sport][0],
    pick: '',
    legs: [emptyLeg(sportLeagues), emptyLeg(sportLeagues)],
    odds: '',
    stake: '',
    status: 'pending',
  }
}

function fromBet(bet: Bet, sportLeagues: Record<string, string[]>): DraftState {
  const fallbackSport = Object.keys(sportLeagues)[0]
  return {
    mode: bet.legs ? 'parlay' : 'single',
    date: bet.date,
    sport: bet.legs ? fallbackSport : bet.sport,
    league: bet.legs ? sportLeagues[fallbackSport][0] : bet.league,
    pick: bet.pick ?? '',
    legs: bet.legs ?? [emptyLeg(sportLeagues), emptyLeg(sportLeagues)],
    odds: String(bet.odds),
    stake: String(bet.stake),
    status: bet.status,
  }
}

const STATUSES: BetStatus[] = ['win', 'loss', 'push', 'pending']

interface BetFormProps {
  userId: string
  sportLeagues: Record<string, string[]>
  initialBet?: Bet
  onSubmit: (input: BetInput) => Promise<void>
}

export function BetForm({ userId, sportLeagues, initialBet, onSubmit }: BetFormProps) {
  const sports = Object.keys(sportLeagues)
  const [draft, setDraft, clearDraft] = useDraft<DraftState>(
    `bet-draft:${userId}:${initialBet?.id ?? 'new'}`,
    initialBet ? fromBet(initialBet, sportLeagues) : defaultDraft(sportLeagues),
  )
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const odds = Number(draft.odds)
  const stake = Number(draft.stake)
  const projectedProfit = calculateProfit(odds || 0, stake || 0, 'win')

  const update = (patch: Partial<DraftState>) => setDraft((prev) => ({ ...prev, ...patch }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!(odds > 0)) {
      setError('Odds must be greater than 0.')
      return
    }
    if (!(stake > 0)) {
      setError('Stake must be greater than 0.')
      return
    }

    const input: BetInput =
      draft.mode === 'parlay'
        ? {
            sport: 'Parlay',
            league: '',
            pick: null,
            legs: draft.legs,
            odds,
            stake,
            status: draft.status,
            date: draft.date,
          }
        : {
            sport: draft.sport,
            league: draft.league,
            pick: draft.pick || null,
            legs: null,
            odds,
            stake,
            status: draft.status,
            date: draft.date,
          }

    setSaving(true)
    try {
      await onSubmit(input)
      clearDraft()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that bet.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => update({ mode: 'single' })}
          className={`flex-1 rounded-md py-2 text-sm ${
            draft.mode === 'single' ? 'bg-emerald-600' : 'bg-slate-800'
          }`}
        >
          Single
        </button>
        <button
          type="button"
          onClick={() => update({ mode: 'parlay' })}
          className={`flex-1 rounded-md py-2 text-sm ${
            draft.mode === 'parlay' ? 'bg-emerald-600' : 'bg-slate-800'
          }`}
        >
          Parlay
        </button>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Date
        <input
          type="date"
          value={draft.date}
          onChange={(e) => update({ date: e.target.value })}
          className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1"
        />
      </label>

      {draft.mode === 'single' ? (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <select
              value={draft.sport}
              onChange={(e) =>
                update({ sport: e.target.value, league: sportLeagues[e.target.value][0] })
              }
              className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm"
            >
              {sports.map((sport) => (
                <option key={sport} value={sport}>
                  {sport}
                </option>
              ))}
            </select>
            <select
              value={draft.league}
              onChange={(e) => update({ league: e.target.value })}
              className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm"
            >
              {sportLeagues[draft.sport].map((league) => (
                <option key={league} value={league}>
                  {league}
                </option>
              ))}
            </select>
          </div>
          <input
            type="text"
            value={draft.pick}
            onChange={(e) => update({ pick: e.target.value })}
            placeholder="Pick (optional)"
            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm"
          />
        </div>
      ) : (
        <LegEditor
          legs={draft.legs}
          sportLeagues={sportLeagues}
          onChange={(legs) =>
            update({ legs: legs.length >= MIN_LEGS ? legs : draft.legs })
          }
        />
      )}

      <div className="flex gap-2">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Odds (decimal)
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={draft.odds}
            onChange={(e) => update({ odds: e.target.value })}
            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Stake
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={draft.stake}
            onChange={(e) => update({ stake: e.target.value })}
            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1"
          />
        </label>
      </div>

      <p className="text-sm text-slate-400">
        Projected profit:{' '}
        <span className={projectedProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}>
          {projectedProfit.toFixed(2)}
        </span>
      </p>

      <div className="flex gap-2">
        {STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => update({ status })}
            className={`flex-1 rounded-md py-2 text-xs capitalize ${
              draft.status === status ? 'bg-emerald-600' : 'bg-slate-800'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-emerald-600 py-2 font-medium disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save bet'}
      </button>
    </form>
  )
}
