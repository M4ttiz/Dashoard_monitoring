import { useState } from 'react'

const TABS = ['General', 'Notifications', 'Thresholds', 'Monitoring', 'Appearance']

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('General')
  const [notifications, setNotifications] = useState({
    email: true,
    slack: false,
    teams: false,
    telegram: false,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Settings</h1>
        <p className="mt-1 text-sm text-text-secondary">Configure your monitoring environment</p>
      </div>

      <section className="rounded-[4px] border border-bg-border bg-bg-surface">
        <div className="flex flex-wrap gap-2 border-b border-bg-border p-3">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-[4px] px-3 py-2 text-sm ${
                activeTab === tab
                  ? 'bg-accent-dim text-accent'
                  : 'bg-bg-elevated text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-4">
          {activeTab === 'General' ? (
            <div className="space-y-3">
              <div>
                <label htmlFor="org-name" className="mb-1 block text-xs text-text-secondary">Organization name</label>
                <input id="org-name" type="text" defaultValue="Acme IT" className="w-full rounded-[4px] border border-bg-border bg-bg-elevated px-3 py-2 text-sm text-text-primary" />
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <label htmlFor="timezone" className="mb-1 block text-xs text-text-secondary">Timezone</label>
                  <select id="timezone" className="w-full rounded-[4px] border border-bg-border bg-bg-elevated px-3 py-2 text-sm text-text-primary">
                    <option>Europe/Rome</option>
                    <option>UTC</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="language" className="mb-1 block text-xs text-text-secondary">Language</label>
                  <select id="language" className="w-full rounded-[4px] border border-bg-border bg-bg-elevated px-3 py-2 text-sm text-text-primary">
                    <option>English</option>
                    <option>Italiano</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="refresh" className="mb-1 block text-xs text-text-secondary">Refresh interval</label>
                  <select id="refresh" className="w-full rounded-[4px] border border-bg-border bg-bg-elevated px-3 py-2 text-sm text-text-primary">
                    <option>30s</option>
                    <option>1m</option>
                    <option>5m</option>
                    <option>10m</option>
                  </select>
                </div>
              </div>
              <button type="button" className="rounded-[4px] border border-accent bg-accent-dim px-3 py-2 text-sm text-accent">Save Changes</button>
            </div>
          ) : null}

          {activeTab === 'Notifications' ? (
            <div className="space-y-3">
              {Object.entries(notifications).map(([key, enabled]) => (
                <div key={key} className="rounded-[4px] border border-bg-border bg-bg-elevated p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold capitalize text-text-primary">{key}</p>
                    <button
                      type="button"
                      onClick={() => setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))}
                      className={`rounded-[4px] px-2 py-1 text-xs ${enabled ? 'bg-status-ok/15 text-status-ok' : 'bg-bg-surface text-text-secondary'}`}
                    >
                      {enabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  {enabled ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <input type="text" placeholder="Endpoint / Webhook" className="min-w-[220px] flex-1 rounded-[4px] border border-bg-border bg-bg-surface px-3 py-2 text-sm text-text-primary" />
                      <button type="button" className="rounded-[4px] border border-bg-border px-3 py-2 text-sm text-text-secondary">Test</button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === 'Thresholds' ? (
            <div className="grid gap-3 md:grid-cols-2">
              {[
                ['CPU Warning (%)', 75],
                ['CPU Critical (%)', 90],
                ['RAM Warning (%)', 70],
                ['RAM Critical (%)', 85],
                ['Disk Warning (%)', 80],
                ['Disk Critical (%)', 92],
                ['Alert repeat interval (minutes)', 15],
              ].map(([label, value]) => (
                <div key={label}>
                  <label className="mb-1 block text-xs text-text-secondary">{label}</label>
                  <input type="number" defaultValue={value} className="w-full rounded-[4px] border border-bg-border bg-bg-elevated px-3 py-2 text-sm text-text-primary" />
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === 'Monitoring' ? (
            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <label htmlFor="check-interval" className="mb-1 block text-xs text-text-secondary">Check interval</label>
                  <select id="check-interval" className="w-full rounded-[4px] border border-bg-border bg-bg-elevated px-3 py-2 text-sm text-text-primary">
                    <option>30s</option>
                    <option>1m</option>
                    <option>5m</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="timeout" className="mb-1 block text-xs text-text-secondary">Timeout (s)</label>
                  <input id="timeout" type="number" defaultValue={10} className="w-full rounded-[4px] border border-bg-border bg-bg-elevated px-3 py-2 text-sm text-text-primary" />
                </div>
                <div>
                  <label htmlFor="retries" className="mb-1 block text-xs text-text-secondary">Retries</label>
                  <input id="retries" type="number" defaultValue={3} className="w-full rounded-[4px] border border-bg-border bg-bg-elevated px-3 py-2 text-sm text-text-primary" />
                </div>
              </div>
              <div>
                <label htmlFor="excluded-hosts" className="mb-1 block text-xs text-text-secondary">Excluded hosts</label>
                <textarea id="excluded-hosts" rows={3} defaultValue={'legacy-lab-01\nold-kiosk-07'} className="w-full rounded-[4px] border border-bg-border bg-bg-elevated px-3 py-2 text-sm text-text-primary" />
              </div>
            </div>
          ) : null}

          {activeTab === 'Appearance' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-[4px] border border-bg-border bg-bg-elevated p-3">
                <span className="text-sm text-text-primary">Dark mode</span>
                <button type="button" className="rounded-[4px] bg-status-ok/15 px-2 py-1 text-xs text-status-ok">ON</button>
              </div>
              <div>
                <p className="mb-2 text-xs text-text-secondary">Accent color</p>
                <div className="flex gap-2">
                  {['bg-blue-500', 'bg-cyan-500', 'bg-purple-500', 'bg-emerald-500', 'bg-orange-500'].map((tone) => (
                    <button key={tone} type="button" className={`size-7 rounded-full border border-bg-border ${tone}`} aria-label={tone} />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between rounded-[4px] border border-bg-border bg-bg-elevated p-3">
                <span className="text-sm text-text-primary">Sidebar collapsed by default</span>
                <button type="button" className="rounded-[4px] bg-bg-surface px-2 py-1 text-xs text-text-secondary">OFF</button>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
