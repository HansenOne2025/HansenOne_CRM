'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddQuoteItem({ quoteId }: { quoteId: string }) {
  const router = useRouter()

  const [name, setName] = useState('')
  const [qty, setQty] = useState(1)
  const [price, setPrice] = useState(0)
  const [tax, setTax] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const add = async () => {
    if (!name.trim() || qty <= 0 || saving) return

    setSaving(true)
    setError(null)

    const response = await fetch('/api/admin/quote-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quote_id: quoteId,
        name: name.trim(),
        qty,
        unit_price: price,
        tax_rate: tax
      })
    })

    const payload = (await response.json()) as { id?: string; error?: string }

    if (!response.ok || !payload.id) {
      setError(payload.error ?? 'Unable to add item.')
      setSaving(false)
      return
    }

    setName('')
    setQty(1)
    setPrice(0)
    setTax(0)
    setSaving(false)
    router.refresh()
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Add line item</h2>
        <p className="text-xs text-slate-500">Use clear names so clients understand what they are approving.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-12">
        <div className="md:col-span-5">
          <label className="text-xs font-medium text-slate-600">Item</label>
          <input className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-sm" placeholder="Site inspection" value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs font-medium text-slate-600">Qty</label>
          <input className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-sm" type="number" min={1} value={qty} onChange={e => setQty(Number(e.target.value))} />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs font-medium text-slate-600">Unit price</label>
          <input className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-sm" type="number" min={0} step="0.01" value={price} onChange={e => setPrice(Number(e.target.value))} />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs font-medium text-slate-600">Tax %</label>
          <input className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-sm" type="number" min={0} step="0.01" value={tax} onChange={e => setTax(Number(e.target.value))} />
        </div>

        <div className="md:col-span-1 md:flex md:items-end">
          <button onClick={add} disabled={saving || !name.trim() || qty <= 0} className="w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40">
            {saving ? '...' : 'Add'}
          </button>
        </div>
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  )
}
