export const WARNING_THRESHOLD = 70
export const CRITICAL_THRESHOLD = 85

export function statusFromValue(value, opts = {}) {
  const warn = opts.warning ?? WARNING_THRESHOLD
  const crit = opts.critical ?? CRITICAL_THRESHOLD
  const v = Number(value)
  if (!Number.isFinite(v)) return 'unknown'
  if (v >= crit) return 'critical'
  if (v >= warn) return 'warning'
  return 'ok'
}

export function statusFromNode(node, currentMetric) {
  if (!node) return 'unknown'
  if (node.status === 'offline' || node.is_active === false) return 'down'

  if (!currentMetric) return 'unknown'
  const cpu = statusFromValue(currentMetric.cpu_percent)
  const mem = statusFromValue(currentMetric.memory_percent)
  const diskMax = Math.max(
    0,
    ...((Array.isArray(currentMetric.disk_data) ? currentMetric.disk_data : [])
      .map((d) => Number(d?.percent) || 0)),
  )
  const disk = statusFromValue(diskMax)
  if ([cpu, mem, disk].includes('critical')) return 'critical'
  if ([cpu, mem, disk].includes('warning')) return 'warning'
  return 'ok'
}

export function statusRank(status) {
  switch (status) {
    case 'critical':
      return 0
    case 'warning':
      return 1
    case 'down':
      return 2
    case 'unknown':
      return 3
    case 'ok':
    default:
      return 4
  }
}

export const STATUS_LABEL = {
  ok: 'OK',
  warning: 'Warning',
  critical: 'Critical',
  down: 'Down',
  unknown: 'Unknown',
}

export const STATUS_COLOR_VAR = {
  ok: 'var(--color-status-ok)',
  warning: 'var(--color-status-warning)',
  critical: 'var(--color-status-critical)',
  down: 'var(--color-status-unknown)',
  unknown: 'var(--color-status-unknown)',
}
