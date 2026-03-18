'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AddQuoteItem({ quoteId }: { quoteId: string }) {
  const router = useRouter()

  const [name, setName] = useState('')
  const [qty, setQty] = useState(1)
  const [price, setPrice] = useState(0)
  const [tax, setTax] = useState(0)

  const add = async () => {
    await supabase.from('quote_items').insert({
      quote_id: quoteId,
      name,
      qty,
      unit_price: price,
      tax_rate: tax
    })

    router.refresh()
  }

  return (
    <div className="grid grid-cols-5 gap-2">
      <input className="border p-2" placeholder="Name" onChange={e => setName(e.target.value)} />
      <input className="border p-2" type="number" placeholder="Qty" onChange={e => setQty(Number(e.target.value))} />
      <input className="border p-2" type="number" placeholder="Price" onChange={e => setPrice(Number(e.target.value))} />
      <input className="border p-2" type="number" placeholder="Tax %" onChange={e => setTax(Number(e.target.value))} />

      <button onClick={add} className="bg-black text-white">
        Add
      </button>
    </div>
  )
}