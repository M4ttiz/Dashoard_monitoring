export function Skeleton({ className = '' }) {
  return <div aria-hidden className={`animate-pulse rounded bg-slate-700/70 ${className}`} />
}

