import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import ToastStack from './components/ui/AlertToast.jsx'
import Spinner from './components/ui/Spinner.jsx'
import PageShell from './components/layout/PageShell.jsx'
import { useWebSocket } from './hooks/useWebSocket.js'
import FleetOverview from './pages/FleetOverview.jsx'

const DeviceDetail = lazy(() => import('./pages/DeviceDetail.jsx'))
const AlertCenter = lazy(() => import('./pages/AlertCenter.jsx'))

function PageFallback() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Spinner size={24} />
    </div>
  )
}

export default function App() {
  useWebSocket()

  return (
    <PageShell>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<FleetOverview />} />
          <Route path="/devices/:id" element={<DeviceDetail />} />
          <Route path="/alerts" element={<AlertCenter />} />
          {/* Backwards compat with prompt-10 routes */}
          <Route path="/nodes/:id" element={<LegacyNodeRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <ToastStack />
    </PageShell>
  )
}

function LegacyNodeRedirect() {
  const id = window.location.pathname.split('/').pop()
  return <Navigate to={`/devices/${id}`} replace />
}
