import { NavLink } from 'react-router-dom'
import { focusRingOnSurface } from '../styles'

const TABS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/log', label: 'Log' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/groups', label: 'Groups' },
  { to: '/settings', label: 'Settings' },
]

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 grid grid-cols-6 border-t border-slate-800 bg-slate-900/95 shadow-[0_-8px_24px_rgba(0,0,0,0.35)] backdrop-blur">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-3 text-xs transition-colors ${focusRingOnSurface} ${
              isActive ? 'font-semibold text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
