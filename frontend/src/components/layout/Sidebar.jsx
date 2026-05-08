import {
  Bell,
  ChartColumnBig,
  ChartNoAxesCombined,
  FileText,
  Gauge,
  LayoutDashboard,
  Map,
  Package,
  Settings,
  SlidersHorizontal,
  Shield,
  Unplug,
  Users,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { useUnreadAlertCount } from '../../hooks/useAlerts.js'

const NAV_SECTIONS = [
  {
    title: 'Overview',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/alerts', label: 'Alerts', icon: Bell },
      { to: '/config', label: 'Config', icon: Settings },
    ],
  },
  {
    title: 'Monitoring',
    items: [
      { to: '/services', label: 'Services', icon: Gauge },
      { to: '/maps', label: 'Maps', icon: Map },
      { to: '/dashboards', label: 'Dashboards', icon: Package },
      { to: '/metrics', label: 'Metrics', icon: ChartColumnBig },
      { to: '/trends', label: 'Trends', icon: ChartNoAxesCombined },
      { to: '/reports', label: 'Reports', icon: FileText },
    ],
  },
  {
    title: 'Administration',
    items: [
      { to: '/users', label: 'Users', icon: Users },
      { to: '/roles', label: 'Roles', icon: Shield },
      { to: '/settings', label: 'Settings', icon: SlidersHorizontal },
      { to: '/integrations', label: 'Integrations', icon: Unplug },
    ],
  },
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
        <nav className="flex flex-col gap-4 px-3 py-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-1">
              <p className="px-3 pb-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                {section.title}
              </p>
              {section.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-[4px] border-l-3 px-3 py-2 font-sans text-sm transition-colors ${
                      isActive
                        ? 'border-accent bg-accent-dim text-text-primary'
                        : 'border-transparent text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                    }`
                  }
                >
                  <Icon className="size-4" aria-hidden="true" />
                  <span className="flex-1">{label}</span>
                  {to === '/alerts' && unread > 0 ? (
                    <span className="rounded-[4px] border border-status-critical/35 bg-status-critical/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-status-critical">
                      {unread}
                    </span>
                  ) : null}
                </NavLink>
              ))}
            </div>
          ))}
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
