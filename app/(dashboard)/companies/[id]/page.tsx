import { createServerSupabase } from '@/lib/supabase/server'
import AddNote from '@/components/AddNote'
import EditableNoteCard from '@/components/EditableNoteCard'
import Link from 'next/link'
import EditCompanyNameForm from '@/components/admin/EditCompanyNameForm'

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
    <div className="p-6 space-y-6 bg-slate-50 min-h-full">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">{company?.name}</h1>
        <p className="mt-1 text-sm text-slate-600">Manage quoting, client access, and internal context.</p>

        <EditCompanyNameForm companyId={id} initialName={company?.name || ''} />

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/companies/${id}/quotes`}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Open Quotes
          </Link>
          <Link
            href={`/companies/${id}/invoices`}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            Open Invoices
          </Link>
          <Link
            href={`/companies/${id}/clients`}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            Client Access
          </Link>
        </div>
      </section>

      <AddNote companyId={id} />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Activity notes</h2>
          <span className="text-xs text-slate-500">{notes?.length ?? 0} total</span>
        </div>

        {notes && notes.length > 0 ? (
          <div className="grid gap-3">
            {notes.map(n => (
              <EditableNoteCard
                key={n.id}
                note={{ id: n.id, content: n.content, created_at: n.created_at }}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
            No notes yet. Add one to keep your team aligned.
          </div>
        )}
      </section>
    </div>
  )
}
