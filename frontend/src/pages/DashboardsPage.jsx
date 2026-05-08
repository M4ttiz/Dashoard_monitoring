import { useMemo, useState } from 'react'
import { Plus, Save, X } from 'lucide-react'

import MetricBar from '../components/ui/MetricBar.jsx'

const WIDGET_LIBRARY = [
  { id: 'cpu', title: 'CPU Usage' },
  { id: 'ram', title: 'RAM Usage' },
  { id: 'status', title: 'Host Status Summary' },
  { id: 'alerts', title: 'Top Alerts' },
  { id: 'disk', title: 'Disk Usage' },
  { id: 'services', title: 'Services Status' },
]

function WidgetContent({ widgetId }) {
  if (widgetId === 'cpu') {
    return (
      <svg viewBox="0 0 220 80" className="h-20 w-full">
        <polyline
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="3"
          points="0,55 30,45 60,50 90,35 120,40 150,30 180,38 220,20"
        />
      </svg>
    )
  }
  if (widgetId === 'ram') return <MetricBar value={72} max={100} height={14} ariaLabel="RAM usage" />
  if (widgetId === 'disk') return <MetricBar value={68} max={100} height={14} ariaLabel="Disk usage" />
  if (widgetId === 'status') {
    return (
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-[4px] border border-bg-border bg-bg-elevated p-2">OK: 1</div>
        <div className="rounded-[4px] border border-bg-border bg-bg-elevated p-2">Warning: 1</div>
        <div className="rounded-[4px] border border-bg-border bg-bg-elevated p-2">Down: 1</div>
      </div>
    )
  }
  if (widgetId === 'alerts') {
    return (
      <ul className="space-y-1 text-xs text-text-secondary">
        <li>High CPU on PC_DI_ANDREA</li>
        <li>Disk warning on pasqui_pc</li>
        <li>SQL service unstable on toolticket</li>
      </ul>
    )
  }
  return (
    <div className="grid grid-cols-3 gap-2 text-center text-xs">
      <div className="rounded-[4px] border border-bg-border bg-bg-elevated p-2">Running: 24</div>
      <div className="rounded-[4px] border border-bg-border bg-bg-elevated p-2">Stopped: 2</div>
      <div className="rounded-[4px] border border-bg-border bg-bg-elevated p-2">Warning: 3</div>
    </div>
  )
}

export default function DashboardsPage() {
  const [showModal, setShowModal] = useState(false)
  const [activeWidgets, setActiveWidgets] = useState(['cpu', 'alerts', 'ram', 'services'])

  const available = useMemo(
    () => WIDGET_LIBRARY.filter((widget) => !activeWidgets.includes(widget.id)),
    [activeWidgets]
  )

  const removeWidget = (id) => setActiveWidgets((current) => current.filter((item) => item !== id))
  const addWidget = (id) => {
    setActiveWidgets((current) => [...current, id])
    setShowModal(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Custom Dashboards</h1>
          <p className="mt-1 text-sm text-text-secondary">Build your personalized monitoring view</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-[4px] border border-bg-border bg-bg-surface px-3 py-2 text-sm text-text-primary hover:bg-bg-elevated"
          >
            <Plus className="size-4" /> Add Widget
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-[4px] border border-accent bg-accent-dim px-3 py-2 text-sm text-accent"
          >
            <Save className="size-4" /> Save Layout
          </button>
        </div>
      </div>

      {activeWidgets.length === 0 ? (
        <div className="rounded-[4px] border border-dashed border-bg-border bg-bg-surface p-8 text-center text-sm text-text-secondary">
          No widgets added. Click &apos;Add Widget&apos; to start.
        </div>
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {activeWidgets.map((widgetId) => {
            const widget = WIDGET_LIBRARY.find((item) => item.id === widgetId)
            return (
              <article key={widgetId} className="rounded-[4px] border border-bg-border bg-bg-surface p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-text-primary">{widget?.title}</h3>
                  <button
                    type="button"
                    aria-label={`Remove ${widget?.title}`}
                    onClick={() => removeWidget(widgetId)}
                    className="rounded-[4px] p-1 text-text-muted hover:bg-bg-elevated hover:text-text-primary"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <WidgetContent widgetId={widgetId} />
              </article>
            )
          })}
        </section>
      )}

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-base/70 p-4">
          <div className="w-full max-w-md rounded-[4px] border border-bg-border bg-bg-surface p-4">
            <h2 className="text-base font-semibold text-text-primary">Select Widget</h2>
            <div className="mt-3 space-y-2">
              {available.length === 0 ? (
                <p className="text-sm text-text-secondary">All widgets are already in the layout.</p>
              ) : (
                available.map((widget) => (
                  <button
                    key={widget.id}
                    type="button"
                    onClick={() => addWidget(widget.id)}
                    className="w-full rounded-[4px] border border-bg-border bg-bg-elevated px-3 py-2 text-left text-sm text-text-primary hover:border-accent"
                  >
                    {widget.title}
                  </button>
                ))
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-[4px] border border-bg-border px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
