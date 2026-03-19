'use client'

import type { ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function SetDueDate({
  invoiceId,
  currentDueDate
}: {
  invoiceId: string
  currentDueDate: string | null
}) {
  const router = useRouter()

  const setDate = async (e: ChangeEvent<HTMLInputElement>) => {
    await fetch(`/api/admin/invoices/${invoiceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dueDate: e.target.value })
    })

    router.refresh()
  }

  return <input type="date" className="rounded border p-1" defaultValue={currentDueDate ?? ''} onChange={setDate} />
}
