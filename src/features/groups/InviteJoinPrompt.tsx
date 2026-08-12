import { useEffect, useState } from 'react'
import { cardClass, primaryButtonClass, secondaryButtonClass } from '../../shared/styles'
import { getGroupPreview, joinGroupByInviteCode } from './api'

interface InviteJoinPromptProps {
  inviteCode: string
  onJoined: () => void
  onDismiss: () => void
}

export function InviteJoinPrompt({ inviteCode, onJoined, onDismiss }: InviteJoinPromptProps) {
  const [preview, setPreview] = useState<{ id: string; name: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getGroupPreview(inviteCode)
      .then((result) => {
        if (!cancelled) setPreview(result)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not look up that invite code.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [inviteCode])

  const handleConfirm = async () => {
    setJoining(true)
    setError(null)
    try {
      await joinGroupByInviteCode(inviteCode)
      onJoined()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not join that group.')
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className={`flex flex-col gap-3 p-5 ${cardClass}`}>
      <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">Invite link</h2>

      {loading && <p className="text-sm text-slate-500">Looking up group…</p>}

      {!loading && preview && (
        <>
          <p className="text-sm text-slate-300">
            Join <span className="font-semibold text-slate-100">{preview.name}</span>?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={joining}
              onClick={handleConfirm}
              className={`flex-1 py-2 text-sm ${primaryButtonClass}`}
            >
              {joining ? 'Joining…' : 'Confirm'}
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className={`flex-1 py-2 text-sm ${secondaryButtonClass}`}
            >
              Cancel
            </button>
          </div>
        </>
      )}

      {!loading && error && (
        <>
          <p className="text-sm text-red-400">{error}</p>
          <button
            type="button"
            onClick={onDismiss}
            className={`self-start px-2.5 py-1 text-xs ${secondaryButtonClass}`}
          >
            Dismiss
          </button>
        </>
      )}
    </div>
  )
}
