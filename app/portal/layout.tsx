import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/server'
import PortalLogoutButton from '@/components/portal/PortalLogoutButton'

export default async function PortalLayout({
  children
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabase()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/portal" className="text-lg font-semibold text-slate-900">
            HansenOne Client Portal
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-600">{user?.email}</div>
            <PortalLogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  )
}
