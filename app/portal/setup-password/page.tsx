'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function SetupPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const initialize = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (!mounted) return

      if (!session?.user) {
        setError('Your invite session is missing or expired. Please request a new invite.')
      } else {
        setEmail(session.user.email ?? null)
      }

      setInitializing(false)
    }

    initialize()

    return () => {
      mounted = false
    }
  }, [])

  const passwordMismatch = useMemo(
    () => confirmPassword.length > 0 && password !== confirmPassword,
    [password, confirmPassword]
  )

  const submit = async (e: FormEvent) => {
    e.preventDefault()

    if (passwordMismatch) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setError(null)

    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    router.push('/portal')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 p-6 text-white">
      <div className="mx-auto mt-20 max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <p className="mb-2 text-sm uppercase tracking-widest text-slate-300">HansenOne</p>
        <h1 className="mb-2 text-2xl font-semibold">Set your password</h1>

        {initializing ? (
          <p className="text-sm text-slate-300">Loading your invite session…</p>
        ) : (
          <>
            {email && (
              <p className="mb-6 text-sm text-slate-300">
                You&apos;re creating a portal account for <span className="font-medium text-white">{email}</span>.
              </p>
            )}

            {!email && error && (
              <div className="space-y-4">
                <p className="text-sm text-rose-300">{error}</p>
                <Link
                  href="/portal/login"
                  className="inline-flex rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-400"
                >
                  Go to portal login
                </Link>
              </div>
            )}

            {email && (
              <form onSubmit={submit} className="space-y-4">
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Create password"
                  className="w-full rounded-xl border border-white/20 bg-slate-900/60 px-4 py-3 outline-none ring-sky-400 focus:ring"
                />

                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full rounded-xl border border-white/20 bg-slate-900/60 px-4 py-3 outline-none ring-sky-400 focus:ring"
                />

                {passwordMismatch && <p className="text-sm text-rose-300">Passwords do not match.</p>}
                {error && <p className="text-sm text-rose-300">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || passwordMismatch}
                  className="w-full rounded-xl bg-sky-500 px-4 py-3 font-medium text-white transition hover:bg-sky-400 disabled:opacity-60"
                >
                  {loading ? 'Saving…' : 'Set password and continue'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}
