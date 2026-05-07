import { Bell, Menu, Wifi, WifiOff } from 'lucide-react'

import { useUnreadAlertCount } from '../../hooks/useAlerts.js'
import { useMonitorStore } from '../../store/useMonitorStore.js'
import { useFleetData } from '../../hooks/useFleetData.js'
import { useFleetMetrics } from '../../hooks/useFleetMetrics.js'
import { statusFromNode } from '../../utils/thresholds.js'

export default function Navbar({ onToggleSidebar }) {
  const wsConnected = useMonitorStore((s) => s.wsConnected)
  const unread = useUnreadAlertCount()
  const { data: nodes = [] } = useFleetData()
  const metricsMap = useFleetMetrics(nodes)

  const criticalCount = nodes.reduce((acc, n) => {
    const status = statusFromNode(n, metricsMap.get(n.id))
    return status === 'critical' ? acc + 1 : acc
  }, 0)

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-bg-border bg-bg-surface/80 px-4 backdrop-blur-xl">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Apri menu"
        className="rounded-md p-2 text-text-secondary hover:bg-bg-elevated hover:text-text-primary md:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>

      <div className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-md bg-accent/15 text-accent ring-1 ring-accent/40 shadow-[0_0_0_1px_rgba(56,139,253,0.1),0_0_22px_-8px_rgba(56,139,253,0.7)]">
          <span className="font-mono text-xs font-bold">M</span>
        </div>
        <span className="font-mono text-sm font-semibold tracking-wide text-gradient-accent">
          MISAT Monitor
        </span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {criticalCount > 0 ? (
          <span
            aria-live="polite"
            className="hidden items-center gap-1.5 rounded-md bg-status-critical/15 px-2.5 py-1 font-mono text-xs font-semibold text-status-critical ring-1 ring-status-critical/30 sm:inline-flex"
          >
            <Bell className="size-3.5" aria-hidden="true" />
            {criticalCount} critical
          </span>
        ) : null}

        {unread > 0 ? (
          <span
            aria-live="polite"
            className="inline-flex items-center gap-1.5 rounded-md bg-status-warning/15 px-2.5 py-1 font-mono text-xs font-semibold text-status-warning ring-1 ring-status-warning/30"
          >
            {unread} alert non letti
          </span>
        ) : null}

        <span
          aria-live="polite"
          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-xs ${
            wsConnected
              ? 'bg-status-ok/15 text-status-ok ring-1 ring-status-ok/30'
              : 'bg-status-unknown/15 text-text-secondary ring-1 ring-bg-border'
          }`}
        >
          {wsConnected ? (
            <Wifi className="size-3.5" aria-hidden="true" />
          ) : (
            <WifiOff className="size-3.5" aria-hidden="true" />
          )}
          {wsConnected ? 'WS Connected' : 'WS Offline'}
        </span>
      </div>
    </header>
  )
}
