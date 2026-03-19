import { NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/supabase/admin-auth'
import { createServerSupabase } from '@/lib/supabase/server'

type CreateNotePayload = {
  company_id?: string
  content?: string
}

export async function POST(req: Request) {
  const supabase = await createServerSupabase()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user || !isAdminUser(user.id)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = (await req.json()) as CreateNotePayload
  const companyId = payload.company_id?.trim()
  const content = payload.content?.trim()
  if (!companyId || !content) {
    return NextResponse.json({ error: 'company_id and content are required' }, { status: 400 })
  }

  let admin
  try {
    admin = createAdminSupabase()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Missing Supabase admin configuration'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  const { data, error } = await admin
    .from('notes')
    .insert({ company_id: companyId, content })
    .select('id')
    .single()

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Unable to add note' }, { status: 500 })
  }

  return NextResponse.json({ id: data.id })
}
