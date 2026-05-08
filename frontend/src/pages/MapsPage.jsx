import { useMemo, useState } from 'react'

import StatusBadge from '../components/ui/StatusBadge.jsx'

const HOSTS = [
  { name: 'toolticket', ip: '192.168.10.21', subnet: '192.168.10.0/24', status: 'ok', services: 24, x: 120, y: 90 },
  { name: 'PC_DI_ANDREA', ip: '192.168.10.32', subnet: '192.168.10.0/24', status: 'warning', services: 18, x: 320, y: 180 },
  { name: 'pasqui_pc', ip: '192.168.10.47', subnet: '192.168.10.0/24', status: 'critical', services: 16, x: 520, y: 90 },
]

const GATEWAY = { name: 'Gateway/Router', x: 320, y: 50 }

const NODE_COLOR = {
  ok: 'var(--color-status-ok)',
  warning: 'var(--color-status-warning)',
  critical: 'var(--color-status-critical)',
}

export default function MapsPage() {
  const [hoveredNode, setHoveredNode] = useState(null)

  const activeNode = useMemo(() => HOSTS.find((host) => host.name === hoveredNode), [hoveredNode])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Network Map</h1>
        <p className="mt-1 text-sm text-text-secondary">Visual topology of monitored hosts</p>
      </div>

      <section className="relative rounded-[4px] border border-bg-border bg-bg-surface p-4">
        <svg viewBox="0 0 640 260" className="h-[320px] w-full rounded-[4px] bg-bg-elevated/40">
          {HOSTS.map((host) => (
            <line
              key={`line-${host.name}`}
              x1={GATEWAY.x}
              y1={GATEWAY.y}
              x2={host.x}
              y2={host.y}
              stroke="var(--color-bg-border)"
              strokeWidth="2"
            />
          ))}

          <circle cx={GATEWAY.x} cy={GATEWAY.y} r="20" fill="var(--color-accent)" />
          <text x={GATEWAY.x} y={GATEWAY.y + 36} textAnchor="middle" className="fill-text-primary text-xs">
            {GATEWAY.name}
          </text>

          {HOSTS.map((host) => (
            <g
              key={host.name}
              onMouseEnter={() => setHoveredNode(host.name)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <circle cx={host.x} cy={host.y} r="22" fill={NODE_COLOR[host.status]} />
              <text x={host.x} y={host.y + 38} textAnchor="middle" className="fill-text-primary text-xs">
                {host.name}
              </text>
            </g>
          ))}
        </svg>

        <div className="absolute bottom-6 left-6 rounded-[4px] border border-bg-border bg-bg-surface px-3 py-2 text-xs">
          <p className="mb-2 font-semibold text-text-primary">Legend</p>
          <div className="space-y-1 text-text-secondary">
            <p><span className="mr-1 inline-block size-2 rounded-full bg-status-ok" /> OK</p>
            <p><span className="mr-1 inline-block size-2 rounded-full bg-status-warning" /> Warning</p>
            <p><span className="mr-1 inline-block size-2 rounded-full bg-status-critical" /> Down</p>
          </div>
        </div>

        {activeNode ? (
          <div className="absolute right-6 top-6 w-56 rounded-[4px] border border-bg-border bg-bg-surface p-3 text-xs shadow-lg">
            <p className="font-semibold text-text-primary">{activeNode.name}</p>
            <p className="mt-1 text-text-secondary">IP: {activeNode.ip}</p>
            <p className="text-text-secondary">Active services: {activeNode.services}</p>
            <div className="mt-2">
              <StatusBadge
                status={activeNode.status}
                label={activeNode.status === 'critical' ? 'Down' : activeNode.status === 'ok' ? 'OK' : 'Warning'}
                size="sm"
              />
            </div>
          </div>
        ) : null}
      </section>

      <section className="overflow-x-auto rounded-[4px] border border-bg-border bg-bg-surface">
        <table className="min-w-full text-sm">
          <thead className="bg-bg-elevated text-xs uppercase text-text-muted">
            <tr>
              <th className="px-4 py-3 text-left">Host</th>
              <th className="px-4 py-3 text-left">IP</th>
              <th className="px-4 py-3 text-left">Subnet</th>
            </tr>
          </thead>
          <tbody>
            {HOSTS.map((host) => (
              <tr key={host.name} className="border-t border-bg-border text-text-primary">
                <td className="px-4 py-3">{host.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-text-secondary">{host.ip}</td>
                <td className="px-4 py-3 text-text-secondary">{host.subnet}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
