import { createServerSupabase } from '@/lib/supabase/server'

export default async function CompanyClientsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabase()

  const { data: memberships } = await supabase
    .from('company_users')
    .select('id, role, invited_email, created_at, user_id')
    .eq('company_id', id)
    .order('created_at', { ascending: false })

  return (
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
      </div>
    </div>
  )
}
