import { createServerSupabase } from '@/lib/supabase/server'
import Link from 'next/link'

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: (currency || 'USD').toUpperCase()
  }).format(amount)
}

export default async function InvoicesPage() {
  const supabase = await createServerSupabase()

  const { data } = await supabase.from('invoices').select('*').order('created_at', { ascending: false })

  return (
    <div className="min-h-full space-y-4 bg-slate-50 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Invoices</h1>
        <p className="text-sm text-slate-600">Track payment status, issued date, and due dates in one place.</p>
      </div>

      <div className="grid gap-3">
        {data?.map(i => (
          <Link
            key={i.id}
            href={`/companies/${i.company_id}/invoices/${i.id}`}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-mono text-xs text-slate-500">Invoice {i.id.slice(0, 8)}</div>
                <div className="mt-1 text-sm text-slate-700">
                  Issued {new Date(i.created_at).toLocaleDateString()} • Due{' '}
                  {i.due_date ? new Date(i.due_date).toLocaleDateString() : 'Not set'}
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${
                    i.status === 'paid'
                      ? 'bg-emerald-100 text-emerald-700'
                      : i.status === 'sent'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {i.status}
                </div>
                <div className="mt-2 text-lg font-semibold text-slate-900">
                  {formatCurrency(Number(i.total), i.currency || 'USD')}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
