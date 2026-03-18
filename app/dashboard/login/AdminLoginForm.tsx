'use client'

import { FormEvent, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type AdminLoginFormProps = {
  initialError: string | null
  nextPath: string
}

export default function AdminLoginForm({ initialError, nextPath }: AdminLoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(initialError)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) throw signInError

      const userId = data.user?.id
      const allowList = (process.env.NEXT_PUBLIC_ADMIN_USER_UUIDS ?? '')
        .split(',')
        .map(id => id.trim())
        .filter(Boolean)

      if (!userId || !allowList.includes(userId)) {
        await supabase.auth.signOut()
        throw new Error('Your account is not an authorized admin.')
      }

      router.push(nextPath)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 p-6 text-white">
      <div className="mx-auto mt-20 max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <p className="mb-2 text-sm uppercase tracking-widest text-slate-300">HansenOne</p>
        <h1 className="mb-2 text-2xl font-semibold">Admin Login</h1>
        <p className="mb-6 text-sm text-slate-300">
          Sign in with an admin account UUID listed in ADMIN_USER_UUIDS.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-white/20 bg-slate-900/60 px-4 py-3 outline-none ring-sky-400 focus:ring"
          />

          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-white/20 bg-slate-900/60 px-4 py-3 outline-none ring-sky-400 focus:ring"
          />

          {error && <p className="text-sm text-rose-300">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-sky-500 px-4 py-3 font-medium text-white transition hover:bg-sky-400 disabled:opacity-60"
          >
            {loading ? 'Please wait…' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  )
}
