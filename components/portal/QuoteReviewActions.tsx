'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Props = {
  quoteId: string
  status: string
  canReview: boolean
}

export default function QuoteReviewActions({ quoteId, status, canReview }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [responseState, setResponseState] = useState<'accepted' | 'rejected' | null>(null)

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

    setResponseState(nextStatus)
    router.refresh()
  }

  if (responseState === 'accepted' || status === 'accepted') {
    return <div className="text-sm font-medium text-emerald-700">Thank you for accepting this quote.</div>
  }

  if (responseState === 'rejected' || status === 'rejected') {
    return <div className="text-sm font-medium text-rose-700">You declined this quote.</div>
  }

  if (!canReview) {
    return <div className="text-xs text-slate-500">Your portal role can view quotes but cannot accept/reject them.</div>
  }

  return (
    <div className="flex gap-2">
      <button
        disabled={loading}
        onClick={() => updateStatus('accepted')}
        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white transition active:scale-[0.98] disabled:opacity-60"
      >
        {loading ? 'Submitting…' : 'Accept Quote'}
      </button>
      <button
        disabled={loading}
        onClick={() => updateStatus('rejected')}
        className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm text-white transition active:scale-[0.98] disabled:opacity-60"
      >
        {loading ? 'Submitting…' : 'Reject Quote'}
      </button>
    </div>
  )
}
