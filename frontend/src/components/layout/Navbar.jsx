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
    <header className="sticky top-0 z-30 flex h-10 items-center gap-3 border-b border-bg-border bg-bg-surface px-4">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Apri menu"
        className="rounded-none p-2 text-text-secondary hover:bg-bg-elevated hover:text-text-primary md:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>

      <div className="flex items-center gap-2">
        <div className="flex size-6 items-center justify-center rounded-none border border-accent text-accent">
          <span className="font-display text-xs font-black leading-none">M</span>
        </div>
        <span className="font-display text-sm font-bold uppercase tracking-[0.12em] text-text-primary">
          MISAT Monitor
        </span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted sm:inline">
          ███ FLEET STATUS ███
        </span>

        {criticalCount > 0 ? (
          <span
            aria-live="polite"
            className="inline-flex items-center rounded-[2px] border border-status-critical/35 bg-status-critical/8 px-3 py-1 font-mono text-xs font-semibold text-status-critical"
          >
            [● {criticalCount} CRITICAL]
          </span>
        ) : null}

        {warningCount > 0 ? (
          <span
            aria-live="polite"
            className="inline-flex items-center rounded-[2px] border border-status-warning/35 bg-status-warning/8 px-3 py-1 font-mono text-xs font-semibold text-status-warning"
          >
            [⚡ {warningCount} WARN]
          </span>
        ) : null}

        <span
          aria-live="polite"
          className={`inline-flex items-center gap-2 rounded-[2px] border px-2.5 py-1 font-mono text-xs ${
            wsConnected
              ? 'border-status-ok/35 bg-status-ok/8 text-status-ok'
              : 'border-bg-border bg-bg-surface text-text-secondary'
          }`}
        >
          <span
            aria-hidden="true"
            className={`size-1.5 rounded-[2px] ${wsConnected ? 'bg-status-ok animate-pulse' : 'bg-bg-border'}`}
          />
          {wsConnected ? '[◈ LIVE]' : '[◇ OFFLINE]'}
        </span>
      </div>
    </header>
  )
}
