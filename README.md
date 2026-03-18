# HansenOne CRM

A modern CRM with:

- **Admin app** for companies, members, quotes, invoices, and system settings.
- **Invite-only client portal** for reviewing quotes and paying invoices.
- **Stripe checkout + webhook** payment flow.

## Core flow

1. Create company
2. Add company members (contacts + portal invite)
3. Create quote
4. Client reviews quote in portal and accepts/rejects
5. Admin converts accepted quote to invoice
6. Client pays invoice in portal via Stripe

## Required environment variables

Create `.env.local`:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
# Backward-compatible fallbacks still supported:
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=...

# Needed for admin invite + webhook writes:
SUPABASE_SECRET_KEY=your_secret_key
# Backward-compatible fallback still supported:
# SUPABASE_SERVICE_ROLE_KEY=...

# Admin UUID allowlist (Supabase auth.users.id):
ADMIN_USER_UUIDS=uuid1,uuid2
# Optional client-side mirror used to fail fast on /dashboard/login:
NEXT_PUBLIC_ADMIN_USER_UUIDS=uuid1,uuid2

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Database setup (Supabase)

1. Open your Supabase SQL editor.
2. Copy/paste `schema.txt`.
3. Run it.

The schema includes:

- CRM tables
- company members + contact tables
- client quote review permissions
- Stripe payment tracking
- app settings storage

## Run locally

```bash
npm install
npm run dev
```

## Stripe local webhook testing

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Then copy the webhook secret into `STRIPE_WEBHOOK_SECRET`.
