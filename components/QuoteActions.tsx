'use client'

import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected'

type ActionState = 'sent' | 'accepted' | 'rejected' | 'convert' | 'withdraw' | null

const CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP', 'CAD', 'AUD']

export default function QuoteActions({
  quoteId,
  companyId,
  currentStatus,
  currentCurrency
}: {
  quoteId: string
  companyId: string
  currentStatus: QuoteStatus
  currentCurrency: string
}) {
  const router = useRouter()
  const [activeAction, setActiveAction] = useState<ActionState>(null)
  const [selectedCurrency, setSelectedCurrency] = useState((currentCurrency || 'USD').toUpperCase())
  const [showDueDateModal, setShowDueDateModal] = useState(false)
  const [dueDate, setDueDate] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  const canConvert = currentStatus === 'accepted'

  const actionButtonClass = (action: Exclude<ActionState, null>) =>
    `rounded-lg border px-3 py-1.5 text-sm font-medium transition active:scale-[0.98] ${
      activeAction === action ? 'opacity-70 ring-2 ring-slate-400' : ''
    }`

  const currencyLabel = useMemo(
    () => CURRENCY_OPTIONS.find(currency => currency === selectedCurrency) ?? selectedCurrency,
    [selectedCurrency]
  )

  const updateStatus = async (status: Exclude<QuoteStatus, 'draft'>) => {
    setActiveAction(status)
    setActionError(null)

    const response = await fetch(`/api/admin/quotes/${quoteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string }
      setActionError(payload.error ?? 'Unable to update quote status.')
      setActiveAction(null)
      return
    }

    setActiveAction(null)
    router.refresh()
  }

  const updateCurrency = async (currency: string) => {
    setActiveAction('sent')
    setActionError(null)

    const response = await fetch(`/api/admin/quotes/${quoteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currency })
    })

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string }
      setActionError(payload.error ?? 'Unable to update quote currency.')
      setActiveAction(null)
      return
    }

    setSelectedCurrency(currency)
    setActiveAction(null)
    router.refresh()
  }

  const withdrawQuote = async () => {
    setActiveAction('withdraw')
    setActionError(null)

    const response = await fetch(`/api/admin/quotes/${quoteId}`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      const payload = (await response.json()) as { error?: string }
      setActionError(payload.error ?? 'Unable to withdraw quote.')
      setActiveAction(null)
      return
    }

    setActiveAction(null)
    router.push(`/companies/${companyId}/quotes`)
  }

  const convert = async () => {
    if (!dueDate) return

    setActiveAction('convert')

    const { data: quote } = await supabase
      .from('quotes')
      .select('currency')
      .eq('id', quoteId)
      .single()

    const { data: items, error } = await supabase
      .from('quote_items')
      .select('*')
      .eq('quote_id', quoteId)

    if (error || !items || items.length === 0) {
      setActiveAction(null)
      return
    }

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
        status: 'draft',
        due_date: dueDate,
        currency: (quote?.currency || selectedCurrency || 'USD').toUpperCase()
      })
      .select()
      .single()

    if (invoiceError || !invoice) {
      setActiveAction(null)
      return
    }

    await supabase.from('invoice_items').insert(
      items.map(i => ({
        invoice_id: invoice.id,
        name: i.name,
        qty: i.qty,
        unit_price: i.unit_price,
        tax_rate: i.tax_rate
      }))
    )

    setActiveAction(null)
    setShowDueDateModal(false)
    router.push(`/companies/${companyId}/invoices/${invoice.id}`)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Currency
          <select
            value={selectedCurrency}
            onChange={e => updateCurrency(e.target.value)}
            className="mt-1 block rounded-lg border border-slate-300 px-2.5 py-2 text-sm text-slate-700"
          >
            {CURRENCY_OPTIONS.map(currency => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </label>
        <p className="text-xs text-slate-500">Selected: {currencyLabel}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => updateStatus('sent')} className={`${actionButtonClass('sent')} border-slate-300 text-slate-700`}>
          {activeAction === 'sent' ? 'Marking sent…' : 'Mark sent'}
        </button>

        <button
          onClick={() => updateStatus('accepted')}
          className={`${actionButtonClass('accepted')} border-emerald-300 bg-emerald-50 text-emerald-700`}
        >
          {activeAction === 'accepted' ? 'Marking accepted…' : 'Mark accepted'}
        </button>

        <button
          onClick={() => updateStatus('rejected')}
          className={`${actionButtonClass('rejected')} border-rose-300 bg-rose-50 text-rose-700`}
        >
          {activeAction === 'rejected' ? 'Marking rejected…' : 'Mark rejected'}
        </button>

        <button
          onClick={() => setShowDueDateModal(true)}
          disabled={!canConvert || !!activeAction}
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {activeAction === 'convert' ? 'Converting…' : 'Convert to invoice'}
        </button>

        <button
          onClick={withdrawQuote}
          disabled={!!activeAction}
          className={`${actionButtonClass('withdraw')} border-rose-300 text-rose-700 disabled:cursor-not-allowed disabled:opacity-40`}
        >
          {activeAction === 'withdraw' ? 'Withdrawing…' : 'Withdraw quote'}
        </button>
      </div>
      {actionError && <p className="text-xs text-rose-600">{actionError}</p>}

      {showDueDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Set invoice due date</h3>
            <p className="mt-1 text-sm text-slate-600">A due date is required before generating the invoice.</p>

            <input
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              type="date"
              className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowDueDateModal(false)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={convert}
                disabled={!dueDate || activeAction === 'convert'}
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {activeAction === 'convert' ? 'Generating…' : 'Generate invoice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
