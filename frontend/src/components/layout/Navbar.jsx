import { Menu } from 'lucide-react'

import { useMonitorStore } from '../../store/useMonitorStore.js'
import { useFleetData } from '../../hooks/useFleetData.js'
import { useFleetMetrics } from '../../hooks/useFleetMetrics.js'
import { statusFromNode } from '../../utils/thresholds.js'

export default function Navbar({ onToggleSidebar }) {
  const wsConnected = useMonitorStore((s) => s.wsConnected)
  const { data: nodes = [] } = useFleetData()
  const metricsMap = useFleetMetrics(nodes)

  const criticalCount = nodes.reduce((acc, n) => {
    const status = statusFromNode(n, metricsMap.get(n.id))
    return status === 'critical' || status === 'down' ? acc + 1 : acc
  }, 0)

  const warningCount = nodes.reduce((acc, n) => {
    const status = statusFromNode(n, metricsMap.get(n.id))
    return status === 'warning' ? acc + 1 : acc
  }, 0)

  return (
    <header className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-bg-border bg-bg-surface px-4">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Apri menu"
        className="rounded-[4px] p-2 text-text-secondary hover:bg-bg-elevated hover:text-text-primary md:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>

      <div className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-[4px] border border-accent text-accent">
          <span className="font-sans text-xs font-semibold leading-none">M</span>
        </div>
        <span className="font-sans text-sm font-semibold text-text-primary">
          MISAT Monitor
        </span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {criticalCount > 0 ? (
          <span
            aria-live="polite"
            className="inline-flex items-center rounded-[4px] border border-status-critical/35 bg-status-critical/10 px-2.5 py-1 font-sans text-xs font-semibold text-status-critical"
          >
            {criticalCount} critical
          </span>
        ) : null}

        {warningCount > 0 ? (
          <span
            aria-live="polite"
            className="inline-flex items-center rounded-[4px] border border-status-warning/35 bg-status-warning/10 px-2.5 py-1 font-sans text-xs font-semibold text-status-warning"
          >
            {warningCount} warning
          </span>
        ) : null}

        <span
          aria-live="polite"
          className={`inline-flex items-center gap-2 rounded-[4px] border px-2.5 py-1 font-sans text-xs ${
            wsConnected
              ? 'border-status-ok/35 bg-status-ok/10 text-status-ok'
              : 'border-bg-border bg-bg-surface text-text-secondary'
          }`}
        >
          <span
            aria-hidden="true"
            className={`size-1.5 rounded-full ${wsConnected ? 'bg-status-ok animate-pulse' : 'bg-bg-border'}`}
          />
          {wsConnected ? 'WS Online' : 'WS Offline'}
        </span>
      </div>
    </header>
  )
}
