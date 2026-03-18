import { createServerSupabase } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function QuotesPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = await createServerSupabase()

  const { data } = await supabase
    .from('quotes')
    .select('*')
    .eq('company_id', params.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 space-y-4">
      <Link
        href={`/companies/${params.id}/quotes/new`}
        className="bg-black text-white px-4 py-2 inline-block"
      >
        New Quote
      </Link>

      {data?.map(q => (
        <Link
          key={q.id}
          href={`/companies/${params.id}/quotes/${q.id}`}
          className="block border p-4"
        >
          {q.status} — {q.id}
        </Link>
      ))}
    </div>
  )
}