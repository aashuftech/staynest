'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import DashboardHero from '../../../components/dashboard/DashboardHero'
import Link from 'next/link'
import { Sparkles, BookOpen, MessageSquare, CreditCard, User, CheckCircle, Clock, DollarSign, Loader2 } from 'lucide-react'

export default function PaymentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (status === 'unauthenticated') router.push('/login') }, [status, router])
  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/bookings').then(r => r.json()).then(d => { setBookings(d.bookings || []); setLoading(false) }).catch(() => setLoading(false))
  }, [status])

  const totalPaid = bookings.filter(b => b.paymentStatus === 'PAID').reduce((s, b) => s + b.totalAmount, 0)
  const totalPending = bookings.filter(b => b.paymentStatus === 'PENDING').reduce((s, b) => s + b.totalAmount, 0)

  const sidebarLinks = [
    { icon: Sparkles, label: 'My Matches', href: '/dashboard' },
    { icon: BookOpen, label: 'Applications', href: '/dashboard/bookings' },
    { icon: MessageSquare, label: 'Messages', href: '/dashboard/messages' },
    { icon: CreditCard, label: 'Payments', href: '/dashboard/payments', active: true },
    { icon: User, label: 'Profile', href: '/dashboard/profile' },
  ]

  return (
    <div className="min-h-screen bg-[#f8f6f1]">
      <Navbar />
      <DashboardHero eyebrow="Payments" title="Payment History" description="Keep a clear view of your completed, pending, and upcoming payments." />
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
            <main className="flex-1 space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
              <div className="grid sm:grid-cols-3 gap-4">
                {[{ label: 'Total Paid', value: `$${totalPaid.toLocaleString()}`, icon: CheckCircle, cls: 'text-green-600 bg-green-50' },
                  { label: 'Pending', value: `$${totalPending.toLocaleString()}`, icon: Clock, cls: 'text-yellow-600 bg-yellow-50' },
                  { label: 'Total Bookings', value: bookings.length, icon: DollarSign, cls: 'text-blue-600 bg-blue-50' }].map(card => (
                  <div key={card.label} className="bg-white rounded-2xl shadow-card p-5 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.cls}`}><card.icon size={22} /></div>
                    <div><div className="text-2xl font-bold text-gray-900">{card.value}</div><div className="text-gray-400 text-sm">{card.label}</div></div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-3xl shadow-card overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100"><h2 className="font-bold text-gray-900">All Transactions</h2></div>
                {loading ? <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-blue-600" /></div>
                : bookings.length === 0 ? <div className="text-center py-12 text-gray-400">No transactions yet.</div>
                : <div className="divide-y divide-gray-50">
                    {bookings.map(b => {
                      const bid = b.id || b._id
                      return (
                        <div key={bid} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                          <div className="w-12 h-10 rounded-xl overflow-hidden shrink-0">
                            <img src={b.property?.images?.[0]} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 text-sm truncate">{b.property?.title}</div>
                            <div className="text-xs text-gray-400">{new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}{b.paymentMethod && ` · via ${b.paymentMethod}`}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-bold text-gray-900">${b.totalAmount?.toLocaleString()}</div>
                            <div className={`text-xs font-medium mt-0.5 ${b.paymentStatus === 'PAID' ? 'text-green-600' : b.paymentStatus === 'PENDING' ? 'text-yellow-600' : 'text-red-500'}`}>
                              {b.paymentStatus === 'PAID' ? '✓ Paid' : b.paymentStatus === 'PENDING' ? '⏳ Pending' : '✗ Failed'}
                            </div>
                          </div>
                          {b.paymentStatus === 'PENDING' && <Link href={`/payment?bookingId=${bid}`} className="btn-primary text-xs py-2 px-3 shrink-0">Pay Now</Link>}
                        </div>
                      )
                    })}
                  </div>}
              </div>
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
