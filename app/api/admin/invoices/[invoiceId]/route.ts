import { NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/supabase/admin-auth'
import { createServerSupabase } from '@/lib/supabase/server'

type UpdateInvoicePayload = {
  status?: string
  currency?: string
  due_date?: string | null
  paid_at?: string | null
}

async function authorizeAdmin() {
  const supabase = await createServerSupabase()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  return !!user && isAdminUser(user.id)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  if (!(await authorizeAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { invoiceId } = await params
  const payload = (await req.json()) as UpdateInvoicePayload

  const updates: Record<string, string | null> = {}
  if (payload.status) updates.status = payload.status
  if (payload.currency) updates.currency = payload.currency.trim().toUpperCase()
  if (payload.due_date !== undefined) updates.due_date = payload.due_date || null
  if (payload.paid_at !== undefined) updates.paid_at = payload.paid_at || null

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  let admin
  try {
    admin = createAdminSupabase()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Missing Supabase admin configuration'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  const { error } = await admin.from('invoices').update(updates).eq('id', invoiceId)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  if (!(await authorizeAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { invoiceId } = await params

  let admin
  try {
    admin = createAdminSupabase()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Missing Supabase admin configuration'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  const { error } = await admin.from('invoices').delete().eq('id', invoiceId)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
