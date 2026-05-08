import { useEffect, useMemo, useState } from 'react'

import Spinner from '../components/ui/Spinner.jsx'

function fieldType(value) {
  return typeof value === 'number' ? 'number' : 'text'
}

export default function SettingsPage() {
  const [config, setConfig] = useState(null)
  const [formState, setFormState] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState(null)

  useEffect(() => {
    fetch('/api/config')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        setConfig(data && typeof data === 'object' ? data : {})
        setFormState(data && typeof data === 'object' ? data : {})
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false))
  }, [])

  const fields = useMemo(() => Object.entries(formState), [formState])

  const handleChange = (key, type, rawValue) => {
    setFormState((prev) => ({
      ...prev,
      [key]: type === 'number' ? Number(rawValue) : rawValue,
    }))
  }

  const handleSave = (event) => {
    event.preventDefault()
    setSaving(true)
    setSaveMessage(null)
    fetch('/api/config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formState),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((saved) => {
        setConfig(saved && typeof saved === 'object' ? saved : formState)
        setFormState(saved && typeof saved === 'object' ? saved : formState)
        setSaveMessage({ type: 'success', text: 'Settings saved' })
        window.setTimeout(() => setSaveMessage(null), 3000)
      })
      .catch(() => setSaveMessage({ type: 'error', text: 'Save failed' }))
      .finally(() => setSaving(false))
  }

  if (loading) return <Spinner />
  if (error) return <p className="text-red-400">Errore: {error}</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Settings</h1>
        <p className="mt-1 text-sm text-text-secondary">Monitoring configuration</p>
      </div>

      {saveMessage ? (
        <div
          className={`rounded-[4px] border px-4 py-3 text-sm ${
            saveMessage.type === 'success'
              ? 'border-status-ok/40 bg-status-ok/10 text-status-ok'
              : 'border-status-critical/40 bg-status-critical/10 text-status-critical'
          }`}
        >
          {saveMessage.text}
        </div>
      ) : null}

      <form onSubmit={handleSave} className="space-y-4 rounded-[4px] border border-bg-border bg-bg-surface p-4">
        {fields.map(([key, value]) => {
          const type = fieldType(config?.[key])
          return (
            <label key={key} className="block space-y-1">
              <span className="text-xs uppercase tracking-wide text-text-muted">{key}</span>
              <input
                type={type}
                value={value ?? ''}
                onChange={(e) => handleChange(key, type, e.target.value)}
                className="w-full rounded-[4px] border border-bg-border bg-bg-elevated px-3 py-2 text-sm text-text-primary"
              />
            </label>
          )
        })}

        <div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-[4px] border border-accent/40 bg-accent/15 px-4 py-2 text-sm font-semibold text-accent disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}
