import { Navigate, Route, Routes, useSearchParams } from 'react-router-dom'
import { AnalyticsPage } from '../features/analytics/AnalyticsPage'
import { AuthScreen } from '../features/auth/AuthScreen'
import { useAuth } from '../features/auth/useAuth'
import { CalendarPage } from '../features/calendar/CalendarPage'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { GroupsPage } from '../features/groups/GroupsPage'
import { LogPage } from '../features/log-bet/LogPage'
import { SettingsPage } from '../features/settings/SettingsPage'
import { AppLayout } from './AppLayout'

function RootRedirect() {
  const [searchParams] = useSearchParams()
  const inviteCode = searchParams.get('invite')
  return (
    <Navigate
      to={inviteCode ? `/groups?invite=${inviteCode}` : '/dashboard'}
      replace
    />
  )
}

export function AppRoutes() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        Loading…
      </main>
    )
  }

  if (!session) {
    return <AuthScreen />
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/log" element={<LogPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route index element={<RootRedirect />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
