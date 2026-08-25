'use client'
import { SessionProvider } from 'next-auth/react'
import AccountAccessGuard from '@/components/auth/AccountAccessGuard'
export function Providers({ children }: { children: React.ReactNode }) {
  // AccountAccessGuard checks only account access. Page data must never depend
  // on the session object itself, otherwise session updates can re-run page fetches.
  return <SessionProvider refetchOnWindowFocus={false} refetchWhenOffline={false}>
    <AccountAccessGuard />
    {children}
  </SessionProvider>
}
