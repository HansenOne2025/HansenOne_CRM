const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const parseList = (value: string | undefined) =>
  (value ?? '')
    .split(',')
    .map(id => id.trim().toLowerCase())
    .filter(Boolean)

export const adminUserIds = parseList(process.env.ADMIN_USER_UUIDS)

export const isAdminUser = (userId: string | undefined | null) => {
  if (!userId) return false
  return adminUserIds.includes(userId.trim().toLowerCase())
}

export const hasValidAdminConfig = () => {
  if (!adminUserIds.length) return false
  return adminUserIds.every(id => UUID_RE.test(id))
}

export const adminAuthError = () => {
  if (!adminUserIds.length) {
    return 'Missing ADMIN_USER_UUIDS. Add one or more Supabase user UUIDs separated by commas.'
  }

  if (!hasValidAdminConfig()) {
    return 'ADMIN_USER_UUIDS contains an invalid UUID. Check formatting and try again.'
  }

  return null
}
