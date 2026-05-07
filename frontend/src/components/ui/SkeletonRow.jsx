export default function SkeletonRow({ columns = 8, height = 48 }) {
  return (
    <div
      className="flex animate-pulse items-center gap-3 border-b border-bg-border/40 px-4"
      style={{ height }}
    >
      {Array.from({ length: columns }).map((_, idx) => (
        <div
          key={idx}
          className="h-3 rounded bg-bg-elevated"
          style={{
            width: idx === 0 ? '20%' : idx === columns - 1 ? '8%' : `${10 + ((idx * 7) % 12)}%`,
          }}
        />
      ))}
    </div>
  )
}
