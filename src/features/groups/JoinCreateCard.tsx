import { useState } from 'react'
import {
  cardClass,
  focusRingOnSurface,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../../shared/styles'
import { createGroup, getGroupPreview, joinGroupByInviteCode } from './api'
import type { Group } from './types'

type Tab = 'join' | 'create'

interface JoinCreateCardProps {
  userId: string
  defaultExpanded: boolean
  onJoined: () => void
  onCreated: (group: Group) => void
}

export function JoinCreateCard({
  userId,
  defaultExpanded,
  onJoined,
  onCreated,
}: JoinCreateCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [tab, setTab] = useState<Tab>('join')
  const [inviteCode, setInviteCode] = useState('')
  const [groupName, setGroupName] = useState('')
  const [pendingPreview, setPendingPreview] = useState<{ id: string; name: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePreview = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const preview = await getGroupPreview(inviteCode.trim())
      setPendingPreview(preview)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not look up that invite code.')
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmJoin = async () => {
    setError(null)
    setSaving(true)
    try {
      await joinGroupByInviteCode(inviteCode.trim())
      setPendingPreview(null)
      setInviteCode('')
      onJoined()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not join that group.')
    } finally {
      setSaving(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const group = await createGroup(userId, groupName.trim())
      setGroupName('')
      onCreated(group)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create that group.')
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
        <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Join or Create a Group
        </h2>
        <span className="text-xs text-slate-500">{expanded ? 'Collapse' : 'Expand'}</span>
      </button>

      {expanded && (
        <div className="flex flex-col gap-4 px-5 pb-5">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTab('join')}
              className={`flex-1 py-2 text-sm ${tab === 'join' ? primaryButtonClass : secondaryButtonClass}`}
            >
              Join
            </button>
            <button
              type="button"
              onClick={() => setTab('create')}
              className={`flex-1 py-2 text-sm ${tab === 'create' ? primaryButtonClass : secondaryButtonClass}`}
            >
              Create
            </button>
          </div>

          {tab === 'join' &&
            (pendingPreview ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-slate-300">
                  Join <span className="font-semibold text-slate-100">{pendingPreview.name}</span>?
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleConfirmJoin}
                    className={`flex-1 py-2 text-sm ${primaryButtonClass}`}
                  >
                    {saving ? 'Joining…' : 'Confirm'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingPreview(null)}
                    className={`flex-1 py-2 text-sm ${secondaryButtonClass}`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePreview} className="flex flex-col gap-3">
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Invite code
                  </span>
                  <input
                    type="text"
                    required
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className={`text-sm ${inputClass}`}
                  />
                </label>
                <button type="submit" disabled={saving} className={`py-2 text-sm ${primaryButtonClass}`}>
                  {saving ? 'Looking up…' : 'Look up group'}
                </button>
              </form>
            ))}

          {tab === 'create' && (
            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Group name
                </span>
                <input
                  type="text"
                  required
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className={`text-sm ${inputClass}`}
                />
              </label>
              <button type="submit" disabled={saving} className={`py-2 text-sm ${primaryButtonClass}`}>
                {saving ? 'Creating…' : 'Create group'}
              </button>
            </form>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      )}
    </div>
  )
}
