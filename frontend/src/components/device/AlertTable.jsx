import { useMemo, useState } from 'react'

import StatusBadge from '../ui/StatusBadge.jsx'
import { formatPercent, formatRelative, formatTimestamp } from '../../utils/formatters.js'

const PAGE_SIZE = 20
const FILTERS = ['all', 'active', 'resolved']

export default function AlertTable({ alerts = [] }) {
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    return alerts.filter((alert) => {
      if (filter === 'active') return !alert.is_read
      if (filter === 'resolved') return Boolean(alert.is_read)
      return true
    })
  }, [alerts, filter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visible = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <section className="rounded-lg border border-bg-border bg-bg-surface">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-bg-border px-4 py-3">
        <h3 className="font-mono text-sm font-semibold text-text-primary">Alert history</h3>
        <div role="group" aria-label="Filtra alert" className="inline-flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                setFilter(f)
                setPage(0)
              }}
              aria-pressed={filter === f}
              className={`rounded-md px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide ${
                filter === f
                  ? 'bg-accent/20 text-accent ring-1 ring-accent/40'
                  : 'bg-bg-elevated text-text-secondary ring-1 ring-bg-border hover:text-text-primary'
              }`}
            >
              {f === 'all' ? 'Tutti' : f === 'active' ? 'Attivi' : 'Risolti'}
            </button>
          ))}
        </div>
      </header>

      <div role="table" className="text-sm">
        <div
          role="row"
          className="grid grid-cols-[1fr_0.8fr_0.6fr_0.6fr_1fr_0.7fr] border-b border-bg-border bg-bg-elevated px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-text-muted"
        >
          <div role="columnheader">Severity</div>
          <div role="columnheader">Metrica</div>
          <div role="columnheader">Valore</div>
          <div role="columnheader">Soglia</div>
          <div role="columnheader">Quando</div>
          <div role="columnheader">Stato</div>
        </div>

        {visible.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-text-secondary">
            Nessun alert da mostrare.
          </div>
        ) : (
          visible.map((alert) => (
            <div
              role="row"
              key={alert.id}
              className={`grid grid-cols-[1fr_0.8fr_0.6fr_0.6fr_1fr_0.7fr] items-center border-b border-bg-border/40 px-4 py-2 font-mono text-xs ${
                alert.is_read ? 'opacity-60' : ''
              }`}
            >
              <div role="cell">
                <StatusBadge status={alert.severity === 'critical' ? 'critical' : 'warning'} size="sm" />
              </div>
              <div role="cell" className="text-text-primary uppercase">
                {alert.metric || '—'}
              </div>
              <div role="cell" className="text-text-secondary">
                {formatPercent(alert.value, 1)}
              </div>
              <div role="cell" className="text-text-muted">
                {formatPercent(alert.threshold, 0)}
              </div>
              <div role="cell" className="text-text-secondary" title={formatTimestamp(alert.timestamp, { full: true, seconds: true })}>
                {formatRelative(alert.timestamp)}
              </div>
              <div role="cell" className={alert.is_read ? 'text-text-muted' : 'text-status-info'}>
                {alert.is_read ? 'Risolto' : 'Attivo'}
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between border-t border-bg-border px-4 py-2 font-mono text-[11px] text-text-secondary">
          <span>
            Pagina {page + 1} / {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-md border border-bg-border px-2 py-1 hover:bg-bg-elevated disabled:opacity-40"
            >
              Precedente
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-md border border-bg-border px-2 py-1 hover:bg-bg-elevated disabled:opacity-40"
            >
              Successiva
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
