'use client'

import { supabase } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'

export default function NewQuote() {
  const router = useRouter()
  const params = useParams()

  const create = async () => {
    const { data } = await supabase
      .from('quotes')
      .insert({
        company_id: params.id,
        status: 'draft'
      })
      .select()
      .single()

    router.push(`/companies/${params.id}/quotes/${data.id}`)
  }

  return (
    <div className="p-6">
      <button onClick={create} className="bg-black text-white px-4 py-2">
        Create Quote
      </button>
    </div>
  )
}