import { useEffect, useRef, useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'

import AlertToast from './components/AlertToast.jsx'
import { useWebSocket } from './hooks/useWebSocket.js'
import Alerts from './pages/Alerts.jsx'
import NodeDetail from './pages/NodeDetail.jsx'
import Overview from './pages/Overview.jsx'
import { useStore } from './store/useStore.js'

function Layout({ title, isConnected, children }) {
  const unreadCount = useStore((s) => s.unreadCount)

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <nav className="mx-auto flex max-w-5xl gap-4 px-6 py-4 text-sm">
        <Link to="/" className="rounded bg-slate-800 px-3 py-1 hover:bg-slate-700">
          Overview
        </Link>
        <Link to="/alerts" className="relative rounded bg-slate-800 px-3 py-1 hover:bg-slate-700">
          Alerts
          {unreadCount > 0 ? (
            <span className="absolute -right-2 -top-2 inline-flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
              {unreadCount}
            </span>
          ) : null}
        </Link>

        <span className="ml-auto inline-flex items-center gap-2 text-slate-300">
          <span
            className={[
              'inline-block size-2 rounded-full',
              isConnected ? 'bg-emerald-400' : 'bg-slate-500',
            ].join(' ')}
          />
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </nav>
      <section className="mx-auto max-w-5xl px-6 pb-10">
        <h1 className="mb-4 text-3xl font-semibold">{title}</h1>
        {children}
      </section>
    </main>
  )
}

function OverviewPage({ isConnected }) {
  return (
    <Layout title="MISAT Monitor" isConnected={isConnected}>
      <Overview isConnected={isConnected} />
    </Layout>
  )
}

function NodeDetailPage({ isConnected }) {
  return (
    <Layout title="Node Detail" isConnected={isConnected}>
      <NodeDetail />
    </Layout>
  )
}

function AlertsPage({ isConnected }) {
  return (
    <Layout title="Alert Center" isConnected={isConnected}>
      <Alerts />
    </Layout>
  )
}

function App() {
  const fetchNodes = useStore((s) => s.fetchNodes)
  const fetchAlerts = useStore((s) => s.fetchAlerts)
  const handleWebSocketMessage = useStore((s) => s.handleWebSocketMessage)
  const nodes = useStore((s) => s.nodes)
  const { lastMessage, isConnected } = useWebSocket()
  const [toastAlert, setToastAlert] = useState(null)
  const toastTimeoutRef = useRef(null)

  useEffect(() => {
    void fetchNodes()
    void fetchAlerts()
  }, [fetchNodes, fetchAlerts])

  useEffect(() => {
    if (lastMessage == null) return
    void handleWebSocketMessage(lastMessage)
  }, [lastMessage, handleWebSocketMessage])

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
    <>
      <Routes>
        <Route path="/" element={<OverviewPage isConnected={isConnected} />} />
        <Route path="/nodes/:id" element={<NodeDetailPage isConnected={isConnected} />} />
        <Route path="/alerts" element={<AlertsPage isConnected={isConnected} />} />
      </Routes>
      <AlertToast alert={toastAlert} onClose={() => setToastAlert(null)} />
    </>
  )
}

export default App
