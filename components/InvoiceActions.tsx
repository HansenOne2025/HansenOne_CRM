'use client'

import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function InvoiceActions({
  invoiceId
}: {
  invoiceId: string
}) {
  const router = useRouter()

  const updateStatus = async (status: string) => {
    await supabase
      .from('invoices')
      .update({ status })
      .eq('id', invoiceId)

    router.refresh()
  }

  const markPaid = async () => {
    await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('id', invoiceId)

    router.refresh()
  }

  return (
    <div className="flex gap-2">
      <button onClick={() => updateStatus('sent')} className="border px-3 py-1">
        Sent
      </button>

      <button onClick={markPaid} className="bg-black text-white px-3 py-1">
        Mark Paid
      </button>
    </div>
  )
}