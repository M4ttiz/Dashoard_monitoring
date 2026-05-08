import { useState } from 'react'
import { Cable } from 'lucide-react'

import StatusBadge from '../components/ui/StatusBadge.jsx'

const INTEGRATIONS = [
  {
    id: 'email',
    name: 'Email (SMTP)',
    description: 'Send alerts via SMTP server',
    fields: ['Host', 'Port', 'Username', 'Password', 'From address'],
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Push alerts to Slack channels',
    fields: ['Webhook URL'],
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    description: 'Send alert cards to Teams channels',
    fields: ['Webhook URL'],
  },
  {
    id: 'telegram',
    name: 'Telegram',
    description: 'Notify Telegram chats in real time',
    fields: ['Bot token', 'Chat ID'],
  },
  {
    id: 'grafana',
    name: 'Grafana',
    description: 'Publish metrics and dashboards to Grafana',
    fields: ['Instance URL', 'API key'],
  },
  {
    id: 'ad',
    name: 'Active Directory',
    description: 'Sync users and groups from LDAP/AD',
    fields: ['LDAP server', 'Base DN', 'Bind user', 'Bind password'],
  },
]

export default function IntegrationsPage() {
  const [enabled, setEnabled] = useState({
    email: true,
    slack: false,
    teams: false,
    telegram: false,
    grafana: false,
    ad: false,
  })

  const toggle = (id) => setEnabled((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Integrations</h1>
        <p className="mt-1 text-sm text-text-secondary">Connect external services and tools</p>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        {INTEGRATIONS.map((integration) => {
          const isOn = enabled[integration.id]
          return (
            <article key={integration.id} className="rounded-[4px] border border-bg-border bg-bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <Cable className="size-4 text-accent" />
                    <h2 className="text-sm font-semibold text-text-primary">{integration.name}</h2>
                  </div>
                  <p className="text-sm text-text-secondary">{integration.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(integration.id)}
                  className={`rounded-[4px] px-2 py-1 text-xs ${
                    isOn ? 'bg-status-ok/15 text-status-ok' : 'bg-bg-elevated text-text-secondary'
                  }`}
                >
                  {isOn ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="mt-3">
                <StatusBadge
                  status={isOn ? 'ok' : 'unknown'}
                  label={isOn ? 'Connected' : 'Not configured'}
                  size="sm"
                />
              </div>

              {isOn ? (
                <div className="mt-3 space-y-2">
                  {integration.fields.map((field) => (
                    <div key={field}>
                      <label className="mb-1 block text-xs text-text-secondary">{field}</label>
                      <input
                        type={field.toLowerCase().includes('password') ? 'password' : 'text'}
                        className="w-full rounded-[4px] border border-bg-border bg-bg-elevated px-3 py-2 text-sm text-text-primary"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => window.alert(`${integration.name} test sent`)}
                    className="rounded-[4px] border border-accent bg-accent-dim px-3 py-2 text-sm text-accent"
                  >
                    Save &amp; Test
                  </button>
                </div>
              ) : null}
            </article>
          )
        })}
      </section>
    </div>
  )
}
