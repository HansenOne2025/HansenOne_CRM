import AdminLoginForm from './AdminLoginForm'

type PageProps = {
  searchParams?: Promise<{ error?: string; next?: string; user_id?: string }>
}

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {}
  const nextPath = params.next && params.next.startsWith('/') ? params.next : '/dashboard'

  return (
    <AdminLoginForm
      initialError={params.error ?? null}
      initialUserId={params.user_id ?? null}
      nextPath={nextPath}
    />
  )
}
