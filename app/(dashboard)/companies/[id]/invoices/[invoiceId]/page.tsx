import { createAdminSupabase } from '@/lib/supabase/admin'
import InvoiceActions from '@/components/InvoiceActions'
import SetDueDate from '@/components/SetDueDate'
import { notFound } from 'next/navigation'
import { formatCurrency, normalizeCurrency } from '@/lib/currency'

export default async function InvoicePage({
  params
}: {
  params: Promise<{ id: string; invoiceId: string }>
}) {
  const { invoiceId, id } = await params
  const supabase = createAdminSupabase()

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .eq('company_id', id)
    .single()

  if (!invoice) {
    notFound()
  }

  const { data: items } = await supabase.from('invoice_items').select('*').eq('invoice_id', invoiceId)

  const isOverdue = invoice.status !== 'paid' && invoice.due_date && new Date(invoice.due_date) < new Date()
  const currency = normalizeCurrency(invoice.currency)

  const subtotal =
    items?.reduce((sum, i) => {
      return sum + Number(i.qty) * Number(i.unit_price)
    }, 0) || 0

  const taxTotal =
    items?.reduce((sum, i) => {
      const line = Number(i.qty) * Number(i.unit_price)
      return sum + line * (Number(i.tax_rate) / 100)
    }, 0) || 0

  const total = subtotal + taxTotal

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

      {items?.map(i => {
        const line = Number(i.qty) * Number(i.unit_price)
        const lineTax = line * (Number(i.tax_rate) / 100)
        return (
          <div key={i.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
            <div className="font-medium text-slate-900">{i.name}</div>
            <div className="text-slate-600">
              {i.qty} × {formatCurrency(Number(i.unit_price), currency)}
            </div>
            <div className="text-xs text-slate-500">
              Tax ({i.tax_rate}%): {formatCurrency(lineTax, currency)} • Line total: {formatCurrency(line + lineTax, currency)}
            </div>
          </div>
        )
      })}

      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
        <div className="flex items-center justify-between text-slate-600">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal, currency)}</span>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <span>Tax</span>
          <span>{formatCurrency(taxTotal, currency)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2 text-lg font-semibold text-slate-900">
          <span>Total</span>
          <span>{formatCurrency(total, currency)}</span>
        </div>
      </div>
    </div>
  )
}
