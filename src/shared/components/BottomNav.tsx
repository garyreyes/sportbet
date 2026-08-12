import { NavLink } from 'react-router-dom'

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
    <nav className="fixed inset-x-0 bottom-0 grid grid-cols-6 border-t border-slate-800 bg-slate-950">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-2 text-xs ${
              isActive ? 'font-bold text-emerald-400' : 'text-slate-400'
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
