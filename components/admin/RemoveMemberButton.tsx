'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RemoveMemberButton({ memberId }: { memberId: string }) {
  const router = useRouter()
  const [isRemoving, setIsRemoving] = useState(false)
  const [error, setError] = useState('')

  const removeMember = async () => {
    setIsRemoving(true)
    setError('')

    const response = await fetch(`/api/admin/members/${memberId}`, {
      method: 'DELETE'
    })

    setIsRemoving(false)

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ error: 'Could not remove member' }))
      setError(payload.error ?? 'Could not remove member')
      return
    }

    router.refresh()
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={removeMember}
        disabled={isRemoving}
        className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isRemoving ? 'Removing…' : 'Remove'}
      </button>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  )
}
