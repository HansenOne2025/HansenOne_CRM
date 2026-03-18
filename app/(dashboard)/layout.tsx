import Link from 'next/link'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
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

          <Link href="/invoices" className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100">
            Invoices
          </Link>

          <Link href="/portal" className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100">
            Client Portal
          </Link>
          <Link href="/settings" className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100">
            Settings
          </Link>
        </nav>
      </aside>

      <main className="flex-1">{children}</main>
    </div>
  )
}
