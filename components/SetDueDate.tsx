'use client'

import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SetDueDate({
  invoiceId
}: {
  invoiceId: string
}) {
  const router = useRouter()

  const setDate = async (e: any) => {
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