import { createServerSupabase } from '@/lib/supabase/server'
import QuoteReviewActions from '@/components/portal/QuoteReviewActions'

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

  const { data: memberships } = await supabase
    .from('company_users')
    .select('company_id')
    .eq('user_id', user?.id)

  const companyIds = memberships?.map(m => m.company_id) ?? []

  const { data: quotes } = await supabase
    .from('quotes')
    .select('id,status,created_at,company_id,quote_number,currency')
    .in('company_id', companyIds)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Quotes</h1>
      <p className="text-sm text-slate-600">Review and respond to your company quotes.</p>

      <div className="grid gap-4 md:grid-cols-2">
        {quotes?.map(quote => (
          <div key={quote.id} className="space-y-3 rounded-2xl border bg-white p-5 shadow-sm">
            <div className="font-mono text-xs text-slate-500">Quote #{quote.quote_number || 'Pending Number'}</div>
            <div className="text-sm">
              Status: <strong>{quote.status}</strong>
            </div>
            <div className="text-xs text-slate-500">Currency: {(quote.currency || 'USD').toUpperCase()}</div>
            <div className="text-sm text-slate-500">Created: {new Date(quote.created_at).toLocaleDateString()}</div>
            <QuoteReviewActions quoteId={quote.id} status={quote.status} />
          </div>
        ))}
      </div>
    </div>
  )
}
