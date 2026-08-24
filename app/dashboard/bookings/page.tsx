'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import DashboardHero from '../../../components/dashboard/DashboardHero'
import Link from 'next/link'
import { Sparkles, BookOpen, MessageSquare, CreditCard, User, CalendarDays, MapPin, CheckCircle, Clock, XCircle, Loader2, AlertTriangle, X, Trash2 } from 'lucide-react'

const STATUS: Record<string,{label:string,cls:string,Icon:any}> = {
  PENDING:{label:'Pending',cls:'badge-yellow',Icon:Clock},
  CONFIRMED:{label:'Confirmed',cls:'badge-green',Icon:CheckCircle},
  CANCELLED:{label:'Cancelled',cls:'badge-red',Icon:XCircle},
  COMPLETED:{label:'Completed',cls:'badge-blue',Icon:CheckCircle},
}

export default function BookingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState('')
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => { if (status === 'unauthenticated') router.push('/login') }, [status, router])
  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/bookings').then(r => r.json()).then(d => { setBookings(d.bookings || []); setLoading(false) }).catch(() => setLoading(false))
  }, [status])

  const handleCancel = async () => {
    if (!bookingToCancel) return
    setCancelling(true)
    setCancelError('')
    try {
      const response = await fetch(`/api/bookings/${bookingToCancel}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) {
        setCancelError(data.error || 'Unable to cancel this booking.')
        return
      }
      setBookings(prev => prev.map(b => (b.id === bookingToCancel || b._id === bookingToCancel) ? { ...b, status: 'CANCELLED' } : b))
      setBookingToCancel(null)
    } catch {
      setCancelError('Unable to cancel this booking. Please try again.')
    } finally {
      setCancelling(false)
    }
  }

  const deleteCancelledBooking = async () => {
    if (!bookingToDelete) return
    setDeleting(bookingToDelete)
    setDeleteError('')
    try {
      const response = await fetch(`/api/bookings/${bookingToDelete}?mode=delete`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) {
        setDeleteError(data.error || 'Unable to delete this booking.')
        return
      }
      setBookings(prev => prev.filter(b => (b.id || b._id) !== bookingToDelete))
      setBookingToDelete(null)
    } catch {
      setDeleteError('Unable to delete this booking. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  const sidebarLinks = [
    { icon: Sparkles, label: 'My Matches', href: '/dashboard' },
    { icon: BookOpen, label: 'Applications', href: '/dashboard/bookings', active: true },
    { icon: MessageSquare, label: 'Messages', href: '/dashboard/messages' },
    { icon: CreditCard, label: 'Payments', href: '/dashboard/payments' },
    { icon: User, label: 'Profile', href: '/dashboard/profile' },
  ]

  return (
    <div className="min-h-screen bg-[#f8f6f1]">
      <Navbar />
      <DashboardHero eyebrow="Applications" title="My Bookings" description="Track every stay, payment, and booking update in one place." />
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            <aside className="hidden lg:flex flex-col w-56 shrink-0 gap-1">
              {sidebarLinks.map(link => (
                <Link key={link.href} href={link.href} className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all ${(link as any).active ? 'bg-[#211e19] text-white shadow-md' : 'bg-white shadow-sm hover:bg-[#f1ede5] text-[#575149] hover:text-[#211e19]'}`}>
                  <link.icon size={20} /><span className="text-xs font-medium">{link.label}</span>
                </Link>
              ))}
            </aside>
            <main className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <div><h1 className="text-2xl font-bold text-gray-900">My Bookings</h1><p className="text-gray-400 text-sm">{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</p></div>
                <Link href="/apartments" className="btn-primary py-2.5 px-5 text-sm">+ New Booking</Link>
              </div>
              {loading ? <div className="flex justify-center py-20"><Loader2 size={36} className="animate-spin text-blue-600" /></div>
              : bookings.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-card p-16 text-center">
                  <div className="text-5xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No bookings yet</h3>
                  <p className="text-gray-400 mb-6">Start browsing apartments to make your first booking.</p>
                  <Link href="/apartments" className="btn-primary inline-block py-3 px-6">Browse Apartments</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map(b => {
                    const sc = STATUS[b.status] || STATUS.PENDING
                    const bid = b.id || b._id
                    return (
                      <div key={bid} className="bg-white rounded-3xl shadow-card overflow-hidden hover:shadow-card-hover transition-all">
                        <div className="flex flex-col sm:flex-row gap-4 p-5">
                          <div className="w-full sm:w-32 h-24 rounded-2xl overflow-hidden shrink-0">
                            <img src={b.property?.images?.[0] || ''} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                              <div>
                                <h3 className="font-bold text-gray-900">{b.property?.title || 'Property'}</h3>
                                <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5"><MapPin size={11} />{b.property?.city}</div>
                              </div>
                              <span className={`badge ${sc.cls} flex items-center gap-1`}><sc.Icon size={11} />{sc.label}</span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                              <div className="flex items-center gap-1.5"><CalendarDays size={13} className="text-blue-500" />{new Date(b.checkIn).toLocaleDateString()} → {new Date(b.checkOut).toLocaleDateString()}</div>
                              <div className="font-bold text-gray-900">${b.totalAmount?.toLocaleString()}</div>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${b.paymentStatus === 'PAID' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>{b.paymentStatus}</span>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              <Link href={`/apartments/${b.property?._id || b.propertyId}`} className="text-xs font-medium text-blue-600 border border-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-50">View Property</Link>
                              {b.paymentStatus === 'PENDING' && <Link href={`/payment?bookingId=${bid}`} className="text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-xl">Complete Payment</Link>}
                              {['PENDING', 'CONFIRMED'].includes(b.status) && <button onClick={() => { setCancelError(''); setBookingToCancel(bid) }} className="text-xs font-medium text-red-500 border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-50">Cancel Booking</button>}
                              {b.status === 'CANCELLED' && <button onClick={() => { setDeleteError(''); setBookingToDelete(bid) }} disabled={deleting === bid} className="text-xs font-medium text-red-600 border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-50 disabled:opacity-50">{deleting === bid ? 'Deleting...' : <span className="flex items-center gap-1"><Trash2 size={12} />Delete</span>}</button>}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
      <Footer />
      {bookingToCancel && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="cancel-booking-title">
          <button
            type="button"
            aria-label="Close cancellation dialog"
            disabled={cancelling}
            onClick={() => setBookingToCancel(null)}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <AlertTriangle size={25} />
              </div>
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setBookingToCancel(null)}
                className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <h2 id="cancel-booking-title" className="mt-5 text-center text-2xl font-bold text-gray-900">Are you sure?</h2>
            <p className="mt-2 text-center text-sm leading-6 text-gray-500">Do you really want to cancel this booking? This action cannot be undone.</p>
            {cancelError && <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-center text-sm text-red-600">{cancelError}</p>}
            <div className="mt-6 flex flex-col-reverse justify-center gap-3 sm:flex-row">
              <button type="button" disabled={cancelling} onClick={() => setBookingToCancel(null)} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Keep Booking</button>
              <button type="button" disabled={cancelling} onClick={handleCancel} className="flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60">
                {cancelling && <Loader2 size={16} className="animate-spin" />}
                {cancelling ? 'Cancelling...' : 'Yes, Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
      {bookingToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="delete-booking-title">
          <button
            type="button"
            aria-label="Close delete booking dialog"
            disabled={Boolean(deleting)}
            onClick={() => setBookingToDelete(null)}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 text-center shadow-2xl">
            <button
              type="button"
              disabled={Boolean(deleting)}
              onClick={() => setBookingToDelete(null)}
              className="absolute right-5 top-5 rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              aria-label="Close">
              <X size={20} />
            </button>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <Trash2 size={23} />
            </div>
            <h2 id="delete-booking-title" className="mt-5 text-center text-2xl font-bold text-gray-900">Remove cancelled booking?</h2>
            <p className="mx-auto mt-2 max-w-sm text-center text-sm leading-6 text-gray-500">This will only remove the cancelled booking from your My Bookings list. This action cannot be undone.</p>
            {deleteError && <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-center text-sm text-red-600">{deleteError}</p>}
            <div className="mt-6 flex flex-col-reverse justify-center gap-3 sm:flex-row">
              <button type="button" disabled={Boolean(deleting)} onClick={() => setBookingToDelete(null)} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50">Keep Booking</button>
              <button type="button" disabled={Boolean(deleting)} onClick={deleteCancelledBooking} className="flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60">
                {deleting && <Loader2 size={16} className="animate-spin" />}
                {deleting ? 'Deleting...' : 'Yes, Delete Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
