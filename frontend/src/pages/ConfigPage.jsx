import { useMemo, useState } from 'react'

import { useMonitorConfig, useUpdateMonitorConfig } from '../hooks/useConfig.js'
import { useDeleteNode, useFleetData, useUpdateNode } from '../hooks/useFleetData.js'

function NumberField({ label, value, onChange, min = 1, max = 100 }) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-text-muted">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-md border border-bg-border bg-bg-base px-3 py-2 font-mono text-sm text-text-primary focus-visible:border-accent focus-visible:outline-none"
      />
    </label>
  )
}

export default function ConfigPage() {
  const { data: config, isLoading: configLoading } = useMonitorConfig()
  const updateConfig = useUpdateMonitorConfig()
  const { data: nodes = [], isLoading: nodesLoading } = useFleetData()
  const updateNode = useUpdateNode()
  const deleteNode = useDeleteNode()
  const [draft, setDraft] = useState(null)

  const effectiveDraft = draft || config || null
  const hasChanges = useMemo(() => {
    if (!draft || !config) return false
    return JSON.stringify(draft) !== JSON.stringify(config)
  }, [draft, config])

  const onSaveConfig = async () => {
    if (!effectiveDraft) return
    await updateConfig.mutateAsync(effectiveDraft)
    setDraft(null)
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-mono text-xl font-semibold text-text-primary">Config</h1>
        <p className="text-xs text-text-secondary">
          Imposta soglie alert e gestisci i nodi monitorati in stile NOC.
        </p>
      </div>

      <section className="rounded-lg border border-bg-border bg-bg-surface p-4">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-sm font-semibold text-text-primary">Alert policy</h2>
          <span className="font-mono text-[11px] text-text-muted">Backend-driven notifications</span>
        </header>

        {configLoading || !effectiveDraft ? (
          <p className="text-sm text-text-secondary">Caricamento configurazione...</p>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <NumberField
                label="CPU warning %"
                value={effectiveDraft.cpu_warning}
                onChange={(v) => setDraft((s) => ({ ...(s || effectiveDraft), cpu_warning: v }))}
              />
              <NumberField
                label="CPU critical %"
                value={effectiveDraft.cpu_critical}
                onChange={(v) => setDraft((s) => ({ ...(s || effectiveDraft), cpu_critical: v }))}
              />
              <NumberField
                label="Memory warning %"
                value={effectiveDraft.memory_warning}
                onChange={(v) => setDraft((s) => ({ ...(s || effectiveDraft), memory_warning: v }))}
              />
              <NumberField
                label="Memory critical %"
                value={effectiveDraft.memory_critical}
                onChange={(v) => setDraft((s) => ({ ...(s || effectiveDraft), memory_critical: v }))}
              />
              <NumberField
                label="Disk warning %"
                value={effectiveDraft.disk_warning}
                onChange={(v) => setDraft((s) => ({ ...(s || effectiveDraft), disk_warning: v }))}
              />
              <NumberField
                label="Disk critical %"
                value={effectiveDraft.disk_critical}
                onChange={(v) => setDraft((s) => ({ ...(s || effectiveDraft), disk_critical: v }))}
              />
              <NumberField
                label="Polling interval (sec)"
                value={effectiveDraft.poll_interval_seconds}
                onChange={(v) => setDraft((s) => ({ ...(s || effectiveDraft), poll_interval_seconds: v }))}
                min={5}
                max={300}
              />
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDraft(config)}
                className="rounded-md border border-bg-border px-3 py-1.5 font-mono text-xs text-text-secondary hover:bg-bg-elevated"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={onSaveConfig}
                disabled={!hasChanges || updateConfig.isPending}
                className="rounded-md bg-accent px-3 py-1.5 font-mono text-xs font-semibold text-white hover:brightness-110 disabled:opacity-50"
              >
                {updateConfig.isPending ? 'Salvataggio...' : 'Salva policy'}
              </button>
            </div>
          </>
        )}
      </section>

      <section className="rounded-lg border border-bg-border bg-bg-surface">
        <header className="border-b border-bg-border px-4 py-3">
          <h2 className="font-mono text-sm font-semibold text-text-primary">Node management</h2>
        </header>

        {nodesLoading ? (
          <p className="px-4 py-4 text-sm text-text-secondary">Caricamento nodi...</p>
        ) : (
          <div className="divide-y divide-bg-border/50">
            {nodes.map((node) => (
              <div key={node.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm text-text-primary">{node.name}</p>
                  <p className="truncate font-mono text-xs text-text-muted">
                    {node.host}:{node.port}
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 font-mono text-xs text-text-secondary">
                  <input
                    type="checkbox"
                    checked={Boolean(node.is_active)}
                    onChange={(e) =>
                      updateNode.mutate({
                        id: node.id,
                        payload: { is_active: e.target.checked },
                      })
                    }
                  />
                  Active
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (!window.confirm(`Rimuovere ${node.name}?`)) return
                    deleteNode.mutate(node.id)
                  }}
                  className="rounded-md border border-status-critical/40 px-2.5 py-1 font-mono text-xs text-status-critical hover:bg-status-critical/10"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
