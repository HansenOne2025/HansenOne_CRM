import { NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase/admin'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const { memberId } = await params

  if (!memberId) {
    return NextResponse.json({ error: 'Missing member id' }, { status: 400 })
  }

  const supabase = createAdminSupabase()
  const { error } = await supabase.from('company_users').delete().eq('id', memberId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
