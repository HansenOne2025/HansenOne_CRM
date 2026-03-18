import { createServerSupabase } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function QuotesPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabase()

  const { data } = await supabase
    .from('quotes')
    .select('*')
    .eq('company_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-full space-y-4 bg-slate-50 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Quotes</h1>
          <p className="text-sm text-slate-600">Create and manage quote approvals before invoicing.</p>
        </div>
        <Link
          href={`/companies/${id}/quotes/new`}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          New Quote
        </Link>
      </div>

      <div className="grid gap-3">
        {data?.map(q => (
          <Link
            key={q.id}
            href={`/companies/${id}/quotes/${q.id}`}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="font-mono text-xs text-slate-500">Quote #{q.quote_number || 'Pending Number'}</div>
            <div className="mt-2 inline-flex rounded-full border border-slate-300 px-2.5 py-1 text-xs font-semibold uppercase text-slate-700">
              {q.status}
            </div>
            <div className="mt-2 text-xs text-slate-500">Currency: {(q.currency || 'USD').toUpperCase()}</div>
            <div className="mt-1 text-xs text-slate-500">Created {new Date(q.created_at).toLocaleString()}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
