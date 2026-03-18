'use client'

import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function QuoteActions({
  quoteId,
  companyId
}: {
  quoteId: string
  companyId: string
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
    <div className="flex gap-2">
      <button onClick={() => updateStatus('sent')} className="border px-3 py-1">
        Sent
      </button>

      <button onClick={() => updateStatus('accepted')} className="border px-3 py-1">
        Accept
      </button>

      <button onClick={() => updateStatus('rejected')} className="border px-3 py-1">
        Reject
      </button>

      <button onClick={convert} className="bg-black text-white px-3 py-1">
        Convert → Invoice
      </button>
    </div>
  )
}