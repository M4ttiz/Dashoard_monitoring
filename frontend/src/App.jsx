import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'

import AlertToast from './components/AlertToast.jsx'
import { ErrorBoundary } from './components/ui/ErrorBoundary.jsx'
import { usePolling } from './hooks/usePolling.js'
import { useWebSocket } from './hooks/useWebSocket.js'
import { useStore } from './store/useDashboardStore.js'

const Alerts = lazy(() => import('./pages/Alerts.jsx'))
const Overview = lazy(() => import('./pages/Overview.jsx'))
const NodeDetail = lazy(() => import('./pages/NodeDetail.jsx'))

function Layout({ title, children }) {
  const alerts = useStore((s) => s.alerts)
  const fetchStatus = useStore((s) => s.fetchStatus)
  const ui = useStore((s) => s.ui)
  const setTheme = useStore((s) => s.setTheme)
  const unreadCount = useMemo(() => alerts.filter((a) => !a.is_read).length, [alerts])
  const isConnected = useStore((s) => s.connection.isConnected)
  const mode = useStore((s) => s.connection.mode)

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <nav className="sticky top-0 z-40 mx-auto flex max-w-6xl items-center gap-3 border-b border-slate-800 bg-slate-950/95 px-6 py-4 text-sm backdrop-blur">
        <Link to="/" className="rounded bg-slate-800 px-3 py-1 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400">
          Overview
        </Link>
        <Link to="/alerts" className="relative rounded bg-slate-800 px-3 py-1 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400">
          Alerts
          {unreadCount > 0 ? (
            <span className="absolute -right-2 -top-2 inline-flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
              {unreadCount}
            </span>
          ) : null}
        </Link>
        <span className="ml-2 text-xs text-slate-400">Last update: {fetchStatus.lastUpdated ? new Date(fetchStatus.lastUpdated).toLocaleTimeString() : 'n/a'}</span>

        <span className="ml-auto inline-flex items-center gap-2 text-slate-300">
          <span
            className={[
              'inline-block size-2 rounded-full',
              isConnected ? 'bg-emerald-400' : mode === 'polling' ? 'bg-yellow-400' : 'bg-red-500',
            ].join(' ')}
          />
          {isConnected ? `Connected (${mode})` : 'Disconnected'}
        </span>
        <button
          type="button"
          onClick={() => setTheme(ui.theme === 'dark' ? 'light' : 'dark')}
          className="rounded bg-slate-800 px-3 py-1"
        >
          {ui.theme === 'dark' ? 'Dark' : 'Light'}
        </button>
      </nav>
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <h1 className="mb-4 text-3xl font-semibold">{title}</h1>
        {children}
      </section>
    </main>
  )
}

function App() {
  const fetchAll = useStore((s) => s.fetchAll)
  const ingestRealtimeMessage = useStore((s) => s.ingestRealtimeMessage)
  const setConnection = useStore((s) => s.setConnection)
  const nodes = useStore((s) => s.nodes)
  const theme = useStore((s) => s.ui.theme)
  const { lastMessage, isConnected, latencyMs } = useWebSocket()
  const [toastAlert, setToastAlert] = useState(null)
  const toastTimeoutRef = useRef(null)

  useEffect(() => {
    void fetchAll()
  }, [fetchAll])
  usePolling(() => fetchAll(), { intervalMs: 10000, retries: 4 })

  useEffect(() => {
    setConnection({ isConnected, mode: isConnected ? 'websocket' : 'polling' })
  }, [isConnected, setConnection])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    if (lastMessage == null) return
    ingestRealtimeMessage(lastMessage)
  }, [lastMessage, ingestRealtimeMessage])

  useEffect(() => {
    if (!lastMessage || lastMessage.type !== 'new_alert' || !lastMessage.alert) return

    const nodeName = nodes.find((n) => n.id === lastMessage.alert.node_id)?.name
    window.setTimeout(() => {
      setToastAlert({
        ...lastMessage.alert,
        node_name: nodeName,
      })
    }, 0)

    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current)
    }
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastAlert(null)
      toastTimeoutRef.current = null
    }, 5000)
  }, [lastMessage, nodes])

  useEffect(
    () => () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current)
      }
    },
    [],
  )

  return (
    <ErrorBoundary>
      <Routes>
        <Route
          path="/"
          element={
            <Layout title={`MISAT Monitor${latencyMs != null ? ` - ${latencyMs}ms` : ''}`}>
              <Suspense fallback={<div className="text-sm text-slate-400">Loading overview...</div>}>
                <Overview isConnected={isConnected} />
              </Suspense>
            </Layout>
          }
        />
        <Route
          path="/server/:id"
          element={
            <Layout title="Node Detail">
              <Suspense fallback={<div className="text-sm text-slate-400">Loading node detail...</div>}>
                <NodeDetail />
              </Suspense>
            </Layout>
          }
        />
        <Route
          path="/alerts"
          element={
            <Layout title="Alert Center">
              <Suspense fallback={<div className="text-sm text-slate-400">Loading alerts...</div>}>
                <Alerts />
              </Suspense>
            </Layout>
          }
        />
      </Routes>
      <AlertToast alert={toastAlert} onClose={() => setToastAlert(null)} />
    </ErrorBoundary>
  )
}

export default App
