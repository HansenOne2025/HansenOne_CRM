import { NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase/admin'

type Payload = {
  companyId?: string
  fullName?: string
  email?: string
  role?: 'owner' | 'billing' | 'viewer'
  jobTitle?: string
  phone?: string
}

export async function POST(req: Request) {
  const body = (await req.json()) as Payload
  const { companyId, fullName, email, role = 'billing', jobTitle, phone } = body

  if (!companyId || !fullName || !email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  let admin
  try {
    admin = createAdminSupabase()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Missing Supabase admin configuration'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  const { data: existingMember } = await admin
    .from('company_users')
    .select('id')
    .eq('company_id', companyId)
    .ilike('invited_email', normalizedEmail)
    .maybeSingle()

  if (existingMember) {
    return NextResponse.json({ error: 'This email is already invited for this company.' }, { status: 409 })
  }

  const origin = new URL(req.url).origin
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.SITE_URL?.trim() || origin

  const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(normalizedEmail, {
    redirectTo: `${siteUrl}/invite/accept`
  })

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 500 })
  }

  const userId = inviteData.user?.id ?? null

  const { data: existingContact } = await admin
    .from('company_contacts')
    .select('id')
    .eq('company_id', companyId)
    .ilike('email', normalizedEmail)
    .maybeSingle()

  if (!existingContact) {
    const { error: contactError } = await admin
      .from('company_contacts')
      .insert({
        company_id: companyId,
        full_name: fullName,
        email: normalizedEmail,
        job_title: jobTitle ?? null,
        phone: phone ?? null,
        portal_role: role
      })

    if (contactError) {
      return NextResponse.json({ error: contactError.message }, { status: 500 })
    }
  }

  const { error: memberError } = await admin
    .from('company_users')
    .upsert(
      {
        company_id: companyId,
        user_id: userId,
        invited_email: normalizedEmail,
        role
      },
      { onConflict: 'company_id,invited_email' }
    )

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
