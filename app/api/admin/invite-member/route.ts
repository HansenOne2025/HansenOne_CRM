export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type Payload = {
  companyId?: string
  fullName?: string
  email?: string
  role?: 'owner' | 'billing' | 'viewer'
  jobTitle?: string
  phone?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload
    const { companyId, fullName, email, role = 'billing', jobTitle, phone } = body

    if (!companyId || !fullName || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()
    if (!['owner', 'billing', 'viewer'].includes(role)) {
      return NextResponse.json({ error: 'Invalid portal role' }, { status: 400 })
    }

    if (!normalizedEmail) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        },
        global: {
          headers: {
            Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY!}`
          }
        }
      }
    )

    const { data: existingMember, error: existingMemberError } = await admin
      .from('company_users')
      .select('id')
      .eq('company_id', companyId)
      .ilike('invited_email', normalizedEmail)
      .maybeSingle()

    if (existingMemberError) {
      console.error('existingMemberError', existingMemberError)
      return NextResponse.json({ error: existingMemberError.message }, { status: 500 })
    }

    if (existingMember) {
      return NextResponse.json(
        { error: 'This email is already invited for this company.' },
        { status: 409 }
      )
    }

    const origin = new URL(req.url).origin
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
      process.env.SITE_URL?.trim() ||
      origin

    const { data: inviteData, error: inviteError } =
      await admin.auth.admin.inviteUserByEmail(normalizedEmail, {
        redirectTo: `${siteUrl}/invite/accept`
      })

    if (inviteError) {
      console.error('inviteError', inviteError)
      return NextResponse.json(
        { error: inviteError.message, details: inviteError },
        { status: 500 }
      )
    }

    const userId = inviteData.user?.id ?? null

    const { data: existingContact, error: existingContactError } = await admin
      .from('company_contacts')
      .select('id')
      .eq('company_id', companyId)
      .ilike('email', normalizedEmail)
      .maybeSingle()

    if (existingContactError) {
      console.error('existingContactError', existingContactError)
      return NextResponse.json(
        { error: existingContactError.message },
        { status: 500 }
      )
    }

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
        console.error('contactError', contactError)
        return NextResponse.json(
          { error: contactError.message, details: contactError },
          { status: 500 }
        )
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
      console.error('memberError', memberError)
      return NextResponse.json(
        { error: memberError.message, details: memberError },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('fatal', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}