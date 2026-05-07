import { useFleetData } from '../hooks/useFleetData.js'

export default function InventoryPage() {
  const { data: nodes = [], isLoading } = useFleetData()

  return (
    <div className="space-y-3">
      <div>
        <h1 className="font-mono text-xl font-semibold text-text-primary">Inventory</h1>
        <p className="text-xs text-text-secondary">Simple host inventory list.</p>
      </div>
      <section className="rounded-lg border border-bg-border bg-bg-surface">
        <div className="grid grid-cols-[1.4fr_1fr_90px] gap-2 border-b border-bg-border px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
          <span>Host</span>
          <span>Address</span>
          <span>Port</span>
        </div>
        {isLoading ? (
          <p className="px-3 py-4 text-sm text-text-secondary">Loading inventory...</p>
        ) : nodes.length === 0 ? (
          <p className="px-3 py-4 text-sm text-text-secondary">No inventory data available.</p>
        ) : (
          <div className="divide-y divide-bg-border/60">
            {nodes.map((node) => (
              <div key={node.id} className="grid grid-cols-[1.4fr_1fr_90px] gap-2 px-3 py-2 font-mono text-xs">
                <span className="truncate text-text-primary">{node.name}</span>
                <span className="truncate text-text-secondary">{node.host}</span>
                <span className="text-text-secondary">{node.port || '—'}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
