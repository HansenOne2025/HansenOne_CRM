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
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Quotes</h1>
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
            className="rounded-2xl border bg-white p-4 shadow-sm"
          >
            <div className="font-mono text-xs text-slate-500">{q.id}</div>
            <div className="mt-2 text-sm">Status: <strong>{q.status}</strong></div>
          </Link>
        ))}
      </div>
    </div>
  )
}
