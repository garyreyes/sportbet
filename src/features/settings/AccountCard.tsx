import { useRef, useState } from 'react'
import { cardClass, focusRingOnSurface, inputClass, secondaryButtonClass } from '../../shared/styles'
import { useAuth } from '../auth/useAuth'
import { updateDisplayName, uploadAvatar, useMyProfile } from './api'

export function AccountCard({ userId }: { userId: string }) {
  const { signOut, session } = useAuth()
  const { profile, setProfile, loading } = useMyProfile(userId)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [nameDraft, setNameDraft] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (loading || !profile) {
    return <p className={`p-5 text-sm text-slate-500 ${cardClass}`}>Loading account…</p>
  }

  const handleAvatarClick = () => fileInputRef.current?.click()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setUploading(true)
    setError(null)
    try {
      const avatarUrl = await uploadAvatar(userId, file)
      setProfile((prev) => (prev ? { ...prev, avatar_url: avatarUrl } : prev))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload that image.')
    } finally {
      setUploading(false)
    }
  }

  const handleNameBlur = async () => {
    const trimmed = nameDraft.trim()
    if (!trimmed || trimmed === profile.full_name) return
    setError(null)
    try {
      await updateDisplayName(userId, trimmed)
      setProfile((prev) => (prev ? { ...prev, full_name: trimmed } : prev))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your display name.')
    }
  }

  return (
    <div className={`flex flex-col gap-4 p-5 ${cardClass}`}>
      <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">Account</h2>

      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 overflow-hidden rounded-full bg-slate-800">
            {profile.avatar_url && (
              <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <button
            type="button"
            onClick={handleAvatarClick}
            disabled={uploading}
            aria-label="Change avatar"
            className={`absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm shadow-emerald-950/40 transition-colors hover:bg-emerald-500 disabled:opacity-50 ${focusRingOnSurface}`}
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path
                d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => void handleFileChange(e)}
            className="hidden"
          />
        </div>

        <label className="flex flex-1 flex-col gap-1.5 text-sm">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Display name
          </span>
          <input
            type="text"
            defaultValue={profile.full_name ?? ''}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={() => void handleNameBlur()}
            className={`text-sm ${inputClass}`}
          />
        </label>
      </div>

      {session?.user.email && <p className="text-xs text-slate-500">{session.user.email}</p>}

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        type="button"
        onClick={signOut}
        className={`self-start px-3 py-1.5 text-xs ${secondaryButtonClass}`}
      >
        Sign out
      </button>
    </div>
  )
}
