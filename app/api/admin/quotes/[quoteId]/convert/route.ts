import { NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/supabase/admin-auth'
import { createServerSupabase } from '@/lib/supabase/server'

type ConvertPayload = {
  companyId?: string
  dueDate?: string
  currency?: string
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  const supabase = await createServerSupabase()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user || !isAdminUser(user.id)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { quoteId } = await params
  const payload = (await req.json()) as ConvertPayload
  const companyId = payload.companyId?.trim()
  const dueDate = payload.dueDate?.trim()
  const fallbackCurrency = (payload.currency?.trim() || 'USD').toUpperCase()

  if (!companyId || !dueDate) {
    return NextResponse.json({ error: 'companyId and dueDate are required' }, { status: 400 })
  }

  let admin
  try {
    admin = createAdminSupabase()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Missing Supabase admin configuration'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  const { data: quote, error: quoteError } = await admin
    .from('quotes')
    .select('currency')
    .eq('id', quoteId)
    .single()

  if (quoteError) {
    return NextResponse.json({ error: quoteError.message }, { status: 500 })
  }

  const { data: items, error: itemError } = await admin
    .from('quote_items')
    .select('name,qty,unit_price,tax_rate')
    .eq('quote_id', quoteId)

  if (itemError) {
    return NextResponse.json({ error: itemError.message }, { status: 500 })
  }

  if (!items || !items.length) {
    return NextResponse.json({ error: 'Cannot convert quote without line items' }, { status: 400 })
  }

  const total = items.reduce((sum, i) => {
    const line = i.qty * Number(i.unit_price)
    const tax = line * (Number(i.tax_rate) / 100)
    return sum + line + tax
  }, 0)

  const { data: invoice, error: invoiceError } = await admin
    .from('invoices')
    .insert({
      company_id: companyId,
      total,
      status: 'draft',
      due_date: dueDate,
      currency: (quote?.currency || fallbackCurrency).toUpperCase()
    })
    .select('id')
    .single()

  if (invoiceError || !invoice) {
    return NextResponse.json({ error: invoiceError?.message ?? 'Unable to create invoice' }, { status: 500 })
  }

  const { error: invoiceItemsError } = await admin.from('invoice_items').insert(
    items.map(i => ({
      invoice_id: invoice.id,
      name: i.name,
      qty: i.qty,
      unit_price: i.unit_price,
      tax_rate: i.tax_rate
    }))
  )

  if (invoiceItemsError) {
    return NextResponse.json({ error: invoiceItemsError.message }, { status: 500 })
  }

  return NextResponse.json({ invoiceId: invoice.id })
}
