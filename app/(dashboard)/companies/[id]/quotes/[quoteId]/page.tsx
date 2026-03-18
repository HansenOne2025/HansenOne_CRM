import { createServerSupabase } from '@/lib/supabase/server'
import AddItem from '@/components/AddQuoteItem'
import QuoteActions from '@/components/QuoteActions'
import QuoteItemRow from '@/components/QuoteItemRow'

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD'
  }).format(amount)
}

export default async function QuotePage({
  params
}: {
  params: Promise<{ id: string; quoteId: string }>
}) {
  const { id, quoteId } = await params
  const supabase = await createServerSupabase()

  const { data: quote } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', quoteId)
    .single()

  const { data: items } = await supabase.from('quote_items').select('*').eq('quote_id', quoteId)

  const total =
    items?.reduce((sum, i) => {
      const line = i.qty * i.unit_price
      const tax = line * (i.tax_rate / 100)
      return sum + line + tax
    }, 0) || 0

  const quoteCurrency = (quote.currency || 'USD').toUpperCase()

  return (
    <div className="min-h-full space-y-5 bg-slate-50 p-6">
      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Quote</p>
            <h1 className="text-2xl font-semibold text-slate-900">Build quote details</h1>
            <p className="mt-1 text-xs text-slate-500">Quote #{quote.quote_number || 'Pending Number'}</p>
          </div>
          <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold uppercase text-slate-700">
            {quote.status}
          </span>
        </div>

        <p className="text-sm text-slate-600">
          Workflow: add all items → mark the quote status → convert to invoice when accepted.
        </p>

        <QuoteActions
          quoteId={quoteId}
          companyId={id}
          currentStatus={quote.status}
          currentCurrency={quoteCurrency}
        />
      </section>

      <AddItem quoteId={quoteId} />

      <section className="space-y-2">
        <div className="grid grid-cols-12 gap-2 px-1 text-xs font-medium uppercase tracking-wide text-slate-500">
          <div className="col-span-12 md:col-span-4">Item</div>
          <div className="col-span-3 md:col-span-1">Qty</div>
          <div className="col-span-3 md:col-span-2">Unit price</div>
          <div className="col-span-3 md:col-span-2">Tax</div>
          <div className="col-span-3 md:col-span-2">Line total</div>
        </div>

        {items && items.length > 0 ? (
          <div className="space-y-2">
            {items.map(i => (
              <QuoteItemRow
                key={i.id}
                id={i.id}
                name={i.name}
                qty={i.qty}
                unitPrice={i.unit_price}
                taxRate={i.tax_rate}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
            No line items yet. Add at least one item before sending this quote.
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">Quote total</span>
          <span className="text-2xl font-semibold text-slate-900">{formatCurrency(total, quoteCurrency)}</span>
        </div>
      </section>
    </div>
  )
}
