import Link from 'next/link'
import { createAdminSupabase } from '@/lib/supabase/admin'
import { formatCurrency } from '@/lib/currency'

export default async function CompanyInvoicesPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminSupabase()

  const { data: invoices } = await supabase
    .from('invoices')
    .select('id,total,status,created_at,due_date,currency')
    .eq('company_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold text-slate-900">Company Invoices</h1>
      {!invoices?.length ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
          No invoices for this company yet.
        </div>
      ) : (
        <div className="space-y-2">
          {invoices.map(invoice => (
            <Link
              key={invoice.id}
              href={`/companies/${id}/invoices/${invoice.id}`}
              className="block rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50"
            >
              <div className="font-mono text-xs text-slate-500">{invoice.id}</div>
              <div className="text-sm text-slate-700">Status: {invoice.status}</div>
              <div className="text-sm text-slate-700">Total: {formatCurrency(Number(invoice.total), invoice.currency)}</div>
              <div className="text-xs text-slate-500">
                Issued: {new Date(invoice.created_at).toLocaleDateString()} • Due:{' '}
                {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'Not set'}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
