import Link from 'next/link'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r p-4 space-y-2">
        <div className="text-xl font-semibold mb-4">
          HansenOne
        </div>

        <nav className="space-y-1">
          <Link href="/dashboard" className="block px-3 py-2 hover:bg-gray-100">
            Dashboard
          </Link>

          <Link href="/companies" className="block px-3 py-2 hover:bg-gray-100">
            Companies
          </Link>

          <Link href="/invoices" className="block px-3 py-2 hover:bg-gray-100">
            Invoices
          </Link>
        </nav>
      </aside>

      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}