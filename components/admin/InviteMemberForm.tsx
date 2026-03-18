'use client'

import { FormEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type ExistingMember = {
  email: string
  role: 'owner' | 'billing' | 'viewer'
  status: 'accepted' | 'pending'
}

type Props = {
  companyId: string
  existingMembers: ExistingMember[]
}

export default function InviteMemberForm({ companyId, existingMembers }: Props) {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'owner' | 'billing' | 'viewer'>('billing')
  const [jobTitle, setJobTitle] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const normalizedInvites = useMemo(
    () => new Set(existingMembers.map(member => member.email.trim().toLowerCase())),
    [existingMembers]
  )
  const normalizedEmail = email.trim().toLowerCase()
  const duplicateInvite = normalizedEmail.length > 0 && normalizedInvites.has(normalizedEmail)

  const submit = async (e: FormEvent) => {
    e.preventDefault()

    if (duplicateInvite) {
      setMessage('That email already has an invite for this company.')
      return
    }

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
    <form onSubmit={submit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-slate-900">Invite company member</h3>
        <p className="text-sm text-slate-500">Create a contact and send a portal invite in one step.</p>
      </div>

      {existingMembers.length > 0 && (
        <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Already invited</p>
          <div className="flex flex-wrap gap-2">
            {existingMembers.map(member => (
              <span
                key={`${member.email}-${member.status}`}
                className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700"
              >
                {member.email} · {member.status}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Full name</span>
          <input
            required
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Jane Doe"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-900"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="jane@company.com"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-900"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Job title</span>
          <input
            value={jobTitle}
            onChange={e => setJobTitle(e.target.value)}
            placeholder="Finance Manager"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-900"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Phone</span>
          <input
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+1 555 123 4567"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-900"
          />
        </label>
      </div>

      <label className="block max-w-sm space-y-2">
        <span className="text-sm font-medium text-slate-700">Portal role</span>
        <select
          value={role}
          onChange={e => setRole(e.target.value as 'owner' | 'billing' | 'viewer')}
          className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-900"
        >
          <option value="owner">Owner</option>
          <option value="billing">Billing</option>
          <option value="viewer">Viewer</option>
        </select>
      </label>

      {duplicateInvite && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
          This email is already invited for this company.
        </p>
      )}

      {message && (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">{message}</p>
      )}

      <button
        disabled={loading || duplicateInvite}
        className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Sending…' : 'Save member + send invite'}
      </button>
    </form>
  )
}
