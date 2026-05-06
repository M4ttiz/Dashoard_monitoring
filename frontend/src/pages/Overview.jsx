import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useStore } from '../store/useStore.js'

function metricColorClass(value) {
  if (value > 85) return 'bg-red-500'
  if (value >= 70) return 'bg-yellow-400'
  return 'bg-emerald-500'
}

function ProgressRow({ label, value }) {
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-slate-300">
        <span>{label}</span>
        <span>{safeValue.toFixed(1)}%</span>
      </div>
      <div className="h-2 w-full rounded bg-slate-700">
        <div className={`h-2 rounded ${metricColorClass(safeValue)}`} style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  )
}

function NodeSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-slate-700 bg-slate-800/70 p-4">
      <div className="mb-3 h-4 w-1/2 rounded bg-slate-700" />
      <div className="space-y-2">
        <div className="h-2 rounded bg-slate-700" />
        <div className="h-2 rounded bg-slate-700" />
        <div className="h-2 rounded bg-slate-700" />
      </div>
    </div>
  )
}

export default function Overview({ isConnected }) {
  const navigate = useNavigate()
  const nodes = useStore((s) => s.nodes)
  const isNodesLoading = useStore((s) => s.isNodesLoading)
  const currentMetrics = useStore((s) => s.currentMetrics)
  const alerts = useStore((s) => s.alerts)
  const addNode = useStore((s) => s.addNode)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState({ name: '', host: '', port: 9646 })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const kpis = useMemo(() => {
    const onlineNodes = nodes.filter((n) => n.status === 'online').length
    const metricsList = nodes
      .map((n) => currentMetrics[n.id])
      .filter((m) => m && Number.isFinite(m.cpu_percent) && Number.isFinite(m.memory_percent))

    const cpuAvg =
      metricsList.length > 0
        ? metricsList.reduce((acc, m) => acc + m.cpu_percent, 0) / metricsList.length
        : 0
    const ramAvg =
      metricsList.length > 0
        ? metricsList.reduce((acc, m) => acc + m.memory_percent, 0) / metricsList.length
        : 0

    const criticalAlerts = alerts.filter((a) => a.severity === 'critical' && !a.is_read).length
    const warningAlerts = alerts.filter((a) => a.severity === 'warning' && !a.is_read).length

    return { onlineNodes, cpuAvg, ramAvg, criticalAlerts, warningAlerts }
  }, [alerts, currentMetrics, nodes])

  const onSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')

    if (!form.name.trim() || !form.host.trim() || !form.port) {
      setSubmitError('Compila tutti i campi richiesti.')
      return
    }

    setIsSubmitting(true)
    try {
      await addNode({
        name: form.name.trim(),
        host: form.host.trim(),
        port: Number(form.port),
      })
      setIsModalOpen(false)
      setForm({ name: '', host: '', port: 9646 })
    } catch {
      setSubmitError('Impossibile aggiungere il nodo. Verifica backend e dati.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-slate-100">MISAT Monitor</h2>
          <p className="text-sm text-slate-400">
            {alerts.filter((a) => !a.is_read).length} alert attivi · {isConnected ? 'Connected' : 'Disconnected'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="rounded bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
        >
          + Aggiungi Nodo
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
          <p className="text-xs text-slate-400">Nodi online</p>
          <p className="text-2xl font-semibold text-emerald-400">
            {kpis.onlineNodes}/{nodes.length}
          </p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
          <p className="text-xs text-slate-400">CPU media</p>
          <p className="text-2xl font-semibold text-sky-400">{kpis.cpuAvg.toFixed(1)}%</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
          <p className="text-xs text-slate-400">RAM media</p>
          <p className="text-2xl font-semibold text-indigo-400">{kpis.ramAvg.toFixed(1)}%</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
          <p className="text-xs text-slate-400">Alert critici</p>
          <p className="text-2xl font-semibold text-red-400">{kpis.criticalAlerts}</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
          <p className="text-xs text-slate-400">Alert warning</p>
          <p className="text-2xl font-semibold text-yellow-300">{kpis.warningAlerts}</p>
        </div>
      </div>

      {isNodesLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <NodeSkeleton />
          <NodeSkeleton />
          <NodeSkeleton />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {nodes.map((node) => {
            const metrics = currentMetrics[node.id]
            const cpu = metrics?.cpu_percent ?? 0
            const ram = metrics?.memory_percent ?? 0
            const disk = Array.isArray(metrics?.disk_data)
              ? Math.max(0, ...metrics.disk_data.map((d) => Number(d.percent) || 0))
              : 0

            return (
              <button
                key={node.id}
                type="button"
                onClick={() => navigate(`/nodes/${node.id}`)}
                className="rounded-lg border border-slate-700 bg-slate-800 p-4 text-left transition hover:border-sky-500 hover:bg-slate-700/80"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-medium text-slate-100">{node.name}</h3>
                  <span className={node.status === 'online' ? 'text-emerald-400 text-xs' : 'text-rose-400 text-xs'}>
                    {node.status === 'online' ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="space-y-3">
                  <ProgressRow label="CPU" value={cpu} />
                  <ProgressRow label="RAM" value={ram} />
                  <ProgressRow label="Disk" value={disk} />
                </div>
              </button>
            )
          })}
        </div>
      )}

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4">
          <form onSubmit={onSubmit} className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 p-5">
            <h3 className="mb-4 text-lg font-semibold text-slate-100">Aggiungi Nodo</h3>
            <div className="space-y-3">
              <label className="block text-sm text-slate-300">
                Nome
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
                  placeholder="Server-Prod-01"
                />
              </label>
              <label className="block text-sm text-slate-300">
                Host
                <input
                  value={form.host}
                  onChange={(e) => setForm((f) => ({ ...f, host: e.target.value }))}
                  className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
                  placeholder="192.168.1.10"
                />
              </label>
              <label className="block text-sm text-slate-300">
                Porta
                <input
                  type="number"
                  value={form.port}
                  onChange={(e) => setForm((f) => ({ ...f, port: e.target.value }))}
                  className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
                  min="1"
                  max="65535"
                />
              </label>
            </div>

            {submitError ? <p className="mt-3 text-sm text-red-400">{submitError}</p> : null}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
                disabled={isSubmitting}
              >
                Annulla
              </button>
              <button
                type="submit"
                className="rounded bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvataggio...' : 'Salva Nodo'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}

