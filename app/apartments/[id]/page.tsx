'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { MapPin, BedDouble, Bath, Star, CheckCircle, ChevronLeft, ChevronRight, Heart, Loader2, CreditCard } from 'lucide-react'

export default function PropertyDetailPage() {
  const { id } = useParams()
  const { data: session } = useSession()
  const router = useRouter()
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [liked, setLiked] = useState(false)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [booking, setBooking] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const isBuy = property?.listingPurpose === 'BUY'

  useEffect(() => {
    if (!id) return
    fetch(`/api/properties/${id}`).then(r => r.json()).then(d => { setProperty(d); setLoading(false) }).catch(() => setLoading(false))
  }, [id])

  const months = checkIn && checkOut ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24 * 30))) : 1
  const rent = property ? property.pricePerMonth * months : 0
  const tax = Math.round(rent * 0.1)
  const total = rent + tax + 100
  const selectedDatesAreBooked = checkIn && checkOut && (property?.bookedRanges || []).some((range: any) =>
    new Date(range.checkIn) < new Date(checkOut) && new Date(range.checkOut) > new Date(checkIn)
  )

  const handleBook = async () => {
    if (!session) { router.push('/login'); return }
    if (isBuy) {
      setBooking(true); setBookingError('')
      try {
        const response = await fetch('/api/purchase-reservations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ propertyId: id }) })
        const data = await response.json()
        if (!response.ok) { setBookingError(data.error || 'Unable to reserve this property.'); return }
        router.push(`/payment?bookingId=${data.bookingId}`)
      } catch { setBookingError('Something went wrong.') } finally { setBooking(false) }
      return
    }
    if (!checkIn || !checkOut) { setBookingError('Please select check-in and check-out dates'); return }
    if (selectedDatesAreBooked) { setBookingError('This property is already booked for the selected dates. Please choose different dates.'); return }
    setBooking(true); setBookingError('')
    try {
      const res = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ propertyId: id, checkIn, checkOut, totalAmount: total, serviceTax: tax, cleaningFee: 100 }) })
      const data = await res.json()
      if (!res.ok) { setBookingError(data.error || 'Booking failed'); setBooking(false); return }
      router.push(`/payment?bookingId=${data.booking.id || data.booking._id}`)
    } catch { setBookingError('Something went wrong.'); setBooking(false) }
  }

  if (loading) return <div className="min-h-screen bg-gray-50"><Navbar /><div className="flex items-center justify-center h-screen"><Loader2 size={40} className="animate-spin text-blue-600" /></div></div>
  if (!property) return <div className="min-h-screen bg-gray-50"><Navbar /><div className="flex flex-col items-center justify-center h-screen gap-4"><div className="text-6xl">🏠</div><h2 className="text-2xl font-bold text-gray-800">Property not found</h2><Link href="/apartments" className="btn-primary">Browse Apartments</Link></div></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-sm text-gray-400 mb-6">
            <Link href="/" className="hover:text-gray-700">Home</Link><span className="mx-2">/</span>
            <Link href="/apartments" className="hover:text-gray-700">Apartments</Link><span className="mx-2">/</span>
            <span className="text-gray-700 font-medium">{property.title}</span>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl overflow-hidden shadow-card">
                <div className="relative h-72 sm:h-96">
                  <img src={property.images?.[activeImg] || property.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'} alt={property.title} className="w-full h-full object-cover" />
                  {property.isVerified && <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/90 text-blue-600 text-sm font-semibold px-3 py-1.5 rounded-full shadow-md"><CheckCircle size={14} />Verified by StayNest AI</div>}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => setLiked(!liked)} className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md ${liked ? 'bg-red-500 text-white' : 'bg-white text-gray-500'}`}><Heart size={15} fill={liked ? 'currentColor' : 'none'} /></button>
                  </div>
                  {property.images?.length > 1 && <>
                    <button onClick={() => setActiveImg(p => p === 0 ? property.images.length - 1 : p - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow-md"><ChevronLeft size={18} /></button>
                    <button onClick={() => setActiveImg(p => (p + 1) % property.images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow-md"><ChevronRight size={18} /></button>
                  </>}
                </div>
                {property.images?.length > 1 && (
                  <div className="flex gap-2 p-4 overflow-x-auto">
                    {property.images.map((img: string, i: number) => (
                      <button key={i} onClick={() => setActiveImg(i)} className={`shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 ${activeImg === i ? 'border-blue-600' : 'border-transparent'}`}>
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-white rounded-3xl shadow-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div><h1 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h1><div className="flex items-center gap-1.5 text-gray-500"><MapPin size={15} className="text-blue-500" />{property.address}</div></div>
                  {property.rating > 0 && <div className="flex items-center gap-1 bg-yellow-50 text-yellow-600 px-3 py-1.5 rounded-xl"><Star size={14} fill="currentColor" /><span className="font-bold">{property.rating}</span><span className="text-xs text-yellow-500">({property.reviewCount})</span></div>}
                </div>
                <div className="flex flex-wrap gap-4 py-4 border-t border-b border-gray-100 mb-5">
                  <div className="flex items-center gap-2 text-gray-600"><BedDouble size={18} className="text-blue-500" /><span className="font-medium">{property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} Bedroom${property.bedrooms > 1 ? 's' : ''}`}</span></div>
                  <div className="flex items-center gap-2 text-gray-600"><Bath size={18} className="text-blue-500" /><span className="font-medium">{property.bathrooms} Bathroom{property.bathrooms > 1 ? 's' : ''}</span></div>
                  {property.area && <div className="text-gray-600 font-medium">{property.area} sq ft</div>}
                  <div className="text-gray-600 font-medium">Max {property.maxGuests} guests</div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">About this property</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{property.description}</p>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-card p-6 sticky top-24">
                <div className="mb-5">{isBuy ? <><span className="text-3xl font-bold text-blue-600">${property.finalPrice?.toLocaleString()}</span><span className="text-gray-400 text-sm"> final price</span><p className="mt-2 text-sm font-semibold text-amber-700">Booking price: ${property.bookingPrice?.toLocaleString()}</p><p className="mt-1 text-xs leading-5 text-gray-500">Reserve for 7 days. Booking price becomes non-refundable after the deadline.</p></> : <><span className="text-3xl font-bold text-blue-600">${property.pricePerMonth?.toLocaleString()}</span><span className="text-gray-400 text-sm">/month</span></>}</div>
                {!isBuy && <div className="grid grid-cols-2 gap-3 mb-4">
                  <div><label className="label">Check-in</label><input type="date" className="input-field text-sm" value={checkIn} min={new Date().toISOString().split('T')[0]} onChange={e => setCheckIn(e.target.value)} /></div>
                  <div><label className="label">Check-out</label><input type="date" className="input-field text-sm" value={checkOut} min={checkIn || new Date().toISOString().split('T')[0]} onChange={e => setCheckOut(e.target.value)} /></div>
                </div>}
                {(property.bookedRanges || []).length > 0 && <div className="mb-4 rounded-2xl border border-amber-100 bg-amber-50 p-3 text-xs text-amber-800"><p className="font-semibold mb-1">Already booked dates</p>{property.bookedRanges.map((range: any, index: number) => <p key={index}>{new Date(range.checkIn).toLocaleDateString()} – {new Date(range.checkOut).toLocaleDateString()}</p>)}</div>}
                {selectedDatesAreBooked && <div className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">Those dates are already booked. Please select another range.</div>}
                {!isBuy && checkIn && checkOut && (
                  <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm mb-4">
                    <div className="flex justify-between text-gray-500"><span>${property.pricePerMonth?.toLocaleString()} × {months} month{months > 1 ? 's' : ''}</span><span>${rent.toLocaleString()}</span></div>
                    <div className="flex justify-between text-gray-500"><span>Service Tax (10%)</span><span>${tax}</span></div>
                    <div className="flex justify-between text-gray-500"><span>Cleaning Fee</span><span>$100</span></div>
                    <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200 text-base"><span>Total</span><span>${total.toLocaleString()}</span></div>
                  </div>
                )}
                {bookingError && <div className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl mb-3">{bookingError}</div>}
                <button onClick={handleBook} disabled={booking || (!isBuy && !!selectedDatesAreBooked) || (isBuy && property.saleStatus === 'SOLD')} className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2 mb-3">
                  {booking ? <><Loader2 size={18} className="animate-spin" />Processing...</> : <><CreditCard size={18} />{isBuy ? `Reserve for $${property.bookingPrice?.toLocaleString()}` : 'Book Now'}</>}
                </button>
                {!session && <p className="text-center text-xs text-gray-400">You need to <Link href="/login" className="text-blue-600 underline">sign in</Link> to book</p>}
                {property.isVerified && <div className="flex items-center gap-2 mt-4 p-3 bg-green-50 rounded-xl text-green-700 text-xs"><CheckCircle size={13} className="shrink-0" />Verified by StayNest AI for authenticity.</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
