import { NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase/admin'
import { isAdminUser } from '@/lib/supabase/admin-auth'
import { createServerSupabase } from '@/lib/supabase/server'
import { sendQuoteIssuedEmail } from '@/lib/email/send-quote-issued-email'

type UpdateQuotePayload = {
  status?: 'draft' | 'sent' | 'accepted' | 'rejected'
  currency?: string
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
  { params }: { params: Promise<{ quoteId: string }> }
) {
  const allowed = await authorizeAdmin()
  if (!allowed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { quoteId } = await params
  const payload = (await req.json()) as UpdateQuotePayload

  const updates: Record<string, string> = {}
  if (payload.status) updates.status = payload.status
  if (payload.currency) updates.currency = payload.currency.trim().toUpperCase()

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

  const { data: existingQuote } = await admin
    .from('quotes')
    .select('id, status, quote_number, company_id')
    .eq('id', quoteId)
    .single()

  const { error } = await admin.from('quotes').update(updates).eq('id', quoteId)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const shouldSendIssuedEmail =
    payload.status === 'sent' && existingQuote && existingQuote.status !== 'sent'

  if (shouldSendIssuedEmail) {
    const [{ data: company }, { data: members }, { data: settingRows }] = await Promise.all([
      admin.from('companies').select('name').eq('id', existingQuote.company_id).single(),
      admin
        .from('company_users')
        .select('invited_email')
        .eq('company_id', existingQuote.company_id),
      admin
        .from('app_settings')
        .select('key,value')
        .in('key', [
          'smtp_host',
          'smtp_port',
          'smtp_from_email',
          'smtp_username',
          'smtp_password',
          'quote_email_subject',
          'quote_email_body'
        ])
    ])

    const settings = new Map((settingRows ?? []).map(row => [row.key, row.value]))
    const smtpHost = String(settings.get('smtp_host') ?? '').trim()
    const smtpPort = Number(settings.get('smtp_port') ?? 587)
    const smtpFromEmail = String(settings.get('smtp_from_email') ?? '').trim()
    const smtpUsername = String(settings.get('smtp_username') ?? '').trim()
    const smtpPassword = String(settings.get('smtp_password') ?? '').trim()
    const quoteEmailSubject =
      String(settings.get('quote_email_subject') ?? '').trim() ||
      'Quote {{quote_number}} is ready for {{company_name}}'
    const quoteEmailBody =
      String(settings.get('quote_email_body') ?? '').trim() ||
      'Hello,\n\nYour quote {{quote_number}} is now ready for review.\nOpen portal: {{portal_url}}\n\nThanks.'

    const memberEmails = (members ?? [])
      .map(member => member.invited_email?.trim())
      .filter((email): email is string => !!email)

    if (
      smtpHost &&
      smtpFromEmail &&
      smtpUsername &&
      smtpPassword &&
      Number.isFinite(smtpPort) &&
      memberEmails.length
    ) {
      const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/portal/quotes`
      try {
        await sendQuoteIssuedEmail({
          smtpHost,
          smtpPort,
          smtpUsername,
          smtpPassword,
          fromEmail: smtpFromEmail,
          toEmails: memberEmails,
          subjectTemplate: quoteEmailSubject,
          bodyTemplate: quoteEmailBody,
          quoteNumber: existingQuote.quote_number?.trim() || existingQuote.id,
          companyName: company?.name || 'your company',
          portalUrl
        })
      } catch (mailError) {
        console.error('Failed to send quote issued email:', mailError)
      }
    }
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  const allowed = await authorizeAdmin()
  if (!allowed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { quoteId } = await params

  let admin
  try {
    admin = createAdminSupabase()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Missing Supabase admin configuration'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  const { error } = await admin.from('quotes').delete().eq('id', quoteId)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
