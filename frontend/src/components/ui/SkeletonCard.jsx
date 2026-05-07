export default function SkeletonCard({ height = 96 }) {
  return (
    <div
      className="animate-pulse rounded-lg border border-bg-border bg-bg-surface p-4"
      style={{ height }}
    >
      <div className="mb-3 h-3 w-1/3 rounded bg-bg-elevated" />
      <div className="mb-2 h-5 w-1/2 rounded bg-bg-elevated" />
      <div className="h-3 w-1/4 rounded bg-bg-elevated" />
    </div>
  )
}
