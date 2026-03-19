'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState } from 'react'

function generateQuoteNumber() {
  const timestampPart = Date.now().toString().slice(-7)
  const randomPart = Math.floor(100 + Math.random() * 900).toString()
  return `${timestampPart}${randomPart}`
}

export default function NewQuote() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = async () => {
    if (creating) return
    setCreating(true)
    setError(null)

    const quoteNumber = generateQuoteNumber()

    const response = await fetch('/api/admin/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_id: params.id,
        quote_number: quoteNumber,
        currency: 'USD'
      })
    })

    const payload = (await response.json()) as { id?: string; error?: string }

    if (!response.ok || !payload.id) {
      setError(payload.error ?? 'Unable to create quote.')
      setCreating(false)
      return
    }

    router.push(`/companies/${params.id}/quotes/${payload.id}`)
  }

  return (
    <div className="min-h-full bg-slate-50 p-6">
      <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Create quote</h1>
        <p className="mt-1 text-sm text-slate-600">
          We&apos;ll create a draft quote, then you can add line items, set status, and convert to an invoice when accepted.
        </p>

        <ol className="mt-5 space-y-3 text-sm text-slate-700">
          <li className="rounded-xl border border-slate-200 p-3"><strong>1.</strong> Start with a draft quote.</li>
          <li className="rounded-xl border border-slate-200 p-3"><strong>2.</strong> Add products/services, quantity, pricing, and tax.</li>
          <li className="rounded-xl border border-slate-200 p-3"><strong>3.</strong> Mark accepted, then convert to invoice.</li>
        </ol>

        <button
          onClick={create}
          disabled={creating}
          className="mt-6 inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {creating ? 'Creating draft...' : 'Create draft quote'}
        </button>
        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
      </div>
    </div>
  )
}
