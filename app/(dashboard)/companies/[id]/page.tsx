import { createServerSupabase } from '@/lib/supabase/server'
import AddNote from '@/components/AddNote'
import Link from 'next/link'

export default async function CompanyPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabase()

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single()

  const { data: notes } = await supabase
    .from('notes')
    .select('*')
    .eq('company_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{company?.name}</h1>
      </div>

      <div className="flex gap-2">
        <Link href={`/companies/${id}/quotes`} className="border px-3 py-2 text-sm">Quotes</Link>
        <Link href={`/companies/${id}/clients`} className="border px-3 py-2 text-sm">Client Access</Link>
      </div>

      <AddNote companyId={id} />

      <div className="space-y-2">
        {notes?.map(n => (
          <div key={n.id} className="border p-3">
            <p>{n.content}</p>
            <p className="text-xs text-gray-500">
              {new Date(n.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}