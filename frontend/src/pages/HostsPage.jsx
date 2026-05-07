import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import FleetTable from '../components/fleet/FleetTable.jsx'
import { useAlerts } from '../hooks/useAlerts.js'
import { useFleetData } from '../hooks/useFleetData.js'
import { useFleetMetrics } from '../hooks/useFleetMetrics.js'
import { statusFromNode } from '../utils/thresholds.js'

const STATUS_FILTERS = ['all', 'ok', 'warning', 'critical', 'down']

export default function HostsPage() {
  const navigate = useNavigate()
  const { data: nodes = [], isLoading } = useFleetData()
  const { data: alerts = [] } = useAlerts()
  const metricsMap = useFleetMetrics(nodes)
  const [status, setStatus] = useState('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const rows = useMemo(
    () =>
      nodes.map((node) => {
        const metric = metricsMap.get(node.id)
        return {
          node,
          metric,
          status: statusFromNode(node, metric),
          alerts: alerts.filter((a) => a.node_id === node.id),
        }
      }),
    [alerts, metricsMap, nodes],
  )

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return rows.filter((row) => {
      if (status !== 'all' && row.status !== status) return false
      if (!term) return true
      return (
        row.node.name?.toLowerCase().includes(term) ||
        row.node.host?.toLowerCase().includes(term)
      )
    })
  }, [query, rows, status])

  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pagedRows = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="space-y-3">
      <div>
        <h1 className="font-mono text-xl font-semibold text-text-primary">Hosts</h1>
        <p className="text-xs text-text-secondary">Full table view of monitored hosts with filters.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-bg-border bg-bg-surface px-3 py-2">
        <label className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
            placeholder="Search host or IP"
            className="w-full rounded-md border border-bg-border bg-bg-base px-8 py-1.5 font-mono text-sm text-text-primary"
          />
        </label>
        <div className="inline-flex gap-1">
          {STATUS_FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setStatus(item)
                setPage(1)
              }}
              className={`rounded-md px-2.5 py-1 font-mono text-xs uppercase ${
                status === item ? 'bg-accent text-white' : 'bg-bg-elevated text-text-secondary'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <FleetTable rows={pagedRows} loading={isLoading} onSelectNode={(id) => navigate(`/devices/${id}`)} />
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-text-muted">
          {filtered.length} hosts · page {page}/{totalPages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-md border border-bg-border px-2 py-1 font-mono text-xs disabled:opacity-50"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-md border border-bg-border px-2 py-1 font-mono text-xs disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
