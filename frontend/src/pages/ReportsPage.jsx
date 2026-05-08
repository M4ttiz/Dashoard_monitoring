import { useState } from 'react'
import { Activity, BellRing, HardDrive, ServerCog } from 'lucide-react'

const REPORT_TYPES = [
  {
    id: 'availability',
    title: 'Host Availability Report',
    description: 'Uptime percentage by host for the selected period',
    icon: Activity,
  },
  {
    id: 'alerts',
    title: 'Alert Summary Report',
    description: 'Alert frequency and distribution by severity',
    icon: BellRing,
  },
  {
    id: 'resources',
    title: 'Resource Usage Report',
    description: 'Average CPU, RAM and Disk usage by host',
    icon: HardDrive,
  },
  {
    id: 'services',
    title: 'Service Health Report',
    description: 'Service state evolution over time',
    icon: ServerCog,
  },
]

const RECENT = [
  { name: 'Host Availability Report', generatedOn: '2026-05-08 08:30', range: 'Last 7 days', format: 'PDF' },
  { name: 'Alert Summary Report', generatedOn: '2026-05-07 18:10', range: 'Last 30 days', format: 'CSV' },
  { name: 'Resource Usage Report', generatedOn: '2026-05-07 09:55', range: 'Last 7 days', format: 'PDF' },
  { name: 'Service Health Report', generatedOn: '2026-05-06 17:40', range: 'Last 3 months', format: 'CSV' },
  { name: 'Alert Summary Report', generatedOn: '2026-05-06 11:08', range: 'Last 30 days', format: 'PDF' },
]

const RANGE_OPTIONS = ['Last 7 days', 'Last 30 days', 'Last 3 months']

export default function ReportsPage() {
  const [ranges, setRanges] = useState({
    availability: 'Last 7 days',
    alerts: 'Last 30 days',
    resources: 'Last 7 days',
    services: 'Last 3 months',
  })

  const updateRange = (id, value) => setRanges((current) => ({ ...current, [id]: value }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Reports</h1>
        <p className="mt-1 text-sm text-text-secondary">Generate and export monitoring reports</p>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        {REPORT_TYPES.map((report) => {
          const Icon = report.icon
          return (
            <article key={report.id} className="rounded-[4px] border border-bg-border bg-bg-surface p-4">
              <div className="mb-2 flex items-center gap-2">
                <Icon className="size-4 text-accent" />
                <h2 className="text-sm font-semibold text-text-primary">{report.title}</h2>
              </div>
              <p className="mb-3 text-sm text-text-secondary">{report.description}</p>
              <label htmlFor={`${report.id}-range`} className="mb-1 block text-xs text-text-secondary">Range</label>
              <select
                id={`${report.id}-range`}
                value={ranges[report.id]}
                onChange={(event) => updateRange(report.id, event.target.value)}
                className="w-full rounded-[4px] border border-bg-border bg-bg-elevated px-3 py-2 text-sm text-text-primary"
              >
                {RANGE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => window.alert(`${report.title} generation started`)}
                className="mt-3 rounded-[4px] border border-accent bg-accent-dim px-3 py-2 text-sm text-accent"
              >
                Generate
              </button>
            </article>
          )
        })}
      </section>

      <section className="overflow-x-auto rounded-[4px] border border-bg-border bg-bg-surface">
        <div className="border-b border-bg-border px-4 py-3">
          <h2 className="text-sm font-semibold text-text-primary">Recent Reports</h2>
        </div>
        <table className="min-w-full text-sm">
          <thead className="bg-bg-elevated text-xs uppercase text-text-muted">
            <tr>
              <th className="px-4 py-3 text-left">Report Name</th>
              <th className="px-4 py-3 text-left">Generated On</th>
              <th className="px-4 py-3 text-left">Range</th>
              <th className="px-4 py-3 text-left">Format</th>
              <th className="px-4 py-3 text-left">Download</th>
            </tr>
          </thead>
          <tbody>
            {RECENT.map((item, index) => (
              <tr key={`${item.name}-${index}`} className="border-t border-bg-border">
                <td className="px-4 py-3 text-text-primary">{item.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-text-secondary">{item.generatedOn}</td>
                <td className="px-4 py-3 text-text-secondary">{item.range}</td>
                <td className="px-4 py-3 text-text-secondary">{item.format}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => window.alert('Download coming soon')}
                    className="rounded-[4px] border border-bg-border px-2 py-1 text-xs text-text-secondary hover:bg-bg-elevated"
                  >
                    {item.format}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
