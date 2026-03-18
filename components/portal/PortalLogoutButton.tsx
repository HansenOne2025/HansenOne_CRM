'use client'

import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function PortalLogoutButton() {
  const router = useRouter()

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/portal/login')
    router.refresh()
  }

  return (
    <button
      onClick={logout}
      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
    >
      Log out
    </button>
  )
}
