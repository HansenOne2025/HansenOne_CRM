import { createServerSupabase } from '@/lib/supabase/server'
import InvoiceActions from '@/components/InvoiceActions'
import SetDueDate from '@/components/SetDueDate'
import { notFound } from 'next/navigation'

export default async function InvoicePage({
  params
}: {
  params: Promise<{ id: string; invoiceId: string }>
}) {
  const { invoiceId } = await params
  const supabase = await createServerSupabase()

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single()

  if (!invoice) {
    notFound()
  }

  const { data: items } = await supabase
    .from('invoice_items')
    .select('*')
    .eq('invoice_id', invoiceId)

  const isOverdue =
    invoice?.status !== 'paid' &&
    invoice?.due_date &&
    new Date(invoice.due_date) < new Date()

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between">
        <div>
          Status: {invoice.status}
          {isOverdue && (
            <span className="text-red-600 ml-2">OVERDUE</span>
          )}
        </div>

        <InvoiceActions invoiceId={invoiceId} />
      </div>

      <div className="flex gap-2 items-center">
        <span>Due:</span>
        <SetDueDate invoiceId={invoiceId} />
      </div>

      {items?.map(i => (
        <div key={i.id} className="border p-2">
          {i.name} — {i.qty} × {i.unit_price}
        </div>
      ))}

      <div className="text-lg font-semibold">
        Total: {invoice.total}
      </div>
    </div>
  )
}
