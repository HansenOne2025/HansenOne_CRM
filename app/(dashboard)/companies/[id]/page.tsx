import { createServerSupabase } from '@/lib/supabase/server'
import AddNote from '@/components/AddNote'

export default async function CompanyPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = await createServerSupabase()

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', params.id)
    .single()

  const { data: notes } = await supabase
    .from('notes')
    .select('*')
    .eq('company_id', params.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{company?.name}</h1>
      </div>

      <AddNote companyId={params.id} />

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