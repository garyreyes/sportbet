import { useMemo, useState } from 'react'
import { calculateProfit } from '../../shared/utils/profit'
import { toLocalDateKey } from '../../shared/utils/date'
import { STATUS_TEXT_COLOR } from '../../shared/utils/statusColor'
import { focusRingOnSurface, inputClass, primaryButtonClass, secondaryButtonClass } from '../../shared/styles'
import { LegEditor } from './LegEditor'
import { useDraft } from './useDraft'
import {
  MIN_LEGS,
  emptyLeg,
  ensureBetOptions,
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

const STATUS_SELECTED_CLASS: Record<BetStatus, string> = {
  win: 'bg-emerald-600 text-white shadow-sm shadow-emerald-950/40',
  loss: 'bg-red-600 text-white shadow-sm shadow-red-950/40',
  push: 'bg-blue-600 text-white shadow-sm shadow-blue-950/40',
  pending: 'bg-slate-600 text-white shadow-sm shadow-black/30',
}

interface BetFormProps {
  userId: string
  sportLeagues: Record<string, string[]>
  initialBet?: Bet
  onSubmit: (input: BetInput) => Promise<void>
}

export function BetForm({ userId, sportLeagues: baseSportLeagues, initialBet, onSubmit }: BetFormProps) {
  const sportLeagues = useMemo(
    () => ensureBetOptions(baseSportLeagues, initialBet),
    [baseSportLeagues, initialBet],
  )
  const sports = Object.keys(sportLeagues)
  const [draft, setDraft, clearDraft] = useDraft<DraftState>(
    `bet-draft:${userId}:${initialBet?.id ?? 'new'}`,
    initialBet ? fromBet(initialBet, sportLeagues) : defaultDraft(sportLeagues),
  )
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const odds = Number(draft.odds)
  const stake = Number(draft.stake)
  const projectedProfit = calculateProfit(
    odds || 0,
    stake || 0,
    draft.status === 'pending' ? 'win' : draft.status,
  )
  const profitLabel = draft.status === 'pending' ? 'Profit if this wins' : 'Profit'

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-5">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => update({ mode: 'single' })}
          className={`flex-1 py-2 text-sm ${
            draft.mode === 'single' ? primaryButtonClass : secondaryButtonClass
          }`}
        >
          Single
        </button>
        <button
          type="button"
          onClick={() => update({ mode: 'parlay' })}
          className={`flex-1 py-2 text-sm ${
            draft.mode === 'parlay' ? primaryButtonClass : secondaryButtonClass
          }`}
        >
          Parlay
        </button>
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Date</span>
        <input
          type="date"
          value={draft.date}
          onChange={(e) => update({ date: e.target.value })}
          className={inputClass}
        />
      </label>

      {draft.mode === 'single' ? (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <label className="flex flex-1 flex-col gap-1.5 text-sm">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Sport
              </span>
              <select
                value={draft.sport}
                onChange={(e) =>
                  update({ sport: e.target.value, league: sportLeagues[e.target.value][0] })
                }
                className={inputClass}
              >
                {sports.map((sport) => (
                  <option key={sport} value={sport}>
                    {sport}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-1 flex-col gap-1.5 text-sm">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                League
              </span>
              <select
                value={draft.league}
                onChange={(e) => update({ league: e.target.value })}
                className={inputClass}
              >
                {sportLeagues[draft.sport].map((league) => (
                  <option key={league} value={league}>
                    {league}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Pick
            </span>
            <input
              type="text"
              value={draft.pick}
              onChange={(e) => update({ pick: e.target.value })}
              placeholder="Optional"
              className={inputClass}
            />
          </label>
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
        <label className="flex flex-1 flex-col gap-1.5 text-sm">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Odds (decimal)
          </span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={draft.odds}
            onChange={(e) => update({ odds: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="flex flex-1 flex-col gap-1.5 text-sm">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Stake
          </span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={draft.stake}
            onChange={(e) => update({ stake: e.target.value })}
            className={inputClass}
          />
        </label>
      </div>

      <p className="text-sm text-slate-400">
        {profitLabel}:{' '}
        <span className={`font-semibold ${projectedProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {projectedProfit.toFixed(2)}
        </span>
      </p>

      <div className="flex gap-2">
        {STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => update({ status })}
            className={`flex-1 rounded-lg py-2 text-xs font-medium capitalize transition-colors ${focusRingOnSurface} ${
              draft.status === status
                ? STATUS_SELECTED_CLASS[status]
                : `bg-slate-800 hover:bg-slate-700 ${STATUS_TEXT_COLOR[status]}`
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button type="submit" disabled={saving} className={`py-2.5 font-medium ${primaryButtonClass}`}>
        {saving ? 'Saving…' : initialBet ? 'Update bet' : 'Save bet'}
      </button>
    </form>
  )
}
