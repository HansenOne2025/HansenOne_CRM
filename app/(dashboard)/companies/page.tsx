import { createServerSupabase } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function CompaniesPage() {
  const supabase = await createServerSupabase()

  const { data } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-semibold">Companies</h1>
        <Link href="/companies/new" className="bg-black text-white px-4 py-2">
          New Company
        </Link>
      </div>

      <div className="space-y-2">
        {data?.map(c => (
          <Link
            key={c.id}
            href={`/companies/${c.id}`}
            className="block border p-4 hover:bg-gray-50"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  )
}