import { useEffect, useState } from 'react'
import {
  cardClass,
  focusRingOnSurface,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../../shared/styles'
import { formatCurrency } from '../../shared/utils/formatCurrency'
import { deleteGroup, getGroupLeaderboard, removeMember, renameGroup } from './api'
import type { GroupWithMembers, LeaderboardRow } from './types'

const CONFIRM_TIMEOUT = 3000
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

interface GroupDetailProps {
  group: GroupWithMembers
  currentUserId: string
  refreshKey: number
  onChanged: () => void
}

export function GroupDetail({ group, currentUserId, refreshKey, onChanged }: GroupDetailProps) {
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null)
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null)

  const [manageOpen, setManageOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [nameDraft, setNameDraft] = useState(group.name)
  const [confirmingLeaveOrDelete, setConfirmingLeaveOrDelete] = useState(false)
  const [confirmingKick, setConfirmingKick] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [manageError, setManageError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setRows(null)
    setLeaderboardError(null)
    getGroupLeaderboard(group.id)
      .then((result) => {
        if (!cancelled) setRows(result)
      })
      .catch((err) => {
        if (!cancelled) setLeaderboardError(err instanceof Error ? err.message : 'Could not load the leaderboard.')
      })
    return () => {
      cancelled = true
    }
  }, [group.id, refreshKey])

  useEffect(() => {
    setNameDraft(group.name)
    setRenaming(false)
  }, [group.id, group.name])

  const inviteUrl = `${window.location.origin}/groups?invite=${group.invite_code}`

  const handleCopyLink = () => {
    void navigator.clipboard.writeText(inviteUrl)
  }

  const handleRenameSave = async () => {
    const trimmed = nameDraft.trim()
    if (!trimmed || trimmed === group.name) {
      setRenaming(false)
      setNameDraft(group.name)
      return
    }
    setSaving(true)
    setManageError(null)
    try {
      await renameGroup(group.id, trimmed)
      setRenaming(false)
      onChanged()
    } catch (err) {
      setManageError(err instanceof Error ? err.message : 'Could not rename that group.')
    } finally {
      setSaving(false)
    }
  }

  const handleLeaveOrDeleteClick = async () => {
    if (!confirmingLeaveOrDelete) {
      setConfirmingLeaveOrDelete(true)
      setTimeout(() => setConfirmingLeaveOrDelete(false), CONFIRM_TIMEOUT)
      return
    }
    setSaving(true)
    setManageError(null)
    try {
      if (group.isOwner) {
        await deleteGroup(group.id)
      } else {
        await removeMember(group.id, currentUserId)
      }
      onChanged()
    } catch (err) {
      setManageError(err instanceof Error ? err.message : 'Could not complete that action.')
      setConfirmingLeaveOrDelete(false)
    } finally {
      setSaving(false)
    }
  }

  const handleKickClick = async (userId: string) => {
    if (confirmingKick !== userId) {
      setConfirmingKick(userId)
      setTimeout(() => setConfirmingKick((current) => (current === userId ? null : current)), CONFIRM_TIMEOUT)
      return
    }
    setSaving(true)
    setManageError(null)
    try {
      await removeMember(group.id, userId)
      setConfirmingKick(null)
      onChanged()
    } catch (err) {
      setManageError(err instanceof Error ? err.message : 'Could not remove that member.')
      setConfirmingKick(null)
    } finally {
      setSaving(false)
    }
  }

  const ranked = (rows ?? [])
    .filter((r) => r.overall_profit !== null)
    .sort((a, b) => (b.overall_profit ?? 0) - (a.overall_profit ?? 0))
  const unranked = (rows ?? []).filter((r) => r.overall_profit === null)
  const topProfit = ranked[0]?.overall_profit ?? 0
  const currencies = new Set((rows ?? []).map((r) => r.currency))

  return (
    <div className={`flex flex-col gap-4 p-5 ${cardClass}`}>
      <div className="flex flex-col gap-0.5">
        <h2 className="text-sm font-semibold text-slate-100">{group.name}</h2>
        <span className="text-xs text-slate-500">
          {group.members.length} member{group.members.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Invite link
        </span>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={inviteUrl}
            className={`flex-1 text-xs ${inputClass}`}
            onFocus={(e) => e.target.select()}
          />
          <button
            type="button"
            onClick={handleCopyLink}
            className={`px-3 py-2 text-xs ${secondaryButtonClass}`}
          >
            Copy
          </button>
        </div>
      </div>

      {currencies.size > 1 && (
        <p className="rounded-lg bg-amber-500/10 p-3 text-xs text-amber-400">
          Members use different currencies — amounts are shown as entered, not converted.
        </p>
      )}

      {leaderboardError && <p className="text-sm text-red-400">{leaderboardError}</p>}

      {!leaderboardError && rows === null && (
        <p className="text-sm text-slate-500">Loading leaderboard…</p>
      )}

      {!leaderboardError && rows !== null && (
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

      <div className="border-t border-slate-800 pt-3">
        <button
          type="button"
          onClick={() => setManageOpen((v) => !v)}
          className={`rounded px-1 text-xs text-slate-400 transition-colors hover:text-slate-200 ${focusRingOnSurface}`}
        >
          {manageOpen ? 'Hide manage group' : 'Manage group'}
        </button>

        {manageOpen && (
          <div className="mt-3 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Members
              </span>
              <div className="flex flex-col gap-1.5">
                {group.members.map((member) => (
                  <div key={member.user_id} className="flex items-center justify-between gap-3">
                    <span className="text-sm text-slate-300">
                      {member.full_name ?? 'Unnamed'}
                      {member.is_owner && (
                        <span className="ml-1.5 text-[10px] uppercase tracking-wide text-slate-500">
                          Owner
                        </span>
                      )}
                    </span>
                    {group.isOwner && member.user_id !== currentUserId && (
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => void handleKickClick(member.user_id)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${focusRingOnSurface} ${
                          confirmingKick === member.user_id
                            ? 'bg-red-600 text-white shadow-sm shadow-red-950/40'
                            : 'bg-slate-800 text-red-300 hover:bg-red-900/40'
                        }`}
                      >
                        {confirmingKick === member.user_id ? 'Confirm kick?' : 'Kick'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {group.isOwner &&
              (renaming ? (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Rename group
                  </span>
                  <input
                    type="text"
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    className={`text-sm ${inputClass}`}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void handleRenameSave()}
                      className={`flex-1 py-1.5 text-xs ${primaryButtonClass}`}
                    >
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRenaming(false)
                        setNameDraft(group.name)
                      }}
                      className={`flex-1 py-1.5 text-xs ${secondaryButtonClass}`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setRenaming(true)}
                  className={`self-start px-2.5 py-1 text-xs ${secondaryButtonClass}`}
                >
                  Rename
                </button>
              ))}

            <button
              type="button"
              disabled={saving}
              onClick={() => void handleLeaveOrDeleteClick()}
              className={`self-start rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${focusRingOnSurface} ${
                confirmingLeaveOrDelete
                  ? 'bg-red-600 text-white shadow-sm shadow-red-950/40'
                  : 'bg-slate-800 text-red-300 hover:bg-red-900/40'
              }`}
            >
              {confirmingLeaveOrDelete
                ? 'Confirm?'
                : group.isOwner
                  ? 'Delete group'
                  : 'Leave group'}
            </button>

            {manageError && <p className="text-xs text-red-400">{manageError}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
