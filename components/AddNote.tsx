'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddNote({ companyId }: { companyId: string }) {
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const add = async () => {
    const trimmed = content.trim()
    if (!trimmed || saving) return

    setSaving(true)
    setError(null)

    const response = await fetch('/api/admin/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: trimmed,
        companyId
      })
    })

    const payload = (await response.json()) as { id?: string; error?: string }
    if (!response.ok || !payload.id) {
      setError(payload.error ?? 'Unable to save note.')
      setSaving(false)
      return
    }

    setContent('')
    setSaving(false)
    router.refresh()
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Add company note</h2>
        <p className="text-xs text-slate-500">Capture context, decisions, and follow-ups.</p>
      </div>

      <textarea
        className="min-h-28 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
        placeholder="Type your note..."
        value={content}
        onChange={e => setContent(e.target.value)}
      />

      <div className="flex justify-end">
        <button
          onClick={add}
          disabled={saving || !content.trim()}
          className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? 'Saving...' : 'Add Note'}
        </button>
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  )
}
