'use client'

import { FormEvent, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NewCompany() {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const create = async (e: FormEvent) => {
    e.preventDefault()

    const trimmed = name.trim()
    if (!trimmed || saving) return

    setSaving(true)
    setError(null)

    const { error: insertError } = await supabase.from('companies').insert({ name: trimmed })

    if (insertError) {
      setError(insertError.message)
      setSaving(false)
      return
    }

    router.push('/companies')
    router.refresh()
  }

  return (
    <div className="p-6 bg-slate-50 min-h-full">
      <form onSubmit={create} className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Create company</h1>
          <p className="mt-1 text-sm text-slate-600">Set up a new company record to start managing quotes and client access.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Company name</label>
          <input
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            placeholder="Acme Construction"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <button
          type="submit"
          disabled={!name.trim() || saving}
          className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? 'Creating...' : 'Create company'}
        </button>
      </form>
    </div>
  )
}
