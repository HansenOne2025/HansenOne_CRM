'use client'

import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function QuoteItemRow({
  id,
  name,
  qty,
  unitPrice,
  taxRate
}: {
  id: string
  name: string
  qty: number
  unitPrice: number
  taxRate: number
}) {
  const router = useRouter()
  const [removing, setRemoving] = useState(false)

  const line = qty * unitPrice
  const tax = line * (taxRate / 100)
  const total = line + tax

  const remove = async () => {
    if (removing) return
    setRemoving(true)
    await supabase.from('quote_items').delete().eq('id', id)
    router.refresh()
  }

  return (
    <div className="grid grid-cols-12 items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm">
      <div className="col-span-12 md:col-span-4 font-medium text-slate-900">{name}</div>
      <div className="col-span-3 md:col-span-1 text-slate-600">{qty}</div>
      <div className="col-span-3 md:col-span-2 text-slate-600">${unitPrice.toFixed(2)}</div>
      <div className="col-span-3 md:col-span-2 text-slate-600">{taxRate}%</div>
      <div className="col-span-3 md:col-span-2 font-medium text-slate-900">${total.toFixed(2)}</div>
      <div className="col-span-12 md:col-span-1 md:text-right">
        <button
          onClick={remove}
          disabled={removing}
          className="rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-700 disabled:opacity-40"
        >
          Remove
        </button>
      </div>
    </div>
  )
}
