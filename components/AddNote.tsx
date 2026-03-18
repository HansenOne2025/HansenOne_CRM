'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AddNote({ companyId }: { companyId: string }) {
  const [content, setContent] = useState('')
  const router = useRouter()

  const add = async () => {
    if (!content) return

    await supabase.from('notes').insert({
      content,
      company_id: companyId
    })

    setContent('')
    router.refresh()
  }

  return (
    <div className="space-y-2">
      <textarea
        className="border w-full p-2"
        placeholder="Add note..."
        value={content}
        onChange={e => setContent(e.target.value)}
      />

      <button onClick={add} className="bg-black text-white px-4 py-2">
        Add Note
      </button>
    </div>
  )
}