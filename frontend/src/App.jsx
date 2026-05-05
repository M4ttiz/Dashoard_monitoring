import { Link, Route, Routes } from 'react-router-dom'

function Layout({ title, children }) {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <nav className="mx-auto flex max-w-5xl gap-4 px-6 py-4 text-sm">
        <Link to="/" className="rounded bg-slate-800 px-3 py-1 hover:bg-slate-700">
          Overview
        </Link>
        <Link to="/alerts" className="rounded bg-slate-800 px-3 py-1 hover:bg-slate-700">
          Alerts
        </Link>
      </nav>
      <section className="mx-auto max-w-5xl px-6 pb-10">
        <h1 className="mb-4 text-3xl font-semibold">{title}</h1>
        {children}
      </section>
    </main>
  )
}

function OverviewPage() {
  return <Layout title="MISAT Monitor">Dashboard overview route: `/`.</Layout>
}

function NodeDetailPage() {
  return <Layout title="Node Detail">Node detail route: `/nodes/:id`.</Layout>
}

function AlertsPage() {
  return <Layout title="Alert Center">Alerts route: `/alerts`.</Layout>
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<OverviewPage />} />
      <Route path="/nodes/:id" element={<NodeDetailPage />} />
      <Route path="/alerts" element={<AlertsPage />} />
    </Routes>
  )
}

export default App
