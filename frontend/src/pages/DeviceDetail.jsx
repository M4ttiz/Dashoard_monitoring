import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import AlertTable from '../components/device/AlertTable.jsx'
import DeviceHeader from '../components/device/DeviceHeader.jsx'
import DeviceKPIRow from '../components/device/DeviceKPIRow.jsx'
import DiskTable from '../components/device/DiskTable.jsx'
import MetricChart from '../components/device/MetricChart.jsx'
import RangeSelector from '../components/device/RangeSelector.jsx'
import { useNodeAlerts } from '../hooks/useAlerts.js'
import { useDeviceCurrent, useDeviceMetrics } from '../hooks/useDeviceMetrics.js'
import { useDeleteNode, useFleetData } from '../hooks/useFleetData.js'
import { useMonitorStore } from '../store/useMonitorStore.js'
import { statusFromNode } from '../utils/thresholds.js'

export default function DeviceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: nodes = [] } = useFleetData()
  const { data: history = [], isLoading: historyLoading } = useDeviceMetrics(id, useMonitorStore((s) => s.selectedRange))
  const { data: current } = useDeviceCurrent(id)
  const { data: alerts = [] } = useNodeAlerts(id)
  const range = useMonitorStore((s) => s.selectedRange)
  const setRange = useMonitorStore((s) => s.setSelectedRange)
  const deleteNodeMutation = useDeleteNode()

  const node = nodes.find((n) => n.id === id)
  const status = statusFromNode(node, current)

  // Merge live snapshot into history tail so the chart updates in real-time
  const mergedHistory = useMemo(() => {
    if (!current?.timestamp) return history
    const last = history[history.length - 1]
    if (last && last.timestamp === current.timestamp) {
      return [...history.slice(0, -1), current]
    }
    return [...history, current].slice(-300)
  }, [history, current])

  const previous = useMemo(() => {
    if (mergedHistory.length < 2) return null
    return mergedHistory[mergedHistory.length - 2]
  }, [mergedHistory])

  const diskHistory = useMemo(() => {
    return mergedHistory.map((point) => {
      const row = { timestamp: point.timestamp }
      if (Array.isArray(point.disk_data)) {
        point.disk_data.forEach((disk) => {
          const key = String(disk.mountpoint || 'unknown')
          row[key] = Number(disk.percent || 0)
        })
      }
      return row
    })
  }, [mergedHistory])

  const diskKeys = useMemo(() => {
    const set = new Set()
    diskHistory.forEach((row) => {
      Object.keys(row).forEach((k) => {
        if (k !== 'timestamp') set.add(k)
      })
    })
    return Array.from(set)
  }, [diskHistory])

  const handleDelete = async () => {
    if (!id) return
    if (!window.confirm('Confermi la rimozione del nodo?')) return
    try {
      await deleteNodeMutation.mutateAsync(id)
      navigate('/', { replace: true })
    } catch {
      // error already surfaced via mutation state; could add a toast in future
    }
  }

  return (
    <div className="space-y-4">
      <DeviceHeader
        node={node}
        status={status}
        onDelete={handleDelete}
        deleting={deleteNodeMutation.isPending}
      />

      <DeviceKPIRow current={current} previous={previous} lastSeen={current?.timestamp} />

      <div className="flex items-center justify-between gap-3">
        <RangeSelector value={range} onChange={setRange} />
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">
          {mergedHistory.length} punti · range {range}
        </span>
      </div>

      <MetricChart
        title="CPU Usage (%)"
        data={mergedHistory}
        dataKey="cpu_percent"
        threshold={85}
        loading={historyLoading}
        height={220}
      />

      <MetricChart
        title="Memory Usage (%)"
        data={mergedHistory}
        dataKey="memory_percent"
        colors={['#3fb950']}
        threshold={85}
        loading={historyLoading}
        height={220}
      />

      <MetricChart
        title="Disk Usage per mount point (%)"
        data={diskHistory}
        multi
        dataKeys={diskKeys}
        threshold={85}
        loading={historyLoading}
        height={220}
        emptyMessage="Nessun mount point con dati nel range selezionato."
      />

      <DiskTable disks={current?.disk_data || []} />

      <AlertTable alerts={alerts} />
    </div>
  )
}
