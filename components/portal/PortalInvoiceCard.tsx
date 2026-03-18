'use client'

import { useState } from 'react'
import { CreditCard, CheckCircle2, Clock3 } from 'lucide-react'
import clsx from 'clsx'

type PortalInvoice = {
  id: string
  total: number
  status: 'draft' | 'sent' | 'paid'
  due_date: string | null
  created_at: string
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export default function PortalInvoiceCard({
  invoice
}: {
  invoice: PortalInvoice
}) {
  const [isPaying, setIsPaying] = useState(false)

  const isPaid = invoice.status === 'paid'

  const payInvoice = async () => {
    setIsPaying(true)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ invoiceId: invoice.id })
      })

      const data = await response.json()
      if (!response.ok || !data.url) {
        throw new Error(data.error ?? 'Could not start checkout')
      }

      window.location.href = data.url
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong starting checkout.'
      alert(message)
    } finally {
      setIsPaying(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="text-sm text-slate-500">Invoice</div>
          <div className="font-mono text-sm text-slate-700">{invoice.id}</div>
        </div>

        <span
          className={clsx(
            'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium',
            isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          )}
        >
          {isPaid ? <CheckCircle2 className="h-3 w-3" /> : <Clock3 className="h-3 w-3" />}
          {invoice.status.toUpperCase()}
        </span>
      </div>

      <div className="mb-5 text-3xl font-semibold tracking-tight text-slate-900">
        {formatCurrency(Number(invoice.total))}
      </div>

      <div className="mb-5 text-sm text-slate-600">
        <div>Issued: {new Date(invoice.created_at).toLocaleDateString()}</div>
        <div>
          Due: {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'No due date'}
        </div>
      </div>

      <button
        onClick={payInvoice}
        disabled={isPaid || isPaying}
        className={clsx(
          'inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium transition',
          isPaid
            ? 'cursor-not-allowed bg-slate-200 text-slate-500'
            : 'bg-slate-900 text-white hover:bg-slate-700'
        )}
      >
        <CreditCard className="h-4 w-4" />
        {isPaid ? 'Already Paid' : isPaying ? 'Redirecting…' : 'Pay with Card'}
      </button>
    </div>
  )
}
