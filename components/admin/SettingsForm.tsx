'use client'

import { FormEvent, useState } from 'react'

type Settings = {
  stripePublishableKey: string
  stripeWebhookEnabled: boolean
  smtpHost: string
  smtpPort: string
  smtpFromEmail: string
  smtpUsername: string
  smtpPassword: string
  quoteEmailSubject: string
  quoteEmailBody: string
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
    <form onSubmit={save} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-slate-900">Configuration</h2>
        <p className="text-sm text-slate-500">Manage core credentials and communication defaults.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Stripe publishable key</span>
          <input
            placeholder="pk_live_..."
            value={form.stripePublishableKey}
            onChange={e => setForm(prev => ({ ...prev, stripePublishableKey: e.target.value }))}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-slate-900"
          />
        </label>

        <label className="mt-7 inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 md:mt-0">
          <input
            type="checkbox"
            checked={form.stripeWebhookEnabled}
            onChange={e => setForm(prev => ({ ...prev, stripeWebhookEnabled: e.target.checked }))}
            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
          />
          Stripe webhook enabled
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">SMTP host</span>
          <input
            placeholder="smtp.resend.com"
            value={form.smtpHost}
            onChange={e => setForm(prev => ({ ...prev, smtpHost: e.target.value }))}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-slate-900"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">SMTP port</span>
          <input
            placeholder="587"
            value={form.smtpPort}
            onChange={e => setForm(prev => ({ ...prev, smtpPort: e.target.value }))}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-slate-900"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">SMTP from email</span>
          <input
            placeholder="billing@company.com"
            value={form.smtpFromEmail}
            onChange={e => setForm(prev => ({ ...prev, smtpFromEmail: e.target.value }))}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-slate-900"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">SMTP username</span>
          <input
            placeholder="smtp-user"
            value={form.smtpUsername}
            onChange={e => setForm(prev => ({ ...prev, smtpUsername: e.target.value }))}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-slate-900"
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">SMTP password</span>
          <input
            type="password"
            placeholder="••••••••"
            value={form.smtpPassword}
            onChange={e => setForm(prev => ({ ...prev, smtpPassword: e.target.value }))}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-slate-900"
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Quote email subject</span>
          <input
            placeholder="Quote {{quote_number}} is ready"
            value={form.quoteEmailSubject}
            onChange={e => setForm(prev => ({ ...prev, quoteEmailSubject: e.target.value }))}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-slate-900"
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Quote email body template</span>
          <textarea
            rows={6}
            placeholder={"Hello,\n\nQuote {{quote_number}} is ready.\nPortal: {{portal_url}}"}
            value={form.quoteEmailBody}
            onChange={e => setForm(prev => ({ ...prev, quoteEmailBody: e.target.value }))}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none ring-0 transition focus:border-slate-900"
          />
          <p className="text-xs text-slate-500">Variables: {'{{quote_number}}'}, {'{{company_name}}'}, {'{{portal_url}}'}</p>
        </label>
      </div>

      {message && (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">{message}</p>
      )}

      <button
        className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={saving}
      >
        {saving ? 'Saving…' : 'Save settings'}
      </button>
    </form>
  )
}
