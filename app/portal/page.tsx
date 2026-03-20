import { createServerSupabase } from '@/lib/supabase/server'
import { createAdminSupabase } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe/server'
import PortalInvoiceCard from '@/components/portal/PortalInvoiceCard'

type Membership = {
  company_id: string
  role: 'owner' | 'billing' | 'viewer'
  companies: { name: string }[] | { name: string } | null
}

type PageProps = {
  searchParams?: Promise<{ paid?: string; session_id?: string }>
}

export default async function PortalHomePage({ searchParams }: PageProps) {
  const supabase = await createServerSupabase()
  const params = (await searchParams) ?? {}

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
    .select('company_id, role, companies(name)')
    .eq('user_id', user?.id)

  const memberships = (membershipsData ?? []) as Membership[]
  const companyIds = memberships.map(m => m.company_id)

  if (params.paid === '1' && params.session_id) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(params.session_id)
      const invoiceId = session.metadata?.invoiceId
      const companyId = session.metadata?.companyId
      const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : null

      if (session.payment_status === 'paid' && invoiceId && companyId) {
        const supabaseAdmin = createAdminSupabase()

        await supabaseAdmin
          .from('invoices')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
            stripe_payment_intent_id: paymentIntentId
          })
          .eq('id', invoiceId)
          .eq('company_id', companyId)

        const { data: existingPayment } = await supabaseAdmin
          .from('invoice_payments')
          .select('id')
          .eq('stripe_checkout_session_id', session.id)
          .maybeSingle()

        if (!existingPayment) {
          await supabaseAdmin.from('invoice_payments').insert({
            invoice_id: invoiceId,
            amount: Number(session.amount_total ?? 0) / 100,
            currency: session.currency ?? 'usd',
            stripe_checkout_session_id: session.id,
            stripe_payment_intent_id: paymentIntentId,
            paid_at: new Date().toISOString()
          })
        }
      }
    } catch {
      // If Stripe or admin credentials are unavailable, rely on webhook processing.
    }
  }

  const { data: invoices } = await supabase
    .from('invoices')
    .select('id,total,status,due_date,created_at,company_id,currency')
    .in('company_id', companyIds)
    .eq('status', 'sent')
    .order('created_at', { ascending: false })

  const firstCompany = memberships?.[0]?.companies
  const companyName = Array.isArray(firstCompany)
    ? firstCompany[0]?.name ?? 'Your Company'
    : firstCompany?.name ?? 'Your Company'
  const roleByCompanyId = new Map(memberships.map(m => [m.company_id, m.role]))

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 p-8 text-white shadow-lg">
        <p className="mb-2 text-sm uppercase tracking-[0.2em] text-slate-300">Client Portal</p>
        <h1 className="mb-2 text-3xl font-semibold">Welcome back</h1>
        <p className="text-slate-200">Manage invoices and pay online for {companyName}.</p>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Open Invoices</h2>
          <p className="text-sm text-slate-500">{invoices?.length ?? 0} invoices</p>
        </div>

        {!invoices?.length ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            No invoices found for your account yet.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {invoices.map(invoice => (
              <PortalInvoiceCard
                key={invoice.id}
                invoice={invoice}
                canPay={(roleByCompanyId.get(invoice.company_id) ?? 'viewer') !== 'viewer'}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
