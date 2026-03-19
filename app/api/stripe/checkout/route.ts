import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe/server'

export async function POST(req: Request) {
  try {
    const { invoiceId } = (await req.json()) as { invoiceId?: string }

    if (!invoiceId) {
      return NextResponse.json({ error: 'Missing invoiceId' }, { status: 400 })
    }

    const supabase = await createServerSupabase()
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: membership } = await supabase
      .from('company_users')
      .select('company_id, role')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'No company membership found' }, { status: 403 })
    }

    if (membership.role === 'viewer') {
      return NextResponse.json({ error: 'Your role does not allow payments' }, { status: 403 })
    }

    const { data: invoice } = await supabase
      .from('invoices')
      .select('id,total,status,company_id,currency')
      .eq('id', invoiceId)
      .eq('company_id', membership.company_id)
      .single()

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (invoice.status === 'paid') {
      return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      success_url: `${appUrl}/portal?paid=1`,
      cancel_url: `${appUrl}/portal?canceled=1`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: (invoice.currency || 'usd').toLowerCase(),
            product_data: {
              name: `Invoice ${invoice.id}`
            },
            unit_amount: Math.round(Number(invoice.total) * 100)
          }
        }
      ],
      metadata: {
        invoiceId: invoice.id,
        companyId: invoice.company_id
      }
    })

    await supabase
      .from('invoices')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', invoice.id)

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not create checkout session.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
