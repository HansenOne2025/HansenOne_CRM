import { createServerSupabase } from '@/lib/supabase/server'
import AddItem from '@/components/AddQuoteItem'
import QuoteActions from '@/components/QuoteActions'

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

  const { data: items } = await supabase
    .from('quote_items')
    .select('*')
    .eq('quote_id', quoteId)

  const total =
    items?.reduce((sum, i) => {
      const line = i.qty * i.unit_price
      const tax = line * (i.tax_rate / 100)
      return sum + line + tax
    }, 0) || 0

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between">
        <div>Status: {quote.status}</div>
        <QuoteActions quoteId={quoteId} companyId={id} currentStatus={quote.status} />
      </div>

      <AddItem quoteId={quoteId} />

      <div className="space-y-2">
        {items?.map(i => (
          <div key={i.id} className="border p-2">
            {i.name} — {i.qty} × {i.unit_price}
          </div>
        ))}
      </div>

      <div className="text-lg font-semibold">
        Total: {total.toFixed(2)}
      </div>
    </div>
  )
}