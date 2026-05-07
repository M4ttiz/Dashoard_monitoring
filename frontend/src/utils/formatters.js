export function formatPercent(value, digits = 1) {
  if (value == null || !Number.isFinite(Number(value))) return '—'
  return `${Number(value).toFixed(digits)}%`
}

export function formatGB(value, digits = 1) {
  if (value == null || !Number.isFinite(Number(value))) return '—'
  return `${Number(value).toFixed(digits)} GB`
}

export function formatBytes(bytes) {
  if (bytes == null || !Number.isFinite(Number(bytes))) return '—'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let n = Number(bytes)
  let i = 0
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024
    i += 1
  }
  return `${n.toFixed(n >= 100 || i === 0 ? 0 : 1)} ${units[i]}`
}

export function formatUptime(seconds) {
  if (seconds == null || !Number.isFinite(Number(seconds))) return '—'
  const total = Math.max(0, Math.floor(Number(seconds)))
  const days = Math.floor(total / 86400)
  const hours = Math.floor((total % 86400) / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export function formatTimestamp(value, options = {}) {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  const fmt = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: options.seconds ? '2-digit' : undefined,
    ...(options.full
      ? { year: 'numeric', month: '2-digit', day: '2-digit' }
      : {}),
  })
  return fmt.format(date)
}

export function formatRelative(value) {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  const delta = Math.max(0, Date.now() - date.getTime())
  const minutes = Math.floor(delta / 60_000)
  if (minutes < 1) return 'adesso'
  if (minutes < 60) return `${minutes}m fa`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h fa`
  const days = Math.floor(hours / 24)
  return `${days}g fa`
}

export function diskUsageMax(diskData) {
  if (!Array.isArray(diskData) || diskData.length === 0) return 0
  return diskData.reduce((max, disk) => {
    const v = Number(disk?.percent || 0)
    return Number.isFinite(v) && v > max ? v : max
  }, 0)
}
