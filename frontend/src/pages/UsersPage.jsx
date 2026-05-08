import { useState } from 'react'
import { UserPlus } from 'lucide-react'

import StatusBadge from '../components/ui/StatusBadge.jsx'

const USERS = [
  { name: 'Paolo Rossi', email: 'paolo.rossi@acme.local', role: 'Admin', lastLogin: 'Today, 08:20', status: 'Active' },
  { name: 'Andrea Bianchi', email: 'andrea.bianchi@acme.local', role: 'Operator', lastLogin: 'Today, 07:55', status: 'Active' },
  { name: 'Marta Neri', email: 'marta.neri@acme.local', role: 'Viewer', lastLogin: 'Yesterday, 18:04', status: 'Active' },
  { name: 'Luca Verdi', email: 'luca.verdi@acme.local', role: 'Operator', lastLogin: '2 days ago', status: 'Inactive' },
  { name: 'Giulia Costa', email: 'giulia.costa@acme.local', role: 'Viewer', lastLogin: '5 days ago', status: 'Inactive' },
]

function roleStyle(role) {
  if (role === 'Admin') return 'border-purple-500/35 bg-purple-500/10 text-purple-300'
  if (role === 'Operator') return 'border-blue-500/35 bg-blue-500/10 text-blue-300'
  return 'border-bg-border bg-bg-elevated text-text-secondary'
}

export default function UsersPage() {
  const [showInvite, setShowInvite] = useState(false)
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'Viewer' })

  const handleChange = (field, value) => setInviteForm((prev) => ({ ...prev, [field]: value }))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Users</h1>
          <p className="mt-1 text-sm text-text-secondary">Manage access to the monitoring dashboard</p>
        </div>
        <button
          type="button"
          onClick={() => setShowInvite(true)}
          className="inline-flex items-center gap-2 rounded-[4px] border border-accent bg-accent-dim px-3 py-2 text-sm text-accent"
        >
          <UserPlus className="size-4" /> Invite User
        </button>
      </div>

      <section className="overflow-x-auto rounded-[4px] border border-bg-border bg-bg-surface">
        <table className="min-w-full text-sm">
          <thead className="bg-bg-elevated text-xs uppercase text-text-muted">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Last Login</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {USERS.map((user) => (
              <tr key={user.email} className="border-t border-bg-border text-text-primary">
                <td className="px-4 py-3">{user.name}</td>
                <td className="px-4 py-3 text-text-secondary">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-[4px] border px-2 py-1 text-xs font-semibold ${roleStyle(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-secondary">{user.lastLogin}</td>
                <td className="px-4 py-3">
                  <StatusBadge
                    status={user.status === 'Active' ? 'ok' : 'unknown'}
                    label={user.status}
                    size="sm"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button type="button" className="rounded-[4px] border border-bg-border px-2 py-1 text-xs hover:bg-bg-elevated">
                      Edit
                    </button>
                    <button type="button" className="rounded-[4px] border border-bg-border px-2 py-1 text-xs text-text-secondary hover:bg-bg-elevated">
                      Deactivate
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {showInvite ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-base/70 p-4">
          <div className="w-full max-w-md rounded-[4px] border border-bg-border bg-bg-surface p-4">
            <h2 className="text-base font-semibold text-text-primary">Invite User</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label htmlFor="invite-name" className="mb-1 block text-xs text-text-secondary">Name</label>
                <input
                  id="invite-name"
                  type="text"
                  value={inviteForm.name}
                  onChange={(event) => handleChange('name', event.target.value)}
                  className="w-full rounded-[4px] border border-bg-border bg-bg-elevated px-3 py-2 text-sm text-text-primary"
                />
              </div>
              <div>
                <label htmlFor="invite-email" className="mb-1 block text-xs text-text-secondary">Email</label>
                <input
                  id="invite-email"
                  type="email"
                  value={inviteForm.email}
                  onChange={(event) => handleChange('email', event.target.value)}
                  className="w-full rounded-[4px] border border-bg-border bg-bg-elevated px-3 py-2 text-sm text-text-primary"
                />
              </div>
              <div>
                <label htmlFor="invite-role" className="mb-1 block text-xs text-text-secondary">Role</label>
                <select
                  id="invite-role"
                  value={inviteForm.role}
                  onChange={(event) => handleChange('role', event.target.value)}
                  className="w-full rounded-[4px] border border-bg-border bg-bg-elevated px-3 py-2 text-sm text-text-primary"
                >
                  <option value="Admin">Admin</option>
                  <option value="Operator">Operator</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowInvite(false)}
                className="rounded-[4px] border border-bg-border px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setShowInvite(false)}
                className="rounded-[4px] border border-accent bg-accent-dim px-3 py-2 text-sm text-accent"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
