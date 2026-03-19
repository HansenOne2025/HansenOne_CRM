import { createServerSupabase } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  const { quoteId } = await params
  const { status } = (await req.json()) as { status?: 'accepted' | 'rejected' }

  if (!status || !['accepted', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const supabase = await createServerSupabase()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: memberships } = await supabase
    .from('company_users')
    .select('company_id, role')
    .eq('user_id', user.id)

  const editableMemberships = memberships?.filter(m => m.role === 'owner' || m.role === 'billing') ?? []
  const companyIds = editableMemberships.map(m => m.company_id)

  const { data: quote } = await supabase
    .from('quotes')
    .select('id,company_id')
    .eq('id', quoteId)
    .in('company_id', companyIds)
    .single()

  if (!quote) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
  }

  const { error } = await supabase.from('quotes').update({ status }).eq('id', quote.id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
