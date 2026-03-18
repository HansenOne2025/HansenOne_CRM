import { createServerSupabase } from '@/lib/supabase/server'
import PortalInvoiceCard from '@/components/portal/PortalInvoiceCard'

export default async function PortalHomePage() {
  const supabase = await createServerSupabase()

  const {
    data: { user }
  } = await supabase.auth.getUser()

<<<<<<< HEAD

  if (user?.email) {
    await supabase
      .from('company_users')
      .update({ user_id: user.id })
      .eq('invited_email', user.email)
      .is('user_id', null)
  }

=======
>>>>>>> origin/main
  const { data: membershipsData } = await supabase
    .from('company_users')
    .select('company_id, role, companies(name)')
    .eq('user_id', user?.id)

  const memberships = (membershipsData ?? []) as Array<{
    company_id: string
    companies: { name: string }[] | { name: string } | null
  }>

  const companyIds = memberships.map(m => m.company_id)

  const { data: invoices } = await supabase
    .from('invoices')
    .select('id,total,status,due_date,created_at,company_id')
    .in('company_id', companyIds)
    .order('created_at', { ascending: false })

  const firstCompany = memberships?.[0]?.companies
  const companyName = Array.isArray(firstCompany)
    ? firstCompany[0]?.name ?? 'Your Company'
    : firstCompany?.name ?? 'Your Company'

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
              <PortalInvoiceCard key={invoice.id} invoice={invoice} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
