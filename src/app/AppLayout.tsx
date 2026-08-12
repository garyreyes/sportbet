import { Outlet } from 'react-router-dom'
import { BottomNav } from '../shared/components/BottomNav'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-950 pb-16 text-slate-100">
      <Outlet />
      <BottomNav />
    </div>
  )
}
