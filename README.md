# HansenOne CRM

A modern CRM with:

- **Admin app** for companies, quotes, and invoices.
- **Client portal** where company clients can sign in, view their invoices, and pay online.
- **Stripe checkout + webhook** payment flow.

## Required environment variables

Create `.env.local`:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_or_publishable_key
# Backward-compatible fallback still supported:
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=...

# Needed for webhook write operations:
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Database setup (Supabase)

1. Open your Supabase SQL editor.
2. Copy/paste `schema.txt`.
3. Run it.

The schema includes:

- core CRM tables (`companies`, `quotes`, `invoices`, etc.)
- client auth membership table (`company_users`)
- Stripe tracking fields and payment ledger (`invoice_payments`)
- RLS policies for client-portal reads

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
