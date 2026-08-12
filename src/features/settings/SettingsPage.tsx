import { useAuth } from '../auth/useAuth'
import { AccountCard } from './AccountCard'
import { PreferencesCard } from './PreferencesCard'

export function SettingsPage() {
  const { session } = useAuth()
  const userId = session?.user.id

  if (!userId) return null

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 pb-8 sm:p-6">
      <AccountCard userId={userId} />
      <PreferencesCard userId={userId} />
    </div>
  )
}
