import { NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase/admin'

export async function PUT(req: Request) {
  const payload = (await req.json()) as Record<string, string | boolean>

  let admin
  try {
    admin = createAdminSupabase()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Missing Supabase admin configuration'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  const rows = [
    { key: 'stripe_publishable_key', value: payload.stripePublishableKey ?? '' },
    { key: 'stripe_webhook_enabled', value: payload.stripeWebhookEnabled ?? false },
    { key: 'smtp_host', value: payload.smtpHost ?? '' },
    { key: 'smtp_port', value: payload.smtpPort ?? '' },
    { key: 'smtp_from_email', value: payload.smtpFromEmail ?? '' },
    { key: 'quote_email_subject', value: payload.quoteEmailSubject ?? 'Your quote is ready' }
  ]

  const { error } = await admin.from('app_settings').upsert(rows)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
