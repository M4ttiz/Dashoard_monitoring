export default function SimplePlaceholderPage({ title, subtitle = 'Coming soon' }) {
  return (
    <div className="space-y-3">
      <h1 className="font-mono text-xl font-semibold text-text-primary">{title}</h1>
      <section className="panel-soft rounded-xl p-6">
        <p className="font-mono text-sm text-text-secondary">{subtitle}</p>
      </section>
    </div>
  )
}
