import { createServerSupabase } from '@/lib/supabase/server'
import Link from 'next/link'

function Card({
  title,
  value
}: {
  title: string
  value: number
}) {
  return (
    <div className="border p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-xl font-semibold">
        €{value.toFixed(2)}
      </div>
    </div>
  )
}

async function RecentInvoices() {
  const supabase = await createServerSupabase()

  const { data } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Recent Invoices</h2>

      {data?.map(i => (
        <Link
          key={i.id}
          href={`/companies/${i.company_id}/invoices/${i.id}`}
          className="block border p-3"
        >
          {i.status} — €{i.total}
        </Link>
      ))}
    </div>
  )
}

export default async function Dashboard() {
  const supabase = await createServerSupabase()

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')

  const totalRevenue =
    invoices
      ?.filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + Number(i.total || 0), 0) || 0

  const unpaid =
    invoices
      ?.filter(i => i.status !== 'paid')
      .reduce((sum, i) => sum + Number(i.total || 0), 0) || 0

  const overdue =
    invoices
      ?.filter(
        i =>
          i.status !== 'paid' &&
          i.due_date &&
          new Date(i.due_date) < new Date()
      )
      .reduce((sum, i) => sum + Number(i.total || 0), 0) || 0

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-3 gap-4">
        <Card title="Revenue" value={totalRevenue} />
        <Card title="Unpaid" value={unpaid} />
        <Card title="Overdue" value={overdue} />
      </div>

      <RecentInvoices />
    </div>
  )
}