'use client'

<<<<<<< HEAD
import { FormEvent, useState } from 'react'
=======
import { FormEvent, useMemo, useState } from 'react'
>>>>>>> origin/main
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ClientLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
<<<<<<< HEAD
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

=======
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const heading = useMemo(
    () => (mode === 'login' ? 'Client Portal Login' : 'Create Client Portal Account'),
    [mode]
  )

>>>>>>> origin/main
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
<<<<<<< HEAD
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) throw signInError
=======
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password
        })

        if (signUpError) throw signUpError
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (signInError) throw signInError
      }
>>>>>>> origin/main

      router.push('/portal')
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
<<<<<<< HEAD
        <h1 className="mb-2 text-2xl font-semibold">Client Portal Login</h1>
        <p className="mb-6 text-sm text-slate-300">
          Accounts are invite-only. Contact your account manager if you need access.
        </p>
=======
        <h1 className="mb-6 text-2xl font-semibold">{heading}</h1>
>>>>>>> origin/main

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
<<<<<<< HEAD
            {loading ? 'Please wait…' : 'Log In'}
          </button>
        </form>
=======
            {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="mt-4 text-sm text-slate-300 underline"
        >
          {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Log in'}
        </button>
>>>>>>> origin/main
      </div>
    </div>
  )
}
