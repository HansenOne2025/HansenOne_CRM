import { createServerSupabase } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function CompaniesPage() {
  const supabase = await createServerSupabase()

  const { data } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-full space-y-6 bg-slate-50 p-6">
      <section className="rounded-3xl bg-gradient-to-r from-indigo-700 via-blue-700 to-cyan-600 p-7 text-white shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">CRM</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Companies</h1>
        <p className="mt-1 text-sm text-blue-100">Select a company to manage quotes, invoices, notes, and portal access.</p>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">All companies</h2>
          <p className="mt-1 text-sm text-slate-600">Quick access to every account in your workspace.</p>
        </div>

        <Link
          href="/companies/new"
          className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500"
        >
          New Company
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {data?.map(c => (
          <Link
            key={c.id}
            href={`/companies/${c.id}`}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
          >
            <div className="text-base font-semibold text-slate-900">{c.name}</div>
            <div className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              Created {new Date(c.created_at).toLocaleDateString()}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
