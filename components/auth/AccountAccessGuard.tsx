'use client'

import { useCallback, useEffect, useRef } from 'react'
import { signOut, useSession } from 'next-auth/react'

/**
 * If an administrator bans a currently signed-in account, SessionProvider's
 * short revalidation detects it and this guard immediately removes the local
 * session and sends that browser to login.
 */
export default function AccountAccessGuard() {
  const { status } = useSession()
  const wasAuthenticated = useRef(false)
  const signingOut = useRef(false)

  const forceLogout = useCallback(() => {
    if (signingOut.current) return
    signingOut.current = true
    signOut({ callbackUrl: '/login?reason=account-unavailable' })
  }, [])

  useEffect(() => {
    if (status === 'authenticated') {
      wasAuthenticated.current = true
      return
    }

    if (status === 'unauthenticated' && wasAuthenticated.current) {
      wasAuthenticated.current = false
      forceLogout()
    }
  }, [status, forceLogout])

  useEffect(() => {
    if (status !== 'authenticated') return

    let active = true
    const verifyAccount = async () => {
      try {
        const response = await fetch('/api/auth/account-status', { cache: 'no-store' })
        const result = await response.json()
        if (active && (result?.banned || result?.authenticated === false)) forceLogout()
      } catch {
        // A network failure must not sign out an active account.
      }
    }

    verifyAccount()
    const interval = window.setInterval(verifyAccount, 2000)
    window.addEventListener('focus', verifyAccount)
    return () => {
      active = false
      window.clearInterval(interval)
      window.removeEventListener('focus', verifyAccount)
    }
  }, [status, forceLogout])

  return null
}
