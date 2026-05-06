import { useMemo, useState } from 'react'

import { useStore } from '../store/useStore.js'

const FILTERS = ['all', 'unread', 'warning', 'critical']

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
  const markAlertRead = useStore((s) => s.markAlertRead)
  const markAllRead = useStore((s) => s.markAllRead)

  const [activeFilter, setActiveFilter] = useState('all')

  const nodeById = useMemo(() => {
    const map = new Map()
    nodes.forEach((n) => map.set(n.id, n.name))
    return map
  }, [nodes])

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      if (activeFilter === 'unread') return !alert.is_read
      if (activeFilter === 'warning') return alert.severity === 'warning'
      if (activeFilter === 'critical') return alert.severity === 'critical'
      return true
    })
  }, [activeFilter, alerts])

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

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`rounded px-3 py-1.5 text-sm ${
              activeFilter === filter ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {filter === 'all'
              ? 'Tutti'
              : filter === 'unread'
                ? 'Non letti'
                : filter === 'warning'
                  ? 'Warning'
                  : 'Critical'}
          </button>
        ))}
      </div>

      {filteredAlerts.length === 0 ? (
        <div className="rounded-lg border border-emerald-700/40 bg-emerald-950/20 p-8 text-center">
          <p className="text-3xl">✅</p>
          <p className="mt-2 text-sm text-emerald-300">Nessun alert da mostrare.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAlerts.map((alert) => {
            const nodeName = nodeById.get(alert.node_id) || alert.node_id
            const severityClass = alert.severity === 'critical' ? 'text-red-400' : 'text-yellow-300'
            return (
              <button
                key={alert.id}
                type="button"
                onClick={() => !alert.is_read && void markAlertRead(alert.id)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-left hover:bg-slate-700/70"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className={`text-xs font-semibold ${severityClass}`}>{String(alert.severity).toUpperCase()}</p>
                    <p className="text-sm text-slate-100">
                      {nodeName} — {String(alert.metric || '').toUpperCase()}
                    </p>
                    <p className="text-sm text-slate-300">{alert.message}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!alert.is_read ? <span className="inline-block size-2 rounded-full bg-sky-400" /> : null}
                    <span className="text-xs text-slate-400">{relativeTime(alert.timestamp)}</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

