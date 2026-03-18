'use client'

import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function QuoteActions({
  quoteId,
  companyId,
  currentStatus
}: {
  quoteId: string
  companyId: string
  currentStatus: string
}) {
  const router = useRouter()

  const updateStatus = async (status: string) => {
    await supabase
      .from('quotes')
      .update({ status })
      .eq('id', quoteId)

    router.refresh()
  }

  const convert = async () => {
    const { data: items, error } = await supabase
      .from('quote_items')
      .select('*')
      .eq('quote_id', quoteId)

    if (error || !items || items.length === 0) return

    const total = items.reduce((sum, i) => {
      const line = i.qty * i.unit_price
      const tax = line * (i.tax_rate / 100)
      return sum + line + tax
    }, 0)

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        company_id: companyId,
        total,
        status: 'draft'
      })
      .select()
      .single()

    if (invoiceError || !invoice) return

    await supabase.from('invoice_items').insert(
      items.map(i => ({
        invoice_id: invoice.id,
        name: i.name,
        qty: i.qty,
        unit_price: i.unit_price,
        tax_rate: i.tax_rate
      }))
    )

    router.push(`/companies/${companyId}/invoices/${invoice.id}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={() => updateStatus('sent')} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700">
        Mark sent
      </button>

      <button onClick={() => updateStatus('accepted')} className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
        Mark accepted
      </button>

      <button onClick={() => updateStatus('rejected')} className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700">
        Mark rejected
      </button>

      <button onClick={convert} disabled={currentStatus !== 'accepted'} className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40">
        Convert to invoice
      </button>
    </div>
  )
}
