import { useMemo, useState } from 'react'

import StatusBadge from '../components/ui/StatusBadge.jsx'

const SERVICES = [
  { name: 'Windows Update', host: 'toolticket', status: 'Running', pid: 1280, startType: 'Automatic', lastCheck: '2 min ago' },
  { name: 'IIS', host: 'toolticket', status: 'Running', pid: 2420, startType: 'Automatic', lastCheck: '1 min ago' },
  { name: 'SQL Server', host: 'toolticket', status: 'Warning', pid: 3368, startType: 'Automatic', lastCheck: '3 min ago' },
  { name: 'Print Spooler', host: 'PC_DI_ANDREA', status: 'Stopped', pid: '-', startType: 'Manual', lastCheck: '30 sec ago' },
  { name: 'Remote Desktop', host: 'PC_DI_ANDREA', status: 'Running', pid: 1864, startType: 'Automatic', lastCheck: '1 min ago' },
  { name: 'Windows Defender', host: 'PC_DI_ANDREA', status: 'Running', pid: 4510, startType: 'Automatic', lastCheck: '2 min ago' },
  { name: 'DHCP Client', host: 'pasqui_pc', status: 'Running', pid: 1542, startType: 'Automatic', lastCheck: '2 min ago' },
  { name: 'DNS Client', host: 'pasqui_pc', status: 'Running', pid: 1648, startType: 'Automatic', lastCheck: '2 min ago' },
  { name: 'Task Scheduler', host: 'pasqui_pc', status: 'Warning', pid: 2152, startType: 'Automatic', lastCheck: '4 min ago' },
  { name: 'Windows Firewall', host: 'pasqui_pc', status: 'Running', pid: 998, startType: 'Automatic', lastCheck: '1 min ago' },
]

const STATUS_FILTERS = ['All', 'Running', 'Stopped', 'Warning']

function toBadgeTone(status) {
  if (status === 'Running') return 'ok'
  if (status === 'Warning') return 'warning'
  if (status === 'Stopped') return 'critical'
  return 'unknown'
}

export default function ServicesPage() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')

  const filtered = useMemo(() => {
    return SERVICES.filter((service) => {
      const matchesQuery = service.name.toLowerCase().includes(query.trim().toLowerCase())
      const matchesStatus = status === 'All' || service.status === status
      return matchesQuery && matchesStatus
    })
  }, [query, status])

  const counters = useMemo(() => {
    return SERVICES.reduce(
      (acc, item) => {
        acc.total += 1
        if (item.status === 'Running') acc.running += 1
        if (item.status === 'Stopped') acc.stopped += 1
        if (item.status === 'Warning') acc.warning += 1
        return acc
      },
      { total: 0, running: 0, stopped: 0, warning: 0 }
    )
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Services</h1>
        <p className="mt-1 text-sm text-text-secondary">Monitored Windows services across all hosts</p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[4px] border border-bg-border bg-bg-surface p-3">
          <p className="text-xs text-text-muted">Total services</p>
          <p className="mt-1 font-mono text-xl text-text-primary">{counters.total}</p>
        </article>
        <article className="rounded-[4px] border border-bg-border bg-bg-surface p-3">
          <p className="text-xs text-text-muted">Running</p>
          <p className="mt-1 font-mono text-xl text-status-ok">{counters.running}</p>
        </article>
        <article className="rounded-[4px] border border-bg-border bg-bg-surface p-3">
          <p className="text-xs text-text-muted">Stopped</p>
          <p className="mt-1 font-mono text-xl text-status-critical">{counters.stopped}</p>
        </article>
        <article className="rounded-[4px] border border-bg-border bg-bg-surface p-3">
          <p className="text-xs text-text-muted">Warning</p>
          <p className="mt-1 font-mono text-xl text-status-warning">{counters.warning}</p>
        </article>
      </section>

      <section className="rounded-[4px] border border-bg-border bg-bg-surface p-4">
        <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
          <div>
            <label htmlFor="service-search" className="mb-1 block text-xs text-text-secondary">
              Search service
            </label>
            <input
              id="service-search"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Type service name..."
              className="w-full rounded-[4px] border border-bg-border bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder:text-text-muted"
            />
          </div>
          <div>
            <label htmlFor="service-status" className="mb-1 block text-xs text-text-secondary">
              Status
            </label>
            <select
              id="service-status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-[4px] border border-bg-border bg-bg-elevated px-3 py-2 text-sm text-text-primary"
            >
              {STATUS_FILTERS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="overflow-x-auto rounded-[4px] border border-bg-border bg-bg-surface">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-bg-border bg-bg-elevated text-xs uppercase tracking-wide text-text-muted">
            <tr>
              <th className="px-4 py-3">Service Name</th>
              <th className="px-4 py-3">Host</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">PID</th>
              <th className="px-4 py-3">Start Type</th>
              <th className="px-4 py-3">Last Check</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((service) => (
              <tr key={`${service.name}-${service.host}`} className="border-b border-bg-border/70 text-text-primary">
                <td className="px-4 py-3">{service.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-text-secondary">{service.host}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={toBadgeTone(service.status)} label={service.status} size="sm" />
                </td>
                <td className="px-4 py-3 font-mono text-xs">{service.pid}</td>
                <td className="px-4 py-3 text-text-secondary">{service.startType}</td>
                <td className="px-4 py-3 text-text-muted">{service.lastCheck}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
