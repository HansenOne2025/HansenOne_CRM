import { createServerSupabase } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function CompaniesPage() {
  const supabase = await createServerSupabase()

  const { data } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Companies</h1>
          <p className="mt-1 text-sm text-slate-600">Select a company to manage quotes, notes, and portal access.</p>
        </div>

        <Link
          href="/companies/new"
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700"
        >
          New Company
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {data?.map(c => (
          <Link
            key={c.id}
            href={`/companies/${c.id}`}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300"
          >
            <div className="text-base font-semibold text-slate-900">{c.name}</div>
            <div className="mt-2 text-xs text-slate-500">Created {new Date(c.created_at).toLocaleDateString()}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
