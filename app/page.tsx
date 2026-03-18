import { createServerSupabase } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createServerSupabase()

  const res = await supabase.from('companies').select('*')

  return <pre>{JSON.stringify(res, null, 2)}</pre>
}