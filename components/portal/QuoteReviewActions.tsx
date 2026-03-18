'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function QuoteReviewActions({
  quoteId,
  status
}: {
  quoteId: string
  status: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const updateStatus = async (nextStatus: 'accepted' | 'rejected') => {
    setLoading(true)
    const res = await fetch(`/api/portal/quotes/${quoteId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus })
    })

    setLoading(false)
    if (!res.ok) {
      alert('Could not update quote status')
      return
    }

    router.refresh()
  }

  if (status === 'accepted' || status === 'rejected') {
    return <div className="text-sm text-slate-500">Already responded.</div>
  }

  return (
    <div className="flex gap-2">
      <button
        disabled={loading}
        onClick={() => updateStatus('accepted')}
        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white"
      >
        Accept
      </button>
      <button
        disabled={loading}
        onClick={() => updateStatus('rejected')}
        className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm text-white"
      >
        Reject
      </button>
    </div>
  )
}
