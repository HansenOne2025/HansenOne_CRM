import { NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/supabase/admin-auth'
import { createServerSupabase } from '@/lib/supabase/server'

type UpdateCompanyPayload = {
  name?: string
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const supabase = await createServerSupabase()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user || !isAdminUser(user.id)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { companyId } = await params
  const payload = (await req.json()) as UpdateCompanyPayload
  const name = payload.name?.trim()

  if (!name) {
    return NextResponse.json({ error: 'Company name is required' }, { status: 400 })
  }

  let admin
  try {
    admin = createAdminSupabase()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Missing Supabase admin configuration'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  const { error } = await admin.from('companies').update({ name }).eq('id', companyId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
