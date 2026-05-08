import { useEffect, useMemo, useState } from 'react'

import Spinner from '../components/ui/Spinner.jsx'

function normalizeStatus(status) {
  const value = String(status || '').toLowerCase()
  if (value === 'up' || value === 'ok') return 'ok'
  if (value === 'warning') return 'warning'
  if (value === 'down' || value === 'critical') return 'critical'
  return 'unknown'
}

function statusLabel(status) {
  if (status === 'ok') return 'OK'
  if (status === 'warning') return 'Warning'
  if (status === 'critical') return 'Down'
  return 'Unknown'
}

function statusColor(status) {
  if (status === 'ok') return 'var(--color-status-ok)'
  if (status === 'warning') return 'var(--color-status-warning)'
  if (status === 'critical') return 'var(--color-status-critical)'
  return 'var(--color-status-unknown)'
}

export default function MapsPage() {
  const [nodes, setNodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hoveredNode, setHoveredNode] = useState(null)

  useEffect(() => {
    fetch('/api/nodes')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => setNodes(Array.isArray(data) ? data : []))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false))
  }, [])

  const positionedNodes = useMemo(() => {
    const cx = 400
    const cy = 300
    const r = 200
    if (nodes.length === 0) return []
    return nodes.map((node, i) => {
      const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2
      return {
        ...node,
        normalizedStatus: normalizeStatus(node.status),
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
      }
    })
  }, [nodes])

  const activeNode = useMemo(
    () => positionedNodes.find((node) => node.id === hoveredNode),
    [hoveredNode, positionedNodes],
  )

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Spinner size={24} />
      </div>
    )
  }

  if (error) return <p className="text-red-400">Errore: {error}</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Network Map</h1>
        <p className="mt-1 text-sm text-text-secondary">Visual topology of monitored hosts</p>
      </div>

      <section className="relative overflow-hidden rounded-[4px] border border-bg-border bg-bg-surface p-4">
        <svg viewBox="0 0 800 600" width="100%" className="h-[420px] w-full rounded-[4px] bg-bg-elevated/40">
          {positionedNodes.map((node) => (
            <line
              key={`line-${node.id}`}
              x1={400}
              y1={300}
              x2={node.x}
              y2={node.y}
              stroke="var(--color-bg-border)"
              strokeWidth="2"
            />
          ))}

          <circle cx={400} cy={300} r="26" fill="var(--color-accent)" />
          <text x={400} y={344} textAnchor="middle" className="fill-text-primary text-xs">
            Gateway
          </text>

          {positionedNodes.map((node) => (
            <g
              key={node.id}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <circle cx={node.x} cy={node.y} r="22" fill={statusColor(node.normalizedStatus)} />
              <text x={node.x} y={node.y + 38} textAnchor="middle" className="fill-text-primary text-xs">
                {node.name}
              </text>
            </g>
          ))}
        </svg>

        <div className="absolute bottom-6 left-6 rounded-[4px] border border-bg-border bg-bg-surface px-3 py-2 text-xs">
          <p className="mb-2 font-semibold text-text-primary">Legend</p>
          <div className="space-y-1 text-text-secondary">
            <p><span className="mr-1 inline-block size-2 rounded-full bg-status-ok" /> OK / Up</p>
            <p><span className="mr-1 inline-block size-2 rounded-full bg-status-warning" /> Warning</p>
            <p><span className="mr-1 inline-block size-2 rounded-full bg-status-critical" /> Down / Critical</p>
            <p><span className="mr-1 inline-block size-2 rounded-full bg-status-unknown" /> Unknown</p>
          </div>
        </div>

        {activeNode ? (
          <div className="absolute right-6 top-6 w-64 rounded-[4px] border border-bg-border bg-bg-surface p-3 text-xs shadow-lg">
            <p className="font-semibold text-text-primary">{activeNode.name || 'Unknown host'}</p>
            <p className="mt-1 text-text-secondary">IP: {activeNode.ip || activeNode.address || '—'}</p>
            <p className="text-text-secondary">Status: {statusLabel(activeNode.normalizedStatus)}</p>
          </div>
        ) : null}
      </section>

      <section className="overflow-x-auto rounded-[4px] border border-bg-border bg-bg-surface">
        <table className="min-w-full text-xs sm:text-sm">
          <thead className="bg-bg-elevated text-xs uppercase text-text-muted">
            <tr>
              <th className="px-4 py-3 text-left">Host</th>
              <th className="px-4 py-3 text-left">IP</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {positionedNodes.map((node) => (
              <tr key={node.id} className="border-t border-bg-border text-text-primary">
                <td className="px-4 py-3">{node.name || '—'}</td>
                <td className="px-4 py-3 font-mono text-xs text-text-secondary">{node.ip || node.address || '—'}</td>
                <td className="px-4 py-3">
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px]"
                    style={{
                      color: statusColor(node.normalizedStatus),
                      border: `1px solid ${statusColor(node.normalizedStatus)}`,
                    }}
                  >
                    {statusLabel(node.normalizedStatus)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
