import { useEffect, useState } from 'react'
import { formatCurrency } from '../../shared/utils/formatCurrency'
import { cardClass, focusRingOnSurface, inputClass } from '../../shared/styles'
import { getGroupLeaderboard } from './api'
import type { GroupWithMembers, LeaderboardRow } from './types'

const MEDALS = ['🥇', '🥈', '🥉']

function StatCell({ label, value, currency }: { label: string; value: number | null; currency: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[10px] uppercase tracking-wide text-slate-500">{label}</span>
      <span
        className={`text-sm font-semibold ${
          value === null ? 'text-slate-600' : value >= 0 ? 'text-emerald-400' : 'text-red-400'
        }`}
      >
        {value === null ? 'Hidden' : formatCurrency(value, currency)}
      </span>
    </div>
  )
}

interface LeaderboardProps {
  currentUserId: string
  groups: GroupWithMembers[]
  refreshKey: number
}

export function Leaderboard({ currentUserId, groups, refreshKey }: LeaderboardProps) {
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id ?? '')
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!groups.some((g) => g.id === selectedGroupId)) {
      setSelectedGroupId(groups[0]?.id ?? '')
    }
  }, [groups, selectedGroupId])

  useEffect(() => {
    if (!selectedGroupId) return
    let cancelled = false
    setRows(null)
    setError(null)
    getGroupLeaderboard(selectedGroupId)
      .then((result) => {
        if (!cancelled) setRows(result)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load the leaderboard.')
      })
    return () => {
      cancelled = true
    }
  }, [selectedGroupId, refreshKey])

  if (groups.length === 0) return null

  const ranked = (rows ?? [])
    .filter((r) => r.overall_profit !== null)
    .sort((a, b) => (b.overall_profit ?? 0) - (a.overall_profit ?? 0))
  const unranked = (rows ?? []).filter((r) => r.overall_profit === null)
  const topProfit = ranked[0]?.overall_profit ?? 0
  const currencies = new Set((rows ?? []).map((r) => r.currency))

  return (
    <div className={`flex flex-col gap-4 p-5 ${cardClass}`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">Leaderboard</h2>
        {groups.length > 1 && (
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className={`text-xs ${inputClass} ${focusRingOnSurface}`}
          >
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {currencies.size > 1 && (
        <p className="rounded-lg bg-amber-500/10 p-3 text-xs text-amber-400">
          Members use different currencies — amounts are shown as entered, not converted.
        </p>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      {!error && rows === null && <p className="text-sm text-slate-500">Loading leaderboard…</p>}

      {!error && rows !== null && (
        <div className="flex flex-col gap-2">
          {[...ranked, ...unranked].map((row, index) => {
            const isRanked = row.overall_profit !== null
            const progressPct =
              isRanked && topProfit > 0
                ? Math.min(100, Math.max(0, ((row.overall_profit as number) / topProfit) * 100))
                : 0
            const isSelf = row.member_id === currentUserId

            return (
              <div
                key={row.member_id}
                className={`flex flex-col gap-2 rounded-lg p-3 ${
                  isSelf ? 'bg-emerald-500/10 ring-1 ring-emerald-500/30' : 'bg-slate-950/60'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
                    {isRanked && index < 3 ? MEDALS[index] : null}
                    {row.full_name ?? 'Unnamed'}
                  </span>
                  <span
                    className={`text-lg font-semibold ${
                      row.overall_profit === null
                        ? 'text-slate-600'
                        : row.overall_profit >= 0
                          ? 'text-emerald-400'
                          : 'text-red-400'
                    }`}
                  >
                    {row.overall_profit === null
                      ? 'Hidden'
                      : formatCurrency(row.overall_profit, row.currency)}
                  </span>
                </div>

                {isRanked && (
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-[width]"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                )}

                <div className="grid grid-cols-4 gap-2">
                  <StatCell label="Past 30d" value={row.month_profit} currency={row.currency} />
                  <StatCell label="Past 7d" value={row.week_profit} currency={row.currency} />
                  <StatCell label="Today" value={row.today_profit} currency={row.currency} />
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[10px] uppercase tracking-wide text-slate-500">
                      Win Rate
                    </span>
                    <span className="text-sm font-semibold text-slate-200">
                      {row.win_rate === null ? '—' : `${row.win_rate.toFixed(1)}%`}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
