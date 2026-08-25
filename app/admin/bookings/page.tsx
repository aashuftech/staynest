'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { Building2, Users, BookOpen, Brain, CheckCircle, Clock, Trash2, XCircle, Loader2, ClipboardList } from 'lucide-react'

export default function AdminBookingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDelete, setSelectedDelete] = useState<any | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN') router.push('/dashboard')
  }, [status, session, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/bookings').then(r => r.json()).then(d => { setBookings(d.bookings || []); setLoading(false) }).catch(() => setLoading(false))
  }, [status])

  const deleteCancelledBooking = async () => {
    if (!selectedDelete) return
    setDeleting(true)
    setDeleteError('')
    try {
      const bookingId = selectedDelete._id || selectedDelete.id
      const response = await fetch(`/api/bookings/${bookingId}?mode=delete`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to delete this booking.')
      setBookings(current => current.filter(booking => (booking._id || booking.id) !== bookingId))
      setSelectedDelete(null)
    } catch (error: any) {
      setDeleteError(error.message || 'Unable to delete this booking.')
    } finally {
      setDeleting(false)
    }
  }

  const totalRevenue = bookings.filter(b => b.paymentStatus === 'PAID').reduce((s, b) => s + b.totalAmount, 0)
  const statusIcon: Record<string, any> = {
    CONFIRMED: <CheckCircle size={13} className="text-green-600" />,
    PENDING: <Clock size={13} className="text-yellow-600" />,
    CANCELLED: <XCircle size={13} className="text-red-500" />,
    COMPLETED: <CheckCircle size={13} className="text-blue-600" />,
  }

  const sidebarLinks = [
    { icon: Building2, label: 'Dashboard', href: '/admin' },
    { icon: Building2, label: 'Properties', href: '/admin/properties' },
    { icon: ClipboardList, label: 'Property Requests', href: '/admin/property-requests' },
    { icon: Users, label: 'Users', href: '/admin/users' },
    { icon: BookOpen, label: 'Bookings', href: '/admin/bookings', active: true },
    { icon: Brain, label: 'AI Activity', href: '/admin/ai' },
  ]

  return (
    <div className="min-h-screen bg-[#f8f6f1]">
      <Navbar />
      <section className="relative overflow-hidden bg-[#0e0d0b] px-4 pb-10 pt-28 sm:px-6 sm:pt-32"><div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(185,138,67,.3),transparent_45%)]" /><div className="relative mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#d9ab59]">Booking operations</p><h1 className="mt-3 font-display text-4xl font-light text-white sm:text-5xl">All Bookings</h1><p className="mt-2 max-w-2xl text-sm text-[#d2c8b8]">Monitor reservation activity and payment status from one workspace.</p></div></section>
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            <aside className="hidden lg:flex flex-col w-56 shrink-0 gap-1">
              {sidebarLinks.map(link => (
                <Link key={link.href} href={link.href} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${(link as any).active ? 'bg-[#211e19] text-white shadow-md' : 'bg-white text-[#575149] shadow-sm hover:bg-[#f1ede5] hover:text-[#211e19]'}`}>
                  <link.icon size={20} /><span className="text-xs font-medium">{link.label}</span>
                </Link>
              ))}
            </aside>
            <main className="flex-1 space-y-6">
              <div className="flex items-center justify-between">
                <div><h1 className="text-2xl font-bold text-gray-900">All Bookings</h1><p className="text-gray-400 text-sm">{bookings.length} total bookings</p></div>
                <div className="bg-green-50 text-green-700 font-bold px-4 py-2 rounded-xl text-sm">Revenue: ${totalRevenue.toLocaleString()}</div>
              </div>
              <div className="bg-white rounded-3xl shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-gray-100 bg-gray-50 text-left">
                      <th className="px-5 py-4 text-xs font-semibold text-gray-400 uppercase">Property</th>
                      <th className="px-5 py-4 text-xs font-semibold text-gray-400 uppercase">Guest</th>
                      <th className="px-5 py-4 text-xs font-semibold text-gray-400 uppercase">Dates</th>
                      <th className="px-5 py-4 text-xs font-semibold text-gray-400 uppercase">Amount</th>
                      <th className="px-5 py-4 text-xs font-semibold text-gray-400 uppercase">Status</th>
                      <th className="px-5 py-4 text-xs font-semibold text-gray-400 uppercase">Payment</th>
                      <th className="px-5 py-4 text-xs font-semibold text-gray-400 uppercase">Action</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {loading ? (
                        <tr><td colSpan={7} className="text-center py-12"><Loader2 size={28} className="animate-spin text-blue-600 mx-auto" /></td></tr>
                      ) : bookings.length === 0 ? (
                        <tr><td colSpan={7} className="text-center py-12 text-gray-400">No bookings yet</td></tr>
                      ) : bookings.map(b => (
                        <tr key={b._id || b.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              {b.property?.images?.[0] && <img src={b.property.images[0]} className="w-9 h-8 rounded-lg object-cover" alt="" />}
                              <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{b.property?.title}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-500 truncate max-w-[100px]">{b.user?.name || b.userId || '—'}</td>
                          <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">{new Date(b.checkIn).toLocaleDateString()} → {new Date(b.checkOut).toLocaleDateString()}</td>
                          <td className="px-5 py-4 text-sm font-bold text-gray-900">${b.totalAmount?.toLocaleString()}</td>
                          <td className="px-5 py-4"><span className="flex items-center gap-1 text-xs font-medium">{statusIcon[b.status] || <Clock size={13} />} {b.status}</span></td>
                          <td className="px-5 py-4"><span className={`badge text-xs ${b.paymentStatus === 'PAID' ? 'badge-green' : b.paymentStatus === 'PENDING' ? 'badge-yellow' : 'badge-red'}`}>{b.paymentStatus}</span></td>
                          <td className="px-5 py-4">{b.status === 'CANCELLED' ? <button type="button" onClick={() => { setSelectedDelete(b); setDeleteError('') }} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"><Trash2 size={14} />Delete</button> : <span className="text-xs text-gray-300">—</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
      <Footer />
      {selectedDelete && <div className="fixed inset-0 z-[80] flex items-center justify-center p-4"><button aria-label="Close" disabled={deleting} onClick={() => setSelectedDelete(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" /><div role="dialog" aria-modal="true" aria-labelledby="delete-booking-title" className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl"><button aria-label="Close" disabled={deleting} onClick={() => setSelectedDelete(null)} className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"><XCircle size={18} /></button><div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600"><Trash2 size={22} /></div><h2 id="delete-booking-title" className="mt-5 text-2xl font-bold text-gray-900">Delete cancelled booking?</h2><p className="mt-3 text-sm leading-6 text-gray-500">This cancelled booking for {selectedDelete.property?.title || 'this property'} will be permanently removed.</p>{deleteError && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{deleteError}</p>}<div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button disabled={deleting} onClick={() => setSelectedDelete(null)} className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 disabled:opacity-50">Cancel</button><button disabled={deleting} onClick={deleteCancelledBooking} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50">{deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}{deleting ? 'Deleting...' : 'Delete booking'}</button></div></div></div>}
    </div>
  )
}
