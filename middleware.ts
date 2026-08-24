import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl
  const isLoggedIn = !!token
  const isBanned = token?.isBanned === true
  const isAdmin = token?.role === 'ADMIN'
  const isDashboard = pathname.startsWith('/dashboard')
  const isAdminRoute = pathname.startsWith('/admin')
  const isAuthPage = pathname === '/login' || pathname === '/signup'

  if (isAuthPage && isLoggedIn) return NextResponse.redirect(new URL('/dashboard', req.url))
  if ((isDashboard || isAdminRoute) && (!isLoggedIn || isBanned)) return NextResponse.redirect(new URL('/login', req.url))
  if (isAdminRoute && !isAdmin) return NextResponse.redirect(new URL('/dashboard', req.url))
  return NextResponse.next()
}

export const config = { matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/signup'] }
