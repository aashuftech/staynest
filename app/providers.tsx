'use client'
import { SessionProvider } from 'next-auth/react'
import AccountAccessGuard from '@/components/auth/AccountAccessGuard'
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider refetchInterval={5} refetchOnWindowFocus>
    <AccountAccessGuard />
    {children}
  </SessionProvider>
}
