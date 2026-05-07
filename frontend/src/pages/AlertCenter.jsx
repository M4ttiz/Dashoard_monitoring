import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import StatusBadge from '../components/ui/StatusBadge.jsx'
import { formatRelative, formatTimestamp } from '../utils/formatters.js'
import {
  useAlerts,
  useMarkAlertRead,
  useMarkAllAlertsRead,
} from '../hooks/useAlerts.js'
import { useFleetData } from '../hooks/useFleetData.js'

const FILTERS = [
  { id: 'all', label: 'Tutti' },
  { id: 'unread', label: 'Non letti' },
  { id: 'critical', label: 'Critical' },
  { id: 'warning', label: 'Warning' },
]

export default function AlertCenter() {
  const { data: alerts = [], isLoading } = useAlerts()
  const { data: nodes = [] } = useFleetData()
  const markRead = useMarkAlertRead()
  const markAll = useMarkAllAlertsRead()

  const [filter, setFilter] = useState('all')

  const nodeById = useMemo(() => {
    const m = new Map()
    nodes.forEach((n) => m.set(n.id, n))
    return m
  }, [nodes])

  const filtered = useMemo(() => {
    return alerts.filter((alert) => {
      if (filter === 'unread') return !alert.is_read
      if (filter === 'critical') return alert.severity === 'critical'
      if (filter === 'warning') return alert.severity === 'warning'
      return true
    })
  }, [alerts, filter])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-mono text-xl font-semibold text-text-primary">Alert Center</h1>
          <p className="text-xs text-text-secondary">
            {alerts.length} alert totali · {alerts.filter((a) => !a.is_read).length} non letti
          </p>
        </div>
        <button
          type="button"
          onClick={() => markAll.mutate()}
          disabled={markAll.isPending || alerts.every((a) => a.is_read)}
          className="rounded-md border border-bg-border bg-bg-surface px-3 py-1.5 font-mono text-xs text-text-secondary hover:bg-bg-elevated hover:text-text-primary disabled:opacity-50"
        >
          Segna tutti come letti
        </button>
      </div>

      <div className="inline-flex gap-1 rounded-md border border-bg-border bg-bg-surface p-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={`rounded-md px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider transition ${
              filter === f.id
                ? 'bg-accent text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="font-mono text-xs text-text-secondary">Caricamento alert...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-status-ok/30 bg-status-ok/5 p-8 text-center">
          <p className="font-mono text-sm text-status-ok">Nessun alert da mostrare.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((alert) => {
            const node = nodeById.get(alert.node_id)
            const severity = alert.severity === 'critical' ? 'critical' : 'warning'
            const isRead = Boolean(alert.is_read)
            return (
              <li
                key={alert.id}
                className={`rounded-lg border bg-bg-surface p-3 transition ${
                  isRead ? 'border-bg-border opacity-60' : 'border-bg-border hover:border-accent/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <StatusBadge status={severity} size="sm" />
                      <span className="font-mono text-xs text-text-muted">
                        {String(alert.metric || '').toUpperCase()}
                      </span>
                      {!isRead ? (
                        <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
                      ) : null}
                    </div>
                    <p className="font-mono text-sm text-text-primary">
                      {node ? (
                        <Link to={`/devices/${node.id}`} className="hover:underline">
                          {node.name}
                        </Link>
                      ) : (
                        <span className="text-text-muted">Nodo sconosciuto</span>
                      )}{' '}
                      <span className="text-text-secondary">·</span>{' '}
                      <span className="text-text-secondary">{alert.message}</span>
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className="font-mono text-[11px] text-text-secondary"
                      title={formatTimestamp(alert.timestamp, { full: true, seconds: true })}
                    >
                      {formatRelative(alert.timestamp)}
                    </span>
                    {!isRead ? (
                      <button
                        type="button"
                        onClick={() => markRead.mutate(alert.id)}
                        disabled={markRead.isPending}
                        className="font-mono text-[11px] text-accent hover:underline disabled:opacity-50"
                      >
                        Marca come letto
                      </button>
                    ) : null}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
