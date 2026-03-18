import { createServerSupabase } from '@/lib/supabase/server'
import InvoiceActions from '@/components/InvoiceActions'
import SetDueDate from '@/components/SetDueDate'

export default async function InvoicePage({
  params
}: {
  params: { id: string; invoiceId: string }
}) {
  const supabase = await createServerSupabase()

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', params.invoiceId)
    .single()

  const { data: items } = await supabase
    .from('invoice_items')
    .select('*')
    .eq('invoice_id', params.invoiceId)

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

        <InvoiceActions invoiceId={params.invoiceId} />
      </div>

      <div className="flex gap-2 items-center">
        <span>Due:</span>
        <SetDueDate invoiceId={params.invoiceId} />
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