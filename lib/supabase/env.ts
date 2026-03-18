const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

const adminKey =
  process.env.SUPABASE_SECRET_KEY ??
  process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
}

if (!publishableKey) {
  throw new Error(
    'Missing Supabase client key: set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY for backward compatibility).'
  )
}

export const supabaseEnv = {
  url,
  key: publishableKey,
  adminKey
}
