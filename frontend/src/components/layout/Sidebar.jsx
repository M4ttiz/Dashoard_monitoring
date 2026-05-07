import {
  AlertTriangle,
  BarChart3,
  Boxes,
  ChevronLeft,
  ChevronRight,
  FileBarChart2,
  Gauge,
  LayoutDashboard,
  Map,
  Package,
  Plug,
  Server,
  Settings,
  Shield,
  Users,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const NAV_SECTIONS = [
  {
    id: 'monitoring',
    label: 'Monitoring',
    items: [
      { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
      { to: '/hosts', label: 'Hosts', icon: Server },
      { to: '/alerts', label: 'Alerts', icon: AlertTriangle },
      { to: '/inventory', label: 'Inventory', icon: Boxes },
      { label: 'Services', icon: Gauge, disabled: true },
      { label: 'Maps', icon: Map, disabled: true },
      { label: 'Dashboards', icon: Package, disabled: true },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    items: [
      { to: '/metrics', label: 'Metrics', icon: BarChart3 },
      { to: '/trends', label: 'Trends', icon: FileBarChart2 },
      { to: '/reports', label: 'Reports', icon: FileBarChart2 },
    ],
  },
  {
    id: 'administration',
    label: 'Administration',
    items: [
      { to: '/settings', label: 'Settings', icon: Settings },
      { to: '/integrations', label: 'Integrations', icon: Plug },
      { label: 'Users', icon: Users, disabled: true },
      { label: 'Roles', icon: Shield, disabled: true },
    ],
  },
]

export default function Sidebar({ open, onClose, collapsed, onToggleCollapse }) {
  return (
    <>
      {open ? (
        <button
          type="button"
          onClick={onClose}
          aria-label="Chiudi menu"
          className="fixed inset-0 z-40 bg-bg-base/70 backdrop-blur-sm md:hidden"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex shrink-0 flex-col border-r border-bg-border bg-bg-surface transition-all duration-200 md:sticky md:top-14 md:h-[calc(100vh-3.5rem)] md:translate-x-0 ${
          collapsed ? 'w-[76px]' : 'w-64'
        } ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.id} className="space-y-1">
              {!collapsed ? (
                <p className="px-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  {section.label}
                </p>
              ) : null}
              {section.items.map(({ to, label, icon: Icon, end, disabled }) => {
                const commonClasses =
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition'
                if (disabled) {
                  return (
                    <span
                      key={`${section.id}-${label}`}
                      aria-disabled="true"
                      className={`${commonClasses} cursor-not-allowed text-text-muted/60`}
                      title={`${label} (coming soon)`}
                    >
                      <Icon className="size-4 shrink-0" aria-hidden="true" />
                      {!collapsed ? <span className="flex-1">{label}</span> : null}
                    </span>
                  )
                }
                return (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={onClose}
                    title={collapsed ? label : undefined}
                    className={({ isActive }) =>
                      `${commonClasses} ${
                        isActive
                          ? 'bg-accent/15 text-accent ring-1 ring-accent/30'
                          : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                      }`
                    }
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    {!collapsed ? <span className="flex-1">{label}</span> : null}
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="mt-auto border-t border-bg-border px-3 py-3">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-bg-border bg-bg-elevated px-2 py-2 font-mono text-[11px] uppercase tracking-wide text-text-secondary hover:text-text-primary"
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            {!collapsed ? <span>Collapse</span> : null}
          </button>
        </div>
      </aside>
    </>
  )
}
