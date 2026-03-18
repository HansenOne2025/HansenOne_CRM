import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe/server'
import { createAdminSupabase } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Missing Stripe webhook config' }, { status: 400 })
  }

  const body = await req.text()

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const invoiceId = session.metadata?.invoiceId

    if (invoiceId) {
      let supabaseAdmin
      try {
        supabaseAdmin = createAdminSupabase()
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Missing Supabase admin configuration'
        return NextResponse.json({ error: message }, { status: 500 })
      }

      await supabaseAdmin
        .from('invoices')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          stripe_payment_intent_id:
            typeof session.payment_intent === 'string' ? session.payment_intent : null
        })
        .eq('id', invoiceId)

      await supabaseAdmin.from('invoice_payments').insert({
        invoice_id: invoiceId,
        amount: Number(session.amount_total ?? 0) / 100,
        currency: session.currency ?? 'usd',
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id:
          typeof session.payment_intent === 'string' ? session.payment_intent : null,
        paid_at: new Date().toISOString()
      })
    }
  }

  return NextResponse.json({ received: true })
}
