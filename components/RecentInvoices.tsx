import { createServerSupabase } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function RecentInvoices() {
  const supabase = await createServerSupabase()

  const { data } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Recent Invoices</h2>

      {data?.map(i => (
        <Link
          key={i.id}
          href={`/companies/${i.company_id}/invoices/${i.id}`}
          className="block border p-3"
        >
          {i.status} — €{i.total}
        </Link>
      ))}
    </div>
  )
}