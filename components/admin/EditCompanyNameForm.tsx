'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EditCompanyNameForm({
  companyId,
  initialName
}: {
  companyId: string
  initialName: string
}) {
  const router = useRouter()
  const [name, setName] = useState(initialName)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim() || saving) return

    setSaving(true)
    setMessage(null)

    const response = await fetch(`/api/admin/companies/${companyId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() })
    })

    const payload = (await response.json()) as { error?: string }
    if (!response.ok) {
      setMessage(payload.error ?? 'Unable to update company name.')
      setSaving(false)
      return
    }

    setMessage('Company name updated.')
    setSaving(false)
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="mt-4 flex flex-wrap items-end gap-2">
      <label className="text-sm text-slate-700">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Edit company name</span>
        <input
          value={name}
          onChange={event => setName(event.target.value)}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
        />
      </label>
      <button
        type="submit"
        disabled={saving || !name.trim()}
        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save Name'}
      </button>
      {message && <p className="text-xs text-slate-500">{message}</p>}
    </form>
  )
}
