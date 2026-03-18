import { createServerSupabase } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function InvoicesPage() {
  const supabase = await createServerSupabase()

  const { data } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Invoices</h1>

      <div className="space-y-2">
        {data?.map(i => (
          <Link
            key={i.id}
            href={`/companies/${i.company_id}/invoices/${i.id}`}
            className="block border p-4 hover:bg-gray-50"
          >
            <div className="flex justify-between">
              <span>{i.status}</span>
              <span>€{i.total}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}