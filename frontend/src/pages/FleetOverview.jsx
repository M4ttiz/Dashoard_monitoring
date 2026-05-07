import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import FleetFilters from '../components/fleet/FleetFilters.jsx'
import FleetStatusBar from '../components/fleet/FleetStatusBar.jsx'
import FleetTable from '../components/fleet/FleetTable.jsx'
import { useAlerts } from '../hooks/useAlerts.js'
import { useAddNode, useFleetData } from '../hooks/useFleetData.js'
import { useFleetMetrics } from '../hooks/useFleetMetrics.js'
import { statusFromNode, statusRank } from '../utils/thresholds.js'

const DEFAULT_STATUS_FILTER = new Set(['ok', 'warning', 'critical', 'down'])

export default function FleetOverview() {
  const navigate = useNavigate()
  const { data: nodes = [], isLoading: isFleetLoading } = useFleetData()
  const metricsMap = useFleetMetrics(nodes)
  const { data: alerts = [] } = useAlerts()
  const addNodeMutation = useAddNode()

  const [search, setSearch] = useState('')
  const [activeStatuses, setActiveStatuses] = useState(DEFAULT_STATUS_FILTER)
  const [sortBy, setSortBy] = useState('status')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const enrichedNodes = useMemo(() => {
    return nodes.map((node) => {
      const metric = metricsMap.get(node.id)
      const status = statusFromNode(node, metric)
      const nodeAlerts = alerts.filter((a) => a.node_id === node.id)
      return { node, metric, status, alerts: nodeAlerts }
    })
  }, [alerts, metricsMap, nodes])

  const counts = useMemo(() => {
    return enrichedNodes.reduce(
      (acc, row) => {
        acc[row.status] = (acc[row.status] || 0) + 1
        return acc
      },
      { ok: 0, warning: 0, critical: 0, down: 0, unknown: 0 },
    )
  }, [enrichedNodes])

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase()
    return enrichedNodes
      .filter(({ node, status }) => {
        if (!activeStatuses.has(status) && status !== 'unknown') return false
        if (!term) return true
        return (
          node.name?.toLowerCase().includes(term) ||
          node.host?.toLowerCase().includes(term)
        )
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.node.name.localeCompare(b.node.name)
          case 'cpu':
            return (b.metric?.cpu_percent || 0) - (a.metric?.cpu_percent || 0)
          case 'ram':
            return (b.metric?.memory_percent || 0) - (a.metric?.memory_percent || 0)
          case 'disk': {
            const diskA = Math.max(
              0,
              ...(a.metric?.disk_data || []).map((d) => Number(d.percent) || 0),
            )
            const diskB = Math.max(
              0,
              ...(b.metric?.disk_data || []).map((d) => Number(d.percent) || 0),
            )
            return diskB - diskA
          }
          case 'status':
          default: {
            const rank = statusRank(a.status) - statusRank(b.status)
            if (rank !== 0) return rank
            return a.node.name.localeCompare(b.node.name)
          }
        }
      })
  }, [activeStatuses, enrichedNodes, search, sortBy])

  const toggleStatus = (status) => {
    setActiveStatuses((prev) => {
      const next = new Set(prev)
      if (next.has(status)) {
        next.delete(status)
      } else {
        next.add(status)
      }
      return next
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-mono text-xl font-semibold text-text-primary">Fleet Overview</h1>
          <p className="text-xs text-text-secondary">
            {nodes.length} nodi monitorati · drill-down sulla riga per il dettaglio
          </p>
        </div>
      </div>

      <FleetStatusBar counts={counts} total={nodes.length} />

      <FleetFilters
        search={search}
        onSearchChange={setSearch}
        activeStatuses={activeStatuses}
        onToggleStatus={toggleStatus}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onAddNode={() => setIsModalOpen(true)}
      />

      <FleetTable
        rows={filteredRows}
        loading={isFleetLoading}
        onSelectNode={(id) => navigate(`/devices/${id}`)}
      />

      {isModalOpen ? (
        <AddNodeModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={async (payload) => {
            await addNodeMutation.mutateAsync(payload)
            setIsModalOpen(false)
          }}
          submitting={addNodeMutation.isPending}
          error={addNodeMutation.error?.message}
        />
      ) : null}
    </div>
  )
}

function AddNodeModal({ onClose, onSubmit, submitting, error }) {
  const [form, setForm] = useState({ name: '', host: '', port: 9646 })
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')
    if (!form.name.trim() || !form.host.trim() || !form.port) {
      setLocalError('Compila tutti i campi richiesti.')
      return
    }
    try {
      await onSubmit({
        name: form.name.trim(),
        host: form.host.trim(),
        port: Number(form.port),
      })
    } catch {
      setLocalError('Impossibile aggiungere il nodo. Verifica backend e dati.')
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-node-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-base/80 px-4 backdrop-blur-sm"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-lg border border-bg-border bg-bg-surface p-5 shadow-2xl"
      >
        <h2 id="add-node-title" className="mb-4 font-mono text-base font-semibold text-text-primary">
          Aggiungi nodo
        </h2>

        <div className="space-y-3">
          <Field
            label="Nome"
            value={form.name}
            onChange={(v) => setForm((f) => ({ ...f, name: v }))}
            placeholder="server-prod-01"
          />
          <Field
            label="Host / IP"
            value={form.host}
            onChange={(v) => setForm((f) => ({ ...f, host: v }))}
            placeholder="192.168.1.10"
          />
          <Field
            label="Porta agent"
            type="number"
            value={form.port}
            onChange={(v) => setForm((f) => ({ ...f, port: v }))}
            min={1}
            max={65535}
          />
        </div>

        {(localError || error) ? (
          <p className="mt-3 text-xs text-status-critical">{localError || error}</p>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-bg-border px-3 py-1.5 font-mono text-xs text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
            disabled={submitting}
          >
            Annulla
          </button>
          <button
            type="submit"
            className="rounded-md bg-accent px-3 py-1.5 font-mono text-xs font-semibold text-white hover:brightness-110 disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? 'Salvataggio...' : 'Salva nodo'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', ...rest }) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-text-muted">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-bg-border bg-bg-base px-3 py-2 font-mono text-sm text-text-primary focus-visible:border-accent focus-visible:outline-none"
        {...rest}
      />
    </label>
  )
}
