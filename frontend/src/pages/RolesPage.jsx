import { Check, X } from 'lucide-react'

const PERMISSIONS = [
  'View Dashboard',
  'Manage Hosts',
  'Acknowledge Alerts',
  'Edit Settings',
  'Manage Users',
  'Export Reports',
]

const ROLES = [
  {
    name: 'Admin',
    users: 1,
    tone: 'border-purple-500/35 bg-purple-500/10 text-purple-300',
    allowed: PERMISSIONS,
  },
  {
    name: 'Operator',
    users: 2,
    tone: 'border-blue-500/35 bg-blue-500/10 text-blue-300',
    allowed: ['View Dashboard', 'Manage Hosts', 'Acknowledge Alerts', 'Export Reports'],
  },
  {
    name: 'Viewer',
    users: 2,
    tone: 'border-bg-border bg-bg-elevated text-text-secondary',
    allowed: ['View Dashboard', 'Export Reports'],
  },
]

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Roles &amp; Permissions</h1>
        <p className="mt-1 text-sm text-text-secondary">Define what each role can see and do</p>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        {ROLES.map((role) => (
          <article key={role.name} className="rounded-[4px] border border-bg-border bg-bg-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className={`inline-flex rounded-[4px] border px-2 py-1 text-xs font-semibold ${role.tone}`}>
                {role.name}
              </span>
              <span className="text-xs text-text-secondary">{role.users} users</span>
            </div>

            <ul className="space-y-2 text-sm">
              {PERMISSIONS.map((permission) => {
                const enabled = role.allowed.includes(permission)
                return (
                  <li key={`${role.name}-${permission}`} className="flex items-center justify-between">
                    <span className="text-text-secondary">{permission}</span>
                    {enabled ? (
                      <Check className="size-4 text-status-ok" aria-label="Allowed" />
                    ) : (
                      <X className="size-4 text-text-muted" aria-label="Denied" />
                    )}
                  </li>
                )
              })}
            </ul>

            <button
              type="button"
              onClick={() => window.alert('Coming soon')}
              className="mt-4 w-full rounded-[4px] border border-bg-border px-3 py-2 text-sm text-text-primary hover:bg-bg-elevated"
            >
              Edit Role
            </button>
          </article>
        ))}
      </section>

      <p className="text-sm text-text-muted">Contact your administrator to request permission changes</p>
    </div>
  )
}
