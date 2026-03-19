import { createServerSupabase } from '@/lib/supabase/server'
import QuoteReviewActions from '@/components/portal/QuoteReviewActions'
import { formatCurrency, normalizeCurrency } from '@/lib/currency'

type QuoteMembership = {
  company_id: string
  role: 'owner' | 'billing' | 'viewer'
}

type QuoteItem = {
  id: string
  quote_id: string
  name: string
  qty: number
  unit_price: number
  tax_rate: number
}

export default async function PortalQuotesPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (user?.email) {
    await supabase
      .from('company_users')
      .update({ user_id: user.id })
      .eq('invited_email', user.email)
      .is('user_id', null)
  }

  const { data: membershipsData } = await supabase
    .from('company_users')
    .select('company_id, role')
    .eq('user_id', user?.id)

  const memberships = (membershipsData ?? []) as QuoteMembership[]
  const companyIds = memberships.map(m => m.company_id)
  const roleByCompanyId = new Map(memberships.map(m => [m.company_id, m.role]))

  const { data: quotes } = await supabase
    .from('quotes')
    .select('id,status,created_at,company_id,quote_number,currency')
    .in('company_id', companyIds)
    .order('created_at', { ascending: false })

  const quoteIds = quotes?.map(quote => quote.id) ?? []
  let quoteItems: QuoteItem[] = []
  if (quoteIds.length) {
    const { data } = await supabase
      .from('quote_items')
      .select('id,quote_id,name,qty,unit_price,tax_rate')
      .in('quote_id', quoteIds)

    quoteItems = (data ?? []) as QuoteItem[]
  }

  const itemsByQuoteId = new Map<string, QuoteItem[]>()
  for (const item of quoteItems ?? []) {
    const existing = itemsByQuoteId.get(item.quote_id) ?? []
    existing.push(item)
    itemsByQuoteId.set(item.quote_id, existing)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Quotes</h1>
      <p className="text-sm text-slate-600">Review and respond to your company quotes.</p>

      <div className="grid gap-4 md:grid-cols-2">
        {quotes?.map(quote => {
          const currency = normalizeCurrency(quote.currency)
          const items = itemsByQuoteId.get(quote.id) ?? []
          const subtotal = items.reduce((sum, item) => sum + Number(item.qty) * Number(item.unit_price), 0)
          const taxTotal = items.reduce((sum, item) => {
            const line = Number(item.qty) * Number(item.unit_price)
            return sum + line * (Number(item.tax_rate) / 100)
          }, 0)
          const total = subtotal + taxTotal
          const canReview = (roleByCompanyId.get(quote.company_id) ?? 'viewer') !== 'viewer'

          return (
            <div key={quote.id} className="space-y-3 rounded-2xl border bg-white p-5 shadow-sm">
              <div className="font-mono text-xs text-slate-500">Quote #{quote.quote_number || 'Pending Number'}</div>
              <div className="text-sm">
                Status: <strong>{quote.status}</strong>
              </div>
              <div className="text-xs text-slate-500">Currency: {currency}</div>
              <div className="text-sm text-slate-500">Created: {new Date(quote.created_at).toLocaleDateString()}</div>

              <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal, currency)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Tax</span>
                  <span>{formatCurrency(taxTotal, currency)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-2 font-semibold text-slate-900">
                  <span>Total</span>
                  <span>{formatCurrency(total, currency)}</span>
                </div>
                {items.length > 0 ? (
                  <div className="space-y-1 pt-1 text-xs text-slate-600">
                    {items.map(item => (
                      <div key={item.id} className="flex items-center justify-between gap-3">
                        <span>
                          {item.name} ({item.qty} × {formatCurrency(Number(item.unit_price), currency)})
                        </span>
                        <span>{formatCurrency(Number(item.qty) * Number(item.unit_price), currency)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">No line items on this quote yet.</div>
                )}
              </div>

              <QuoteReviewActions quoteId={quote.id} status={quote.status} canReview={canReview} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
