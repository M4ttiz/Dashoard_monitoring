export default function Spinner({ size = 16, className = '' }) {
  return (
    <span
      role="status"
      aria-label="Caricamento"
      className={`inline-block animate-spin rounded-full border-2 border-bg-border border-t-accent ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
