import { useMemo, useState } from 'react'

import { Badge } from '../components/ui/Badge.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { useStore } from '../store/useDashboardStore.js'

function relativeTime(timestamp) {
  const delta = Math.max(0, Date.now() - new Date(timestamp).getTime())
  const minutes = Math.floor(delta / 60000)
  if (minutes < 1) return 'adesso'
  if (minutes < 60) return `${minutes} minuti fa`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ore fa`
  const days = Math.floor(hours / 24)
  return `${days} giorni fa`
}

export default function AlertsPage() {
  const alerts = useStore((s) => s.alerts)
  const nodes = useStore((s) => s.nodes)
  const acknowledgeAlert = useStore((s) => s.acknowledgeAlert)
  const snoozeAlert = useStore((s) => s.snoozeAlert)
  const markAllRead = useStore((s) => s.markAllRead)
  const ui = useStore((s) => s.ui)
  const setFilters = useStore((s) => s.setFilters)

  const [page, setPage] = useState(0)
  const pageSize = 8

  const nodeById = useMemo(() => {
    const map = new Map()
    nodes.forEach((n) => map.set(n.id, n.name))
    return map
  }, [nodes])

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      if (ui.activeFilters.server !== 'all' && alert.node_id !== ui.activeFilters.server) return false
      if (ui.activeFilters.severity !== 'all' && alert.severity !== ui.activeFilters.severity) return false
      if (ui.activeFilters.metric !== 'all' && alert.metric !== ui.activeFilters.metric) return false
      return true
    })
  }, [alerts, ui.activeFilters])
  const pagedAlerts = filteredAlerts.slice(page * pageSize, (page + 1) * pageSize)
  const metrics = [...new Set(alerts.map((a) => a.metric).filter(Boolean))]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-100">Alert Center</h2>
        <button
          type="button"
          onClick={() => void markAllRead()}
          className="rounded bg-slate-700 px-3 py-2 text-sm text-slate-100 hover:bg-slate-600"
        >
          Segna tutti come letti
        </button>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <select
          value={ui.activeFilters.server}
          onChange={(e) => setFilters({ ...ui.activeFilters, server: e.target.value })}
          className="rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm"
        >
          <option value="all">Tutti i server</option>
          {nodes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name}
            </option>
          ))}
        </select>
        <select
          value={ui.activeFilters.severity}
          onChange={(e) => setFilters({ ...ui.activeFilters, severity: e.target.value })}
          className="rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm"
        >
          <option value="all">Tutte le severity</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
        <select
          value={ui.activeFilters.metric}
          onChange={(e) => setFilters({ ...ui.activeFilters, metric: e.target.value })}
          className="rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm"
        >
          <option value="all">Tutte le metriche</option>
          {metrics.map((metric) => (
            <option key={metric} value={metric}>
              {metric}
            </option>
          ))}
        </select>
      </div>

      {filteredAlerts.length === 0 ? (
        <EmptyState title="Nessun alert da mostrare" message="Modifica i filtri oppure attendi nuovi eventi." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-slate-300">
              <tr>
                <th className="px-3 py-2">Server</th>
                <th className="px-3 py-2">Metrica</th>
                <th className="px-3 py-2">Valore</th>
                <th className="px-3 py-2">Soglia</th>
                <th className="px-3 py-2">Severity</th>
                <th className="px-3 py-2">Timestamp</th>
                <th className="px-3 py-2">Azioni</th>
              </tr>
            </thead>
            <tbody>
          {pagedAlerts.map((alert) => {
            const nodeName = nodeById.get(alert.node_id) || alert.node_id
            return (
              <tr
                key={alert.id}
                className="border-t border-slate-800 bg-slate-900/40"
              >
                <td className="px-3 py-2">{nodeName}</td>
                <td className="px-3 py-2">{String(alert.metric || '').toUpperCase()}</td>
                <td className="px-3 py-2">{alert.value ?? '-'}</td>
                <td className="px-3 py-2">{alert.threshold ?? '-'}</td>
                <td className="px-3 py-2"><Badge status={alert.severity === 'critical' ? 'critical' : 'warning'}>{alert.severity}</Badge></td>
                <td className="px-3 py-2">{relativeTime(alert.timestamp)}</td>
                <td className="px-3 py-2 space-x-1">
                  <button type="button" className="rounded bg-sky-700 px-2 py-1 text-xs" onClick={() => void acknowledgeAlert(alert.id)}>Ack</button>
                  <button type="button" className="rounded bg-slate-700 px-2 py-1 text-xs" onClick={() => void snoozeAlert(alert.id)}>Snooze</button>
                </td>
              </tr>
            )
          })}
            </tbody>
          </table>
          <div className="flex items-center justify-end gap-2 border-t border-slate-800 p-2">
            <button type="button" onClick={() => setPage((p) => Math.max(0, p - 1))} className="rounded bg-slate-800 px-2 py-1 text-xs">Prev</button>
            <span className="text-xs text-slate-400">Page {page + 1}</span>
            <button type="button" onClick={() => setPage((p) => ((p + 1) * pageSize < filteredAlerts.length ? p + 1 : p))} className="rounded bg-slate-800 px-2 py-1 text-xs">Next</button>
          </div>
        </div>
      )}
    </div>
  )
}

