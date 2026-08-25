'use client'

import { useCallback, useEffect, useRef } from 'react'
import { signOut, useSession } from 'next-auth/react'

/**
 * Checks account access when the signed-in browser is opened or brought back
 * into focus. It deliberately does not poll while the page is idle.
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

    // One initial check plus focus checks keeps the ban/logout safeguard
    // without producing a terminal request every two seconds.
    verifyAccount()
    window.addEventListener('focus', verifyAccount)
    return () => {
      active = false
      window.removeEventListener('focus', verifyAccount)
    }
  }, [status, forceLogout])

  return null
}
