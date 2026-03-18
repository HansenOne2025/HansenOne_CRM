'use client'

import { FormEvent, useState } from 'react'

type Settings = {
  stripePublishableKey: string
  stripeWebhookEnabled: boolean
  smtpHost: string
  smtpPort: string
  smtpFromEmail: string
  quoteEmailSubject: string
}

export default function SettingsForm({ initial }: { initial: Settings }) {
  const [form, setForm] = useState(initial)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const save = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })

    setSaving(false)
    if (!res.ok) {
      const data = await res.json()
      setMessage(data.error ?? 'Could not save settings')
      return
    }

    setMessage('Settings saved')
  }

  return (
    <form onSubmit={save} className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">System settings</h2>

      <div className="grid gap-3 md:grid-cols-2">
        <input
          placeholder="Stripe publishable key"
          value={form.stripePublishableKey}
          onChange={e => setForm(prev => ({ ...prev, stripePublishableKey: e.target.value }))}
          className="rounded-xl border px-3 py-2"
        />
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.stripeWebhookEnabled}
            onChange={e => setForm(prev => ({ ...prev, stripeWebhookEnabled: e.target.checked }))}
          />
          Stripe webhook enabled
        </label>
        <input
          placeholder="SMTP host"
          value={form.smtpHost}
          onChange={e => setForm(prev => ({ ...prev, smtpHost: e.target.value }))}
          className="rounded-xl border px-3 py-2"
        />
        <input
          placeholder="SMTP port"
          value={form.smtpPort}
          onChange={e => setForm(prev => ({ ...prev, smtpPort: e.target.value }))}
          className="rounded-xl border px-3 py-2"
        />
        <input
          placeholder="SMTP from email"
          value={form.smtpFromEmail}
          onChange={e => setForm(prev => ({ ...prev, smtpFromEmail: e.target.value }))}
          className="rounded-xl border px-3 py-2"
        />
        <input
          placeholder="Quote email subject"
          value={form.quoteEmailSubject}
          onChange={e => setForm(prev => ({ ...prev, quoteEmailSubject: e.target.value }))}
          className="rounded-xl border px-3 py-2"
        />
      </div>

      {message && <p className="text-sm text-slate-600">{message}</p>}

      <button className="rounded-xl bg-slate-900 px-4 py-2 text-white" disabled={saving}>
        {saving ? 'Saving…' : 'Save settings'}
      </button>
    </form>
  )
}
