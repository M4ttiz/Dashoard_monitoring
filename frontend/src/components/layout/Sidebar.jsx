import { Bell, LayoutDashboard, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { useUnreadAlertCount } from '../../hooks/useAlerts.js'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/config', label: 'Config', icon: Settings },
]

export default function Sidebar({ open, onClose }) {
  const unread = useUnreadAlertCount()

  return (
    <>
      {open ? (
        <button
          type="button"
          onClick={onClose}
          aria-label="Chiudi menu"
          className="fixed inset-0 z-40 bg-bg-base/70 md:hidden"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-56 shrink-0 flex-col border-r border-bg-border bg-bg-surface transition-transform duration-200 md:sticky md:top-10 md:h-[calc(100vh-2.5rem)] md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <nav className="flex flex-col gap-1 px-3 py-4">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => {
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-none border-l-3 px-3 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
                    isActive
                      ? 'border-accent bg-accent-dim text-text-primary'
                      : 'border-transparent text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                  }`
                }
              >
                <Icon className="size-4" aria-hidden="true" />
                <span className="flex-1">{label}</span>
                {to === '/alerts' && unread > 0 ? (
                  <span className="rounded-[2px] border border-status-critical/35 bg-status-critical/8 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-status-critical">
                    {unread}
                  </span>
                ) : null}
              </NavLink>
            )
          })}
        </nav>

        <div className="mt-auto border-t border-bg-border px-4 pb-4 pt-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
            v2.0 — checkmk-like
          </p>
        </div>
      </aside>
    </>
  )
}
