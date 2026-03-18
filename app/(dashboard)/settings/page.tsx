import SettingsForm from '@/components/admin/SettingsForm'
import { createServerSupabase } from '@/lib/supabase/server'

export default async function SettingsPage() {
  const supabase = await createServerSupabase()
  const { data } = await supabase
    .from('app_settings')
    .select('key, value')

  const map = new Map((data ?? []).map(row => [row.key, row.value]))

  return (
    <div className="p-6 lg:p-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-700 p-6 text-white shadow-lg lg:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Administration</p>
          <h1 className="mt-2 text-2xl font-semibold lg:text-3xl">System settings</h1>
          <p className="mt-2 text-sm text-slate-200 lg:text-base">
            Control billing and email configuration used across all companies.
          </p>
        </div>

        <SettingsForm
          initial={{
            stripePublishableKey: map.get('stripe_publishable_key') ?? '',
            stripeWebhookEnabled: map.get('stripe_webhook_enabled') ?? false,
            smtpHost: map.get('smtp_host') ?? '',
            smtpPort: map.get('smtp_port') ?? '',
            smtpFromEmail: map.get('smtp_from_email') ?? '',
            quoteEmailSubject: map.get('quote_email_subject') ?? 'Your quote is ready'
          }}
        />
      </div>
    </div>
  )
}
