import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import ToastStack from './components/ui/AlertToast.jsx'
import Spinner from './components/ui/Spinner.jsx'
import PageShell from './components/layout/PageShell.jsx'
import { useWebSocket } from './hooks/useWebSocket.js'
import FleetOverview from './pages/FleetOverview.jsx'
import HostsPage from './pages/HostsPage.jsx'
import InventoryPage from './pages/InventoryPage.jsx'
import MapsPage from './pages/MapsPage.jsx'
import MetricsPage from './pages/MetricsPage.jsx'
import TrendsPage from './pages/TrendsPage.jsx'
import ReportsPage from './pages/ReportsPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import IntegrationsPage from './pages/IntegrationsPage.jsx'

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
          <Route path="/hosts" element={<HostsPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/devices/:id" element={<DeviceDetail />} />
          <Route path="/alerts" element={<AlertCenter />} />
          <Route path="/maps" element={<MapsPage />} />
          <Route path="/metrics" element={<MetricsPage />} />
          <Route path="/trends" element={<TrendsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/integrations" element={<IntegrationsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <ToastStack />
    </PageShell>
  )
}

