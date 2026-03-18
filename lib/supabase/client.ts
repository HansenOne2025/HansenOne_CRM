import { createBrowserClient } from '@supabase/ssr'
import { supabaseEnv } from './env'

export const supabase = createBrowserClient(
  supabaseEnv.url,
  supabaseEnv.key
)
