import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HansenOne CRM',
  description: 'CRM, quotes, and invoices powered by Supabase'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
