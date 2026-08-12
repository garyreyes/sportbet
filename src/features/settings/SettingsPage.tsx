import { useAuth } from '../auth/useAuth'

export function SettingsPage() {
  const { signOut } = useAuth()

  return (
    <div className="p-4">
      <p>Settings — coming soon.</p>
      <button
        type="button"
        onClick={signOut}
        className="mt-4 rounded-md bg-slate-800 px-4 py-2 text-sm"
      >
        Sign out
      </button>
    </div>
  )
}
