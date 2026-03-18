import { createServerSupabase } from '@/lib/supabase/server'
<<<<<<< HEAD
import InviteMemberForm from '@/components/admin/InviteMemberForm'

export default async function CompanyMembersPage({
=======

export default async function CompanyClientsPage({
>>>>>>> origin/main
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabase()

<<<<<<< HEAD
  const { data: contacts } = await supabase
    .from('company_contacts')
    .select('*')
    .eq('company_id', id)
    .order('created_at', { ascending: false })

  const { data: members } = await supabase
    .from('company_users')
    .select('id, role, invited_email, user_id, created_at')
=======
  const { data: memberships } = await supabase
    .from('company_users')
    .select('id, role, invited_email, created_at, user_id')
>>>>>>> origin/main
    .eq('company_id', id)
    .order('created_at', { ascending: false })

  return (
<<<<<<< HEAD
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Company members</h1>
        <p className="text-sm text-slate-600">
          Add contacts and send portal invites directly from admin.
        </p>
      </div>

      <InviteMemberForm companyId={id} />

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
=======
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Client Access</h1>
      <p className="text-sm text-slate-600">
        Invite client users through Supabase Auth, then connect them to this company in{' '}
        <code>company_users</code>.
      </p>

      <div className="rounded-2xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">User ID</th>
              <th className="px-4 py-3">Invite Email</th>
              <th className="px-4 py-3">Added</th>
            </tr>
          </thead>
          <tbody>
            {memberships?.map(member => (
              <tr key={member.id} className="border-b last:border-0">
                <td className="px-4 py-3">{member.role}</td>
                <td className="px-4 py-3 font-mono text-xs">{member.user_id}</td>
                <td className="px-4 py-3">{member.invited_email ?? '-'}</td>
                <td className="px-4 py-3">{new Date(member.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
>>>>>>> origin/main
      </div>
    </div>
  )
}
