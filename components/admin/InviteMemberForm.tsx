'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  companyId: string
}

export default function InviteMemberForm({ companyId }: Props) {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('billing')
  const [jobTitle, setJobTitle] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const res = await fetch('/api/admin/invite-member', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId,
        fullName,
        email,
        role,
        jobTitle,
        phone
      })
    })

    const data = await res.json()
    if (!res.ok) {
      setMessage(data.error ?? 'Could not invite member')
      setLoading(false)
      return
    }

    setMessage('Invite sent and member attached to company.')
    setFullName('')
    setEmail('')
    setJobTitle('')
    setPhone('')
    setRole('billing')
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border bg-white p-5 shadow-sm space-y-3">
      <h3 className="text-lg font-semibold text-slate-900">Add / Invite company member</h3>

      <div className="grid gap-3 md:grid-cols-2">
        <input
          required
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          placeholder="Full name"
          className="rounded-xl border px-3 py-2"
        />
        <input
          required
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          className="rounded-xl border px-3 py-2"
        />
        <input
          value={jobTitle}
          onChange={e => setJobTitle(e.target.value)}
          placeholder="Job title"
          className="rounded-xl border px-3 py-2"
        />
        <input
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="Phone"
          className="rounded-xl border px-3 py-2"
        />
      </div>

      <select
        value={role}
        onChange={e => setRole(e.target.value)}
        className="rounded-xl border px-3 py-2"
      >
        <option value="owner">Owner</option>
        <option value="billing">Billing</option>
        <option value="viewer">Viewer</option>
      </select>

      {message && <p className="text-sm text-slate-600">{message}</p>}

      <button
        disabled={loading}
        className="rounded-xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-60"
      >
        {loading ? 'Sending…' : 'Save member + send invite'}
      </button>
    </form>
  )
}
