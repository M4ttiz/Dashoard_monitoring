import { useState } from 'react'

import Navbar from './Navbar.jsx'
import Sidebar from './Sidebar.jsx'

export default function PageShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      <Navbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
      <div className="relative flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="relative min-w-0 flex-1 px-3 py-4 sm:px-4 lg:px-6">
          {children}
        </main>
      </div>
    </div>
  )
}
