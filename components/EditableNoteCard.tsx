'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Note = {
  id: string
  content: string
  created_at: string
}

export default function EditableNoteCard({ note }: { note: Note }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(note.content)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = async () => {
    const trimmed = content.trim()
    if (!trimmed || saving) return

    setSaving(true)
    setError(null)

    const response = await fetch(`/api/admin/notes/${note.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: trimmed })
    })
    const payload = (await response.json()) as { error?: string }
    if (!response.ok) {
      setError(payload.error ?? 'Unable to update note.')
      setSaving(false)
      return
    }

    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  const remove = async () => {
    if (saving) return
    setSaving(true)
    setError(null)

    const response = await fetch(`/api/admin/notes/${note.id}`, {
      method: 'DELETE'
    })
    const payload = (await response.json()) as { error?: string }
    if (!response.ok) {
      setError(payload.error ?? 'Unable to remove note.')
      setSaving(false)
      return
    }

    router.refresh()
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {editing ? (
        <textarea
          className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          value={content}
          onChange={e => setContent(e.target.value)}
        />
      ) : (
        <p className="whitespace-pre-wrap text-sm text-slate-700">{note.content}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <p className="text-xs text-slate-500">
          {new Date(note.created_at).toLocaleString()}
        </p>

        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                onClick={() => {
                  setContent(note.content)
                  setEditing(false)
                }}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving || !content.trim()}
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Save
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700"
              >
                Edit
              </button>
              <button
                onClick={remove}
                disabled={saving}
                className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 disabled:opacity-40"
              >
                Remove
              </button>
            </>
          )}
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
    </article>
  )
}
