'use client'

import { supabase } from '@/lib/supabase/client'
import type { ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function SetDueDate({
  invoiceId
}: {
  invoiceId: string
}) {
  const router = useRouter()

  const setDate = async (e: ChangeEvent<HTMLInputElement>) => {
    await supabase
      .from('invoices')
      .update({ due_date: e.target.value })
      .eq('id', invoiceId)

    router.refresh()
  }

  return (
    <input
      type="date"
      className="border p-1"
      onChange={setDate}
    />
  )
}