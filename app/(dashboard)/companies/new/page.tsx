'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NewCompany() {
  const [name, setName] = useState('')
  const router = useRouter()

  const create = async () => {
    await supabase.from('companies').insert({ name })
    router.push('/companies')
  }

  return (
    <div className="p-6 max-w-md space-y-4">
      <h1 className="text-xl font-semibold">New Company</h1>

      <input
        className="border p-2 w-full"
        placeholder="Company name"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <button
        onClick={create}
        className="bg-black text-white px-4 py-2"
      >
        Create
      </button>
    </div>
  )
}