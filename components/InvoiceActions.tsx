'use client'

import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP', 'CAD', 'AUD']

type ActionState = 'sent' | 'paid' | 'delete' | null

export default function InvoiceActions({
  invoiceId,
  companyId,
  currentCurrency
}: {
  invoiceId: string
  companyId: string
  currentCurrency: string
}) {
  const router = useRouter()
  const [activeAction, setActiveAction] = useState<ActionState>(null)
  const [currency, setCurrency] = useState((currentCurrency || 'USD').toUpperCase())

  const updateStatus = async (status: string) => {
    setActiveAction('sent')
    await supabase.from('invoices').update({ status }).eq('id', invoiceId)
    setActiveAction(null)
    router.refresh()
  }

  const markPaid = async () => {
    setActiveAction('paid')
    await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('id', invoiceId)

    setActiveAction(null)
    router.refresh()
  }

  const deleteInvoice = async () => {
    setActiveAction('delete')
    await supabase.from('invoices').delete().eq('id', invoiceId)
    setActiveAction(null)
    router.push(`/companies/${companyId}`)
  }

  const updateCurrency = async (nextCurrency: string) => {
    setCurrency(nextCurrency)
    await supabase.from('invoices').update({ currency: nextCurrency }).eq('id', invoiceId)
    router.refresh()
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Currency
          <select
            value={currency}
            onChange={e => updateCurrency(e.target.value)}
            className="mt-1 block rounded-lg border border-slate-300 px-2.5 py-2 text-sm text-slate-700"
          >
            {CURRENCY_OPTIONS.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => updateStatus('sent')}
          disabled={!!activeAction}
          className="rounded-lg border border-slate-300 px-3 py-1 text-sm transition active:scale-[0.98] disabled:opacity-50"
        >
          {activeAction === 'sent' ? 'Updating…' : 'Mark Sent'}
        </button>

        <button
          onClick={markPaid}
          disabled={!!activeAction}
          className="rounded-lg bg-black px-3 py-1 text-sm text-white transition active:scale-[0.98] disabled:opacity-50"
        >
          {activeAction === 'paid' ? 'Marking Paid…' : 'Mark Paid'}
        </button>

        <button
          onClick={deleteInvoice}
          disabled={!!activeAction}
          className="rounded-lg border border-rose-300 px-3 py-1 text-sm text-rose-700 transition active:scale-[0.98] disabled:opacity-50"
        >
          {activeAction === 'delete' ? 'Deleting…' : 'Delete Invoice'}
        </button>
      </div>
    </div>
  )
}
