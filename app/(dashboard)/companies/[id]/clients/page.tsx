import { createAdminSupabase } from '@/lib/supabase/admin'
import InviteMemberForm from '@/components/admin/InviteMemberForm'

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
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Company members</h1>
        <p className="text-sm text-slate-600">
          Add contacts and send portal invites directly from admin.
        </p>
      </div>

      <InviteMemberForm companyId={id} existingMembers={existingMembers} />

      <div className="rounded-2xl border bg-white">
        <div className="border-b px-4 py-3 font-medium">Contacts</div>
        <div className="divide-y">
          {contacts?.map(contact => (
            <div key={contact.id} className="px-4 py-3 text-sm">
              <div className="font-medium text-slate-900">{contact.full_name}</div>
              <div className="text-slate-600">{contact.email}</div>
              <div className="text-slate-500">
                {contact.job_title ?? 'No title'} • {contact.phone ?? 'No phone'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border bg-white">
        <div className="border-b px-4 py-3 font-medium">Portal memberships</div>
        <div className="divide-y">
          {members?.map(member => (
            <div key={member.id} className="px-4 py-3 text-sm">
              <div className="font-medium text-slate-900">{member.invited_email ?? member.user_id}</div>
              <div className="text-slate-600">Role: {member.role}</div>
              <div className="text-slate-500">Linked user: {member.user_id ?? 'Pending invite'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
