import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/server'
import AdminLogoutButton from '@/components/admin/AdminLogoutButton'

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabase()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-72 border-r border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Admin</div>
          <div className="text-2xl font-semibold text-slate-900">HansenOne</div>
        </div>

        <nav className="space-y-1 text-sm">
          <Link href="/dashboard" className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100">
            Dashboard
          </Link>

          <Link href="/companies" className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100">
            Companies
          </Link>


          <Link href="/portal" className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100">
            Client Portal
          </Link>
          <Link href="/settings" className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100">
            Settings
          </Link>
        </nav>

        <div className="mt-8 space-y-2 border-t border-slate-200 pt-4">
          <div className="text-xs text-slate-500">Signed in as</div>
          <div className="truncate text-sm text-slate-700">{user?.email ?? 'Unknown user'}</div>
          <AdminLogoutButton />
        </div>
      </aside>

      <main className="flex-1">{children}</main>
    </div>
  )
}
