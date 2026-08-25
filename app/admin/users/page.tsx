'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import {
  Ban,
  BookOpen,
  Brain,
  Building2,
  ClipboardList,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  Shield,
  UserCheck,
  Users,
} from 'lucide-react'

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState('')
  const [notice, setNotice] = useState('')

  const loadUsers = async (showTableLoader = true) => {
    if (showTableLoader) setLoading(true)

    try {
      const response = await fetch(
        `/api/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`
      )
      const data = await response.json()
      setUsers(data.users || [])
    } finally {
      if (showTableLoader) setLoading(false)
    }
  }

  const refreshUsers = async () => {
    setRefreshing(true)
    try {
      await loadUsers(false)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (status !== 'authenticated') return

    const timer = window.setTimeout(() => {
      loadUsers()
    }, 180)

    return () => window.clearTimeout(timer)
  }, [status, search])

  const updateBanStatus = async (user: any, action: 'BAN' | 'UNBAN') => {
    setUpdatingId(user._id)
    setNotice('')

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          action,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to update user.')
      }

      const isBanned = data?.user?.isBanned === true

      setUsers(current =>
        current.map(item =>
          item._id === user._id ? { ...item, isBanned } : item
        )
      )

      setNotice(
        isBanned
          ? `${user.name} has been banned.`
          : `${user.name} has been unbanned.`
      )

      await loadUsers(false)
    } catch (error: any) {
      setNotice(error.message || 'Unable to update user.')
    } finally {
      setUpdatingId('')
    }
  }

  const sidebarLinks = [
    { icon: Building2, label: 'Dashboard', href: '/admin' },
    { icon: Building2, label: 'Properties', href: '/admin/properties' },
    {
      icon: ClipboardList,
      label: 'Property Requests',
      href: '/admin/property-requests',
    },
    { icon: Users, label: 'Users', href: '/admin/users', active: true },
    { icon: BookOpen, label: 'Bookings', href: '/admin/bookings' },
    { icon: Brain, label: 'AI Activity', href: '/admin/ai' },
  ]

  return (
    <div className="min-h-screen bg-[#f8f6f1]">
      <Navbar />

      <section className="relative overflow-hidden bg-[#0e0d0b] px-4 pb-10 pt-28 sm:px-6 sm:pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(185,138,67,.3),transparent_45%)]" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#d9ab59]">
            Account management
          </p>
          <h1 className="mt-3 font-display text-4xl font-light text-white sm:text-5xl">
            Users
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#d2c8b8]">
            Review account status, AI activity, and user access.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          <aside className="hidden w-56 shrink-0 flex-col gap-1 lg:flex">
            {sidebarLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  (link as any).active
                    ? 'bg-[#211e19] text-white shadow-md'
                    : 'bg-white text-[#575149] shadow-sm hover:bg-[#f1ede5] hover:text-[#211e19]'
                }`}
              >
                <link.icon size={20} />
                <span className="text-xs font-medium">{link.label}</span>
              </Link>
            ))}
          </aside>

          <main className="min-w-0 flex-1 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  User Management
                </h2>
                <p className="text-sm text-gray-400">
                  {users.length} accounts · search by name, email, or user ID such as #12
                </p>
              </div>

              <button
                type="button"
                onClick={refreshUsers}
                disabled={refreshing || loading}
                title="Refresh users"
                aria-label="Refresh users"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dfd6c8] bg-white text-[#8d6425] shadow-sm transition hover:border-[#bc842b] hover:bg-[#fffaf0] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={17}
                  className={refreshing ? 'animate-spin' : ''}
                />
              </button>
            </div>

            {notice && (
              <div className="rounded-xl border border-[#dfc88f] bg-[#fff9e9] px-4 py-3 text-sm text-[#73531c]">
                {notice}
              </div>
            )}

            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search name, email, or #user ID..."
                className="input-field pl-9"
                value={search}
                onChange={event => setSearch(event.target.value)}
              />
            </div>

            <div className="overflow-hidden rounded-3xl bg-white shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[890px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-left">
                      <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-400">
                        User
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-400">
                        Email
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-400">
                        Status
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase text-gray-400">
                        Joined
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-50">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center">
                          <Loader2
                            size={28}
                            className="mx-auto animate-spin text-[#b98025]"
                          />
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-12 text-center text-gray-400"
                        >
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map(user => {
                        const admin = user.role === 'ADMIN'
                        const busy = updatingId === user._id

                        return (
                          <tr
                            key={user._id}
                            className={`transition-colors ${
                              user.isBanned
                                ? 'bg-gray-50 opacity-45 grayscale'
                                : 'hover:bg-[#fffdf8]'
                            }`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#b98025] text-sm font-bold text-white">
                                  {user.image ? (
                                    <img
                                      src={user.image}
                                      className="h-full w-full object-cover"
                                      alt=""
                                    />
                                  ) : (
                                    (user.name?.[0] || 'U').toUpperCase()
                                  )}
                                </div>

                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {user.name || '—'}
                                  </p>
                                  {!admin && (
                                    <p className="mt-0.5 text-xs font-semibold text-[#a56d1e]">
                                      #{user.publicId || '—'}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 text-sm text-gray-500">
                              {user.email}
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                                  user.isBanned
                                    ? 'bg-red-100 text-red-700'
                                    : admin
                                      ? 'bg-purple-100 text-purple-700'
                                      : 'bg-emerald-100 text-emerald-700'
                                }`}
                              >
                                {admin && <Shield size={11} />}
                                {user.isBanned
                                  ? 'BANNED'
                                  : admin
                                    ? 'ADMIN'
                                    : 'ACTIVE'}
                              </span>
                            </td>

                            <td className="px-6 py-4 text-sm text-gray-400">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex justify-end gap-2">
                                {!admin && (
                                  <>
                                    <Link
                                      href={`/admin/users/${user._id}/activities`}
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#dfd6c8] px-3 py-2 text-xs font-semibold text-[#5b5144] transition hover:border-[#bc842b] hover:bg-[#fffaf0]"
                                    >
                                      <Eye size={14} />
                                      User Activities
                                    </Link>

                                    <button
                                      type="button"
                                      disabled={busy}
                                      onClick={() =>
                                        updateBanStatus(
                                          user,
                                          user.isBanned ? 'UNBAN' : 'BAN'
                                        )
                                      }
                                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white transition disabled:opacity-50 ${
                                        user.isBanned
                                          ? 'bg-emerald-600 hover:bg-emerald-700'
                                          : 'bg-red-600 hover:bg-red-700'
                                      }`}
                                    >
                                      {busy ? (
                                        <Loader2
                                          size={14}
                                          className="animate-spin"
                                        />
                                      ) : user.isBanned ? (
                                        <UserCheck size={14} />
                                      ) : (
                                        <Ban size={14} />
                                      )}
                                      {user.isBanned
                                        ? 'Unban User'
                                        : 'Ban User'}
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  )
}