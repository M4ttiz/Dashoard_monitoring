import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import ToastStack from './components/ui/AlertToast.jsx'
import Spinner from './components/ui/Spinner.jsx'
import PageShell from './components/layout/PageShell.jsx'
import { useWebSocket } from './hooks/useWebSocket.js'
import FleetOverview from './pages/FleetOverview.jsx'

const DeviceDetail = lazy(() => import('./pages/DeviceDetail.jsx'))
const AlertCenter = lazy(() => import('./pages/AlertCenter.jsx'))
const ConfigPage = lazy(() => import('./pages/ConfigPage.jsx'))
const ServicesPage = lazy(() => import('./pages/ServicesPage.jsx'))
const MapsPage = lazy(() => import('./pages/MapsPage.jsx'))
const DashboardsPage = lazy(() => import('./pages/DashboardsPage.jsx'))
const UsersPage = lazy(() => import('./pages/UsersPage.jsx'))
const RolesPage = lazy(() => import('./pages/RolesPage.jsx'))
const MetricsPage = lazy(() => import('./pages/MetricsPage.jsx'))
const TrendsPage = lazy(() => import('./pages/TrendsPage.jsx'))
const ReportsPage = lazy(() => import('./pages/ReportsPage.jsx'))
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx'))
const IntegrationsPage = lazy(() => import('./pages/IntegrationsPage.jsx'))

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
          <Route path="/config" element={<ConfigPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/maps" element={<MapsPage />} />
          <Route path="/dashboards" element={<DashboardsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/metrics" element={<MetricsPage />} />
          <Route path="/trends" element={<TrendsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/integrations" element={<IntegrationsPage />} />
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
