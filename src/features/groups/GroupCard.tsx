import { useState } from 'react'
import {
  cardClass,
  focusRingOnSurface,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../../shared/styles'
import { deleteGroup, removeMember, renameGroup } from './api'
import type { GroupWithMembers } from './types'

const CONFIRM_TIMEOUT = 3000

interface GroupCardProps {
  group: GroupWithMembers
  currentUserId: string
  defaultExpanded: boolean
  onChanged: () => void
}

export function GroupCard({ group, currentUserId, defaultExpanded, onChanged }: GroupCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [renaming, setRenaming] = useState(false)
  const [nameDraft, setNameDraft] = useState(group.name)
  const [confirmingLeaveOrDelete, setConfirmingLeaveOrDelete] = useState(false)
  const [confirmingKick, setConfirmingKick] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    setError(null)
    try {
      await renameGroup(group.id, trimmed)
      setRenaming(false)
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not rename that group.')
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
    setError(null)
    try {
      if (group.isOwner) {
        await deleteGroup(group.id)
      } else {
        await removeMember(group.id, currentUserId)
      }
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not complete that action.')
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
    setError(null)
    try {
      await removeMember(group.id, userId)
      setConfirmingKick(null)
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove that member.')
      setConfirmingKick(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={cardClass}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={`flex w-full items-center justify-between p-5 text-left ${focusRingOnSurface}`}
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-slate-100">{group.name}</span>
          <span className="text-xs text-slate-500">
            {group.members.length} member{group.members.length === 1 ? '' : 's'}
          </span>
        </div>
        <span className="text-xs text-slate-500">{expanded ? 'Collapse' : 'Expand'}</span>
      </button>

      {expanded && (
        <div className="flex flex-col gap-4 px-5 pb-5">
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

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      )}
    </div>
  )
}
