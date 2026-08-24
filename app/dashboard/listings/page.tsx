'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Building2, Loader2, MapPin, Pencil, Plus, Trash2, X } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import DashboardHero from '../../../components/dashboard/DashboardHero'

export default function YourListingsPage() {
  const { status } = useSession()
  const router = useRouter()
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDecline, setSelectedDecline] = useState<any | null>(null)
  const [selectedDelete, setSelectedDelete] = useState<any | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/owner-properties/mine')
      .then(response => response.json())
      .then(data => setProperties(data.properties || []))
      .finally(() => setLoading(false))
  }, [status])

  const deleteDeclinedListing = async (property: any) => {
    setDeletingId(property._id)
    setDeleteError('')
    try {
      const response = await fetch(`/api/owner-properties/${property._id}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to delete this listing.')
      setProperties(current => current.filter(item => item._id !== property._id))
      if (selectedDecline?._id === property._id) setSelectedDecline(null)
      setSelectedDelete(null)
    } catch (error: any) {
      setDeleteError(error.message || 'Unable to delete this listing.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f6f1]">
      <Navbar />
      <DashboardHero eyebrow="Property management" title="Your Listings" description="Review your listing requests, verification status, and admin feedback." />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-12">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#a47737]">Listing centre</p><h2 className="mt-1 text-3xl font-bold text-[#211e19]">Manage Listings</h2><p className="mt-1 text-sm text-[#9a9284]">Your submitted property requests and approved listings.</p></div>
          <Link href="/list-property" className="lux-gold-button"><Plus size={16} /> List a property</Link>
        </div>
        {loading ? <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#a47737]" size={34} /></div> : properties.length === 0 ? <div className="rounded-3xl bg-white p-14 text-center shadow-card"><Building2 className="mx-auto text-[#a47737]" size={42} /><h2 className="mt-4 text-xl font-bold text-[#211e19]">You haven&apos;t listed yet</h2><p className="mt-2 text-sm text-[#9a9284]">List your rental or sale property to see it here.</p><Link href="/list-property" className="lux-gold-button mt-6 inline-flex">List your property</Link></div> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{properties.map(property => {
          const listingStatus = property.listingStatus || (property.isVerified ? 'APPROVED' : 'PENDING')
          const statusClass = listingStatus === 'APPROVED' ? 'bg-green-100 text-green-700' : listingStatus === 'DECLINED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
          const statusText = listingStatus === 'APPROVED' ? 'VERIFIED' : listingStatus === 'DECLINED' ? 'DECLINED' : 'PENDING REVIEW'
          return <div key={property._id} className="overflow-hidden rounded-3xl bg-white shadow-card"><img src={property.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'} alt={property.title} className="h-44 w-full object-cover" /><div className="p-5"><div className="mb-2 flex items-start justify-between gap-3"><h2 className="min-w-0 flex-1 font-semibold leading-5 text-[#211e19]">{property.title}</h2><span className={`shrink-0 whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-bold leading-none ${statusClass}`}>{statusText}</span></div><p className="flex items-center gap-1 text-sm text-[#9a9284]"><MapPin size={13} />{property.city}</p><p className="mt-3 font-semibold text-[#a47737]">{property.listingPurpose === 'BUY' ? `$${Number(property.finalPrice).toLocaleString()} final price` : `$${Number(property.pricePerMonth).toLocaleString()}/month`}</p>{listingStatus === 'DECLINED' ? <div className="mt-4 flex flex-wrap items-center gap-3"><button type="button" onClick={() => setSelectedDecline(property)} className="text-xs font-semibold text-red-600 underline decoration-red-300 underline-offset-4 transition hover:text-red-800">Why declined?</button><button type="button" disabled={deletingId === property._id} onClick={() => { setSelectedDelete(property); setDeleteError('') }} className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 transition hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-60"><Trash2 size={13} />Delete</button></div> : <Link href={`/list-property/add?listingPurpose=${property.listingPurpose || 'RENT'}&edit=${property._id}`} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100"><Pencil size={13} /> Edit listing</Link>}</div></div>
        })}</div>}
      </main>
      <Footer />
      {selectedDecline && <div className="fixed inset-0 z-[80] flex items-center justify-center p-4"><button aria-label="Close" onClick={() => setSelectedDecline(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" /><div role="dialog" aria-modal="true" aria-labelledby="decline-title" className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl"><button aria-label="Close" onClick={() => setSelectedDecline(null)} className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:bg-gray-100"><X size={18} /></button><p className="text-xs font-bold uppercase tracking-[.18em] text-red-500">Listing declined</p><h2 id="decline-title" className="mt-2 pr-8 text-2xl font-bold text-[#211e19]">Why your listing was declined</h2><div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-[#6b403c]">{selectedDecline.declineReason || 'The admin did not provide a reason. Please contact support for more information.'}</div><p className="mt-4 text-sm text-[#756f66]">If you agree with the feedback, update the details and send a fresh request for review.</p><div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button onClick={() => setSelectedDecline(null)} className="rounded-xl border border-[#d9d1c4] px-5 py-3 text-sm font-semibold text-[#575149] transition hover:bg-[#f8f6f1]">Go back</button><button onClick={() => router.push(`/list-property/add?listingPurpose=${selectedDecline.listingPurpose || 'RENT'}&reregister=${selectedDecline._id}`)} className="rounded-xl bg-[#b9822d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#9f6d22]">Agree &amp; Re-register</button></div></div></div>}
      {selectedDelete && <div className="fixed inset-0 z-[90] flex items-center justify-center p-4"><button aria-label="Close" disabled={!!deletingId} onClick={() => setSelectedDelete(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" /><div role="dialog" aria-modal="true" aria-labelledby="delete-title" className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl"><button aria-label="Close" disabled={!!deletingId} onClick={() => setSelectedDelete(null)} className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"><X size={18} /></button><div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600"><Trash2 size={22} /></div><h2 id="delete-title" className="mt-5 pr-8 text-2xl font-bold text-[#211e19]">Delete declined listing?</h2><p className="mt-3 text-sm leading-6 text-[#756f66]">&ldquo;{selectedDelete.title}&rdquo; will be permanently removed from your listings. This cannot be undone.</p>{deleteError && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{deleteError}</p>}<div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button disabled={!!deletingId} onClick={() => setSelectedDelete(null)} className="rounded-xl border border-[#d9d1c4] px-5 py-3 text-sm font-semibold text-[#575149] disabled:opacity-50">Cancel</button><button disabled={!!deletingId} onClick={() => deleteDeclinedListing(selectedDelete)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50">{deletingId ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}{deletingId ? 'Deleting...' : 'Delete listing'}</button></div></div></div>}
    </div>
  )
}
