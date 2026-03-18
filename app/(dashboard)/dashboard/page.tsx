import { createServerSupabase } from '@/lib/supabase/server'
import Link from 'next/link'

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

export default async function Dashboard() {
  const supabase = await createServerSupabase()

  const [{ data: invoices }, { count: companyCount }, { count: quoteCount }] = await Promise.all([
    supabase.from('invoices').select('*'),
    supabase.from('companies').select('*', { count: 'exact', head: true }),
    supabase.from('quotes').select('*', { count: 'exact', head: true })
  ])

  const paidRevenue =
    invoices?.filter(i => i.status === 'paid').reduce((sum, i) => sum + Number(i.total), 0) ?? 0

  const draftRevenue =
    invoices?.filter(i => i.status !== 'paid').reduce((sum, i) => sum + Number(i.total), 0) ?? 0

  const overdueCount =
    invoices?.filter(
      i => i.status !== 'paid' && i.due_date && new Date(i.due_date) < new Date()
    ).length ?? 0

  const latestInvoices = [...(invoices ?? [])]
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    .slice(0, 6)

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 px-8 py-10 text-white">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Operations overview</p>
        <h1 className="mt-2 text-3xl font-semibold">Admin Dashboard</h1>
        <p className="mt-2 text-slate-200">Track client onboarding, quote decisions, and invoice collection.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Paid revenue</div>
          <div className="mt-1 text-2xl font-semibold">{formatMoney(paidRevenue)}</div>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Outstanding</div>
          <div className="mt-1 text-2xl font-semibold">{formatMoney(draftRevenue)}</div>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Overdue invoices</div>
          <div className="mt-1 text-2xl font-semibold">{overdueCount}</div>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-500">Companies / Quotes</div>
          <div className="mt-1 text-2xl font-semibold">
            {companyCount ?? 0} / {quoteCount ?? 0}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b px-5 py-3 font-medium">Recent invoices</div>
        <div className="divide-y">
          {latestInvoices.map(i => (
            <Link
              href={`/companies/${i.company_id}/invoices/${i.id}`}
              key={i.id}
              className="flex items-center justify-between px-5 py-3 hover:bg-slate-50"
            >
              <div>
                <div className="font-mono text-xs text-slate-500">{i.id}</div>
                <div className="text-sm text-slate-700">{new Date(i.created_at).toLocaleDateString()}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{i.status}</div>
                <div className="text-sm text-slate-600">{formatMoney(Number(i.total))}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}