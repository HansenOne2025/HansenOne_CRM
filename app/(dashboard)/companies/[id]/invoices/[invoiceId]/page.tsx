import { createServerSupabase } from '@/lib/supabase/server'
import InvoiceActions from '@/components/InvoiceActions'
import SetDueDate from '@/components/SetDueDate'
import { notFound } from 'next/navigation'

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: (currency || 'USD').toUpperCase()
  }).format(amount)
}

export default async function InvoicePage({
  params
}: {
  params: Promise<{ id: string; invoiceId: string }>
}) {
  const { invoiceId, id } = await params
  const supabase = await createServerSupabase()

  const { data: invoice } = await supabase.from('invoices').select('*').eq('id', invoiceId).single()

  if (!invoice) {
    notFound()
  }

  const { data: items } = await supabase.from('invoice_items').select('*').eq('invoice_id', invoiceId)

  const isOverdue = invoice?.status !== 'paid' && invoice?.due_date && new Date(invoice.due_date) < new Date()
  const currency = (invoice.currency || 'USD').toUpperCase()

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <div className="text-sm text-slate-500">Invoice status</div>
          <div className="text-xl font-semibold uppercase text-slate-900">
            {invoice.status}
            {isOverdue && <span className="ml-2 text-sm text-red-600">OVERDUE</span>}
          </div>
          <div className="mt-1 text-sm text-slate-500">
            Issued {new Date(invoice.created_at).toLocaleDateString()} • Due{' '}
            {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'Not set'}
          </div>
        </div>

        <InvoiceActions invoiceId={invoiceId} companyId={id} currentCurrency={currency} />
      </div>

      <div className="flex items-center gap-2">
        <span>Due date:</span>
        <SetDueDate invoiceId={invoiceId} currentDueDate={invoice.due_date} />
      </div>

      {items?.map(i => (
        <div key={i.id} className="border p-2">
          {i.name} — {i.qty} × {formatCurrency(Number(i.unit_price), currency)}
        </div>
      ))}

      <div className="text-lg font-semibold">Total: {formatCurrency(Number(invoice.total), currency)}</div>
    </div>
  )
}
