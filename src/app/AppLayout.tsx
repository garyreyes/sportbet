import { Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'
import { BetsProvider } from '../shared/bets/BetsContext'
import { BottomNav } from '../shared/components/BottomNav'

export function AppLayout() {
  const { session } = useAuth()
  const userId = session?.user.id

  if (!userId) return null

  return (
    <BetsProvider userId={userId}>
      <div className="min-h-screen bg-slate-950 pb-16 text-slate-100">
        <Outlet />
        <BottomNav />
      </div>
    </BetsProvider>
  )
}
