import { ChevronDown, Menu, Share2, Wifi, WifiOff } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { useMonitorStore } from '../../store/useMonitorStore.js'

const PAGE_LABELS = {
  '/': 'Fleet Overview',
  '/hosts': 'Hosts',
  '/alerts': 'Alerts',
  '/inventory': 'Inventory',
  '/metrics': 'Metrics',
  '/trends': 'Trends',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/integrations': 'Integrations',
}

export default function Navbar({ onToggleSidebar }) {
  const location = useLocation()
  const wsConnected = useMonitorStore((s) => s.wsConnected)
  const selectedRange = useMonitorStore((s) => s.selectedRange)
  const setSelectedRange = useMonitorStore((s) => s.setSelectedRange)
  const [autoRefresh, setAutoRefresh] = useState('30s')

  const pageLabel = useMemo(() => {
    if (location.pathname.startsWith('/devices/')) return 'Host Detail'
    return PAGE_LABELS[location.pathname] || 'Fleet Overview'
  }, [location.pathname])

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

      <div className="inline-flex items-center gap-2 rounded-md border border-bg-border bg-bg-elevated px-3 py-1.5">
        <span className="font-mono text-xs text-text-muted">Monitoring</span>
        <ChevronDown className="size-3.5 text-text-muted" />
        <span className="font-mono text-sm font-semibold text-text-primary">{pageLabel}</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <label className="inline-flex items-center gap-2 rounded-md border border-bg-border bg-bg-elevated px-2 py-1.5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">Range</span>
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
            className="bg-transparent font-mono text-xs text-text-primary focus-visible:outline-none"
          >
            <option className="bg-bg-surface" value="5m">Last 5 minutes</option>
            <option className="bg-bg-surface" value="15m">Last 15 minutes</option>
            <option className="bg-bg-surface" value="1h">Last 1 hour</option>
            <option className="bg-bg-surface" value="24h">Last 24 hours</option>
          </select>
        </label>
        <label className="inline-flex items-center gap-2 rounded-md border border-bg-border bg-bg-elevated px-2 py-1.5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">Auto</span>
          <select
            value={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.value)}
            className="bg-transparent font-mono text-xs text-text-primary focus-visible:outline-none"
          >
            <option className="bg-bg-surface" value="10s">10s</option>
            <option className="bg-bg-surface" value="30s">30s</option>
            <option className="bg-bg-surface" value="60s">60s</option>
          </select>
        </label>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md border border-bg-border bg-bg-elevated px-2.5 py-1.5 font-mono text-xs text-text-secondary hover:text-text-primary"
        >
          <Share2 className="size-3.5" />
          Share
        </button>

        <span
          aria-live="polite"
          className={`fixed right-3 top-3 inline-flex items-center gap-1 rounded-full px-2 py-1 font-mono text-[10px] ${
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
          {wsConnected ? 'WS' : 'OFF'}
        </span>
      </div>
    </header>
  )
}
