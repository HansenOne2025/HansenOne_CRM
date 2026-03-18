'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

const INVALID_INVITE_MESSAGE = 'Invite link is invalid or expired. Request a new invite from your account manager.'

export default function AcceptInvitePage() {
  const router = useRouter()
  const [initializing, setInitializing] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const bootstrapInviteSession = async () => {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      const type = hashParams.get('type')

      if (!accessToken || !refreshToken || type !== 'invite') {
        const {
          data: { session }
        } = await supabase.auth.getSession()

        if (!mounted) return

        if (session?.user) {
          router.replace('/portal/setup-password')
          return
        }

        setError(INVALID_INVITE_MESSAGE)
        setInitializing(false)
        return
      }

      const { error: setSessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      })

      if (!mounted) return

      if (setSessionError) {
        setError(INVALID_INVITE_MESSAGE)
        setInitializing(false)
        return
      }

      window.history.replaceState(null, '', '/invite/accept')
      router.replace('/portal/setup-password')
    }

    bootstrapInviteSession()

    return () => {
      mounted = false
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 p-6 text-white">
      <div className="mx-auto mt-20 max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <p className="mb-2 text-sm uppercase tracking-widest text-slate-300">HansenOne</p>
        <h1 className="mb-2 text-2xl font-semibold">Accept invite</h1>

        {initializing ? (
          <p className="text-sm text-slate-300">Checking your invite link…</p>
        ) : (
          <div className="space-y-4">
            {error && <p className="text-sm text-rose-300">{error}</p>}
            <Link
              href="/portal/login"
              className="inline-flex rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-400"
            >
              Go to portal login
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
