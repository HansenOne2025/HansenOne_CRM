import SettingsForm from '@/components/admin/SettingsForm'
import { createServerSupabase } from '@/lib/supabase/server'

export default async function SettingsPage() {
  const supabase = await createServerSupabase()
  const { data } = await supabase
    .from('app_settings')
    .select('key, value')

  const map = new Map((data ?? []).map(row => [row.key, row.value]))

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
      <p className="text-sm text-slate-600">Control billing + email configuration used by the system.</p>
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
  )
}
