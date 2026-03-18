import { createClient } from '@supabase/supabase-js'
import { supabaseEnv } from './env'

export const createAdminSupabase = () => {
  if (!supabaseEnv.adminKey) {
    throw new Error(
      'Missing Supabase admin key: set SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY for backward compatibility).'
    )
  }

  return createClient(supabaseEnv.url, supabaseEnv.adminKey)
}
