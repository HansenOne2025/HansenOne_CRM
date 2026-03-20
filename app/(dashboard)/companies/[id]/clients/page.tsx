import { createAdminSupabase } from '@/lib/supabase/admin'
import InviteMemberForm from '@/components/admin/InviteMemberForm'
import RemoveMemberButton from '@/components/admin/RemoveMemberButton'

export default async function CompanyMembersPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminSupabase()

  console.info('[supabase-debug] company clients query', {
    route: '/companies/[id]/clients',
    clientFactory: 'createAdminSupabase',
    keySource: process.env.SUPABASE_SECRET_KEY
      ? 'SUPABASE_SECRET_KEY'
      : process.env.SUPABASE_SERVICE_ROLE_KEY
        ? 'SUPABASE_SERVICE_ROLE_KEY'
        : 'missing',
    effectiveRole: 'service_role'
  })

  const { data: contacts } = await supabase
    .from('company_contacts')
    .select('*')
    .eq('company_id', id)
    .order('created_at', { ascending: false })

  const { data: members } = await supabase
    .from('company_users')
    .select('id, role, invited_email, user_id, created_at')
    .eq('company_id', id)
    .order('created_at', { ascending: false })

  const existingMembers =
    members
      ?.map(member => {
        const email = member.invited_email?.trim().toLowerCase()
        if (!email) return null

        return {
          email,
          role: member.role,
          status: member.user_id ? ('accepted' as const) : ('pending' as const)
        }
      })
      .filter((member): member is { email: string; role: 'owner' | 'billing' | 'viewer'; status: 'accepted' | 'pending' } => member !== null) ?? []

  return (
    <div className="space-y-6 bg-slate-50 p-6 min-h-full">
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-700 p-7 text-white shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Client access</p>
        <h1 className="mt-2 text-2xl font-semibold">Contacts & memberships</h1>
        <p className="mt-1 text-sm text-slate-200">
          Add contacts and send portal invites directly from admin.
        </p>
      </section>

      <InviteMemberForm companyId={id} existingMembers={existingMembers} />

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3 font-medium text-slate-900">Contacts</div>
        <div className="divide-y">
          {contacts?.length ? contacts.map(contact => (
            <div key={contact.id} className="px-4 py-3 text-sm">
              <div className="font-medium text-slate-900">{contact.full_name}</div>
              <div className="text-slate-600">{contact.email}</div>
              <div className="mt-1 text-slate-500">
                {contact.job_title ?? 'No title'} • {contact.phone ?? 'No phone'}
              </div>
            </div>
          )) : (
            <div className="px-4 py-6 text-sm text-slate-500">No contacts added yet.</div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3 font-medium text-slate-900">Portal memberships</div>
        <div className="divide-y">
          {members?.length ? members.map(member => (
            <div key={member.id} className="flex items-start justify-between gap-4 px-4 py-3 text-sm">
              <div>
                <div className="font-medium text-slate-900">{member.invited_email ?? member.user_id}</div>
                <div className="mt-1 text-slate-600">Role: {member.role}</div>
                <div className="text-slate-500">Linked user: {member.user_id ?? 'Pending invite'}</div>
              </div>
              <RemoveMemberButton memberId={member.id} />
            </div>
          )) : (
            <div className="px-4 py-6 text-sm text-slate-500">No portal memberships yet.</div>
          )}
        </div>
      </div>
    </div>
  )
}
