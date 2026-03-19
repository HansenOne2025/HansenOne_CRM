import { NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/supabase/admin-auth'
import { createServerSupabase } from '@/lib/supabase/server'

type CreateQuotePayload = {
  companyId?: string
  quoteNumber?: string
  currency?: string
}

export async function POST(req: Request) {
  const supabase = await createServerSupabase()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user || !isAdminUser(user.id)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = (await req.json()) as CreateQuotePayload
  const companyId = payload.companyId?.trim()
  const quoteNumber = payload.quoteNumber?.trim()
  const currency = (payload.currency?.trim() || 'USD').toUpperCase()

  if (!companyId || !quoteNumber) {
    return NextResponse.json({ error: 'Missing companyId or quoteNumber' }, { status: 400 })
  }

  let admin
  try {
    admin = createAdminSupabase()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Missing Supabase admin configuration'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  const { data, error } = await admin
    .from('quotes')
    .insert({
      company_id: companyId,
      status: 'draft',
      quote_number: quoteNumber,
      currency
    })
    .select('id')
    .single()

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Unable to create quote' }, { status: 500 })
  }

  return NextResponse.json({ id: data.id })
}
