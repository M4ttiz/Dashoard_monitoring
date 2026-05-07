import { useState } from 'react'

import Navbar from './Navbar.jsx'
import Sidebar from './Sidebar.jsx'

export default function PageShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      <Navbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
      <div className="relative flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_300px_at_50%_-20%,rgba(56,139,253,0.08),transparent_70%)]"
        />
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="relative min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
