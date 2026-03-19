import { NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/supabase/admin-auth'
import { createServerSupabase } from '@/lib/supabase/server'

type CreateQuoteItemPayload = {
  quoteId?: string
  name?: string
  qty?: number
  unitPrice?: number
  taxRate?: number
}

export async function POST(req: Request) {
  const supabase = await createServerSupabase()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user || !isAdminUser(user.id)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = (await req.json()) as CreateQuoteItemPayload
  const quoteId = payload.quoteId?.trim()
  const name = payload.name?.trim()
  const qty = Number(payload.qty)
  const unitPrice = Number(payload.unitPrice)
  const taxRate = Number(payload.taxRate)

  if (!quoteId || !name || qty <= 0 || Number.isNaN(unitPrice) || Number.isNaN(taxRate)) {
    return NextResponse.json({ error: 'Invalid quote item payload' }, { status: 400 })
  }

  let admin
  try {
    admin = createAdminSupabase()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Missing Supabase admin configuration'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  const { data, error } = await admin
    .from('quote_items')
    .insert({
      quote_id: quoteId,
      name,
      qty,
      unit_price: unitPrice,
      tax_rate: taxRate
    })
    .select('id')
    .single()

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Unable to add quote item' }, { status: 500 })
  }

  return NextResponse.json({ id: data.id })
}
