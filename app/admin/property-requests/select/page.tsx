'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Bath, BedDouble, CheckCircle2, Loader2, MapPin, Search, Send, X } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function SelectPropertyForRequestPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useSearchParams()
  const requestId = params.get('requestId') || ''
  const [purpose, setPurpose] = useState<'RENT' | 'BUY'>('RENT')
  const [request, setRequest] = useState<any>(null)
  const [properties, setProperties] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sharing, setSharing] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('ANY')

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login')
    if (status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN') router.replace('/')
  }, [status, session, router])

  useEffect(() => {
    if (!requestId || status !== 'authenticated' || (session?.user as any)?.role !== 'ADMIN') return
    fetch(`/api/admin/property-requests/${requestId}`).then(async response => {
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Request not found.')
      setRequest(data.request)
      setPurpose(data.request.purpose)
    }).catch(err => setError(err.message)).finally(() => setLoading(false))
  }, [requestId, status, session])

  useEffect(() => {
    if (!request || !purpose) return
    setLoading(true)
    fetch(`/api/properties?listingPurpose=${purpose}&isVerified=true&limit=100`).then(response => response.json()).then(data => setProperties(data.properties || [])).catch(() => setError('Unable to load properties.')).finally(() => setLoading(false))
  }, [request, purpose])

  const alreadyShared = useMemo(() => new Set((request?.matchedProperties || []).map((property: any) => property._id)), [request])
  const filteredProperties = useMemo(() => properties.filter(property => {
    const city = `${property.city || ''} ${property.neighborhood || ''}`.toLowerCase()
    return (!cityFilter.trim() || city.includes(cityFilter.trim().toLowerCase())) && (typeFilter === 'ANY' || property.type === typeFilter)
  }), [properties, cityFilter, typeFilter])
  const share = async () => {
    if (!selected || !request) return
    setSharing(true); setError('')
    try {
      const existingIds = (request.matchedProperties || []).map((property: any) => property._id)
      const response = await fetch(`/api/admin/property-requests/${request._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'MATCH_FOUND', adminNotes: request.adminNotes || '', matchedPropertyIds: [...existingIds, selected._id] }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to share property.')
      setRequest(data.request)
      setNotice(`“${selected.title}” has been shared successfully with ${data.request.ownerId?.name || 'the user'}.`)
      setSelected(null)
    } catch (err: any) { setError(err.message || 'Unable to share property.') } finally { setSharing(false) }
  }

  if (!requestId) return <div className="min-h-screen bg-[#f8f6f1]"><Navbar /><main className="mx-auto max-w-xl px-5 pt-36 text-center"><h1 className="text-2xl font-bold">Property request is missing.</h1><Link href="/admin/property-requests" className="mt-5 inline-block text-[#a47737]">Back to Property Requests</Link></main></div>

  return <div className="min-h-screen bg-[#f8f6f1]"><Navbar /><section className="relative overflow-hidden bg-[#0e0d0b] px-4 pb-8 pt-28 sm:px-6 sm:pt-32"><div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(185,138,67,.3),transparent_45%)]" /><div className="relative mx-auto max-w-7xl"><Link href="/admin/property-requests" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-[#d9ab59] hover:text-white"><ArrowLeft size={14} /> Back to Property Requests</Link><div className="mt-4 flex flex-wrap items-end justify-between gap-5"><div><h1 className="text-4xl font-light text-white sm:text-5xl">Select a Property</h1><p className="mt-2 max-w-2xl text-sm text-[#d2c8b8]">Browse published Rent or Buy homes and share a complete property card with the requester.</p></div><div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/15 bg-black/20 p-2 backdrop-blur"><div className="relative"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#d9ab59]" /><input value={cityFilter} onChange={event => setCityFilter(event.target.value)} placeholder="City" className="w-36 rounded-lg border border-white/15 bg-white/10 py-2 pl-8 pr-2 text-sm text-white outline-none placeholder:text-white/45 focus:border-[#d9ab59]" /></div><select value={typeFilter} onChange={event => setTypeFilter(event.target.value)} className="rounded-lg border border-white/15 bg-white/10 px-2 py-2 text-sm text-white outline-none focus:border-[#d9ab59]"><option className="text-black" value="ANY">Any type</option>{['FLAT','HOUSE','STUDIO','CONDO','TOWNHOUSE','VILLA'].map(type => <option className="text-black" key={type} value={type}>{type[0] + type.slice(1).toLowerCase()}</option>)}</select></div></div></div></section><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><div className="mb-6 rounded-2xl border border-[#e0d9cd] bg-white p-4 text-sm text-[#5f564b]">{request ? <><strong className="text-[#211e19]">Request:</strong> {request.propertyType} in {request.preferredLocation} · Budget up to ${Number(request.maxBudget).toLocaleString()}</> : 'Loading request details…'}</div><div className="mb-7 flex flex-wrap items-center justify-between gap-4"><div className="inline-flex rounded-xl border border-[#ddd5c9] bg-white p-1"><button onClick={() => setPurpose('RENT')} className={`rounded-lg px-5 py-2.5 text-sm font-semibold ${purpose === 'RENT' ? 'bg-[#211e19] text-white' : 'text-[#675e53]'}`}>Rent properties</button><button onClick={() => setPurpose('BUY')} className={`rounded-lg px-5 py-2.5 text-sm font-semibold ${purpose === 'BUY' ? 'bg-[#b9822d] text-white' : 'text-[#675e53]'}`}>Buy properties</button></div><p className="text-sm text-[#756f66]">{filteredProperties.length} properties found</p></div>{error && <p className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}{loading ? <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#b9822d]" size={36} /></div> : filteredProperties.length === 0 ? <div className="rounded-3xl border border-[#e0d9cd] bg-white p-16 text-center text-sm text-[#756f66]">No {purpose === 'BUY' ? 'buy' : 'rent'} properties match these filters.</div> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filteredProperties.map(property => <button key={property._id} type="button" onClick={() => setSelected(property)} className="overflow-hidden rounded-3xl border border-[#e0d9cd] bg-white text-left shadow-card transition hover:-translate-y-1 hover:border-[#b9822d] hover:shadow-lg"><div className="relative"><img src={property.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'} alt={property.title} className="h-44 w-full object-cover" />{alreadyShared.has(property._id) && <span className="absolute left-3 top-3 rounded-full bg-emerald-500 px-2 py-1 text-[10px] font-bold text-white">Already shared</span>}</div><div className="p-5"><h2 className="truncate font-bold text-[#211e19]">{property.title}</h2><p className="mt-2 flex items-center gap-1 text-sm text-[#756f66]"><MapPin size={13} />{property.city}</p><p className="mt-2 flex items-center gap-3 text-xs text-[#756f66]"><span className="flex items-center gap-1"><BedDouble size={13} />{property.bedrooms} bed</span><span className="flex items-center gap-1"><Bath size={13} />{property.bathrooms} bath</span></p><p className="mt-3 font-bold text-[#a47737]">${Number(property.listingPurpose === 'BUY' ? property.finalPrice : property.pricePerMonth).toLocaleString()}<span className="ml-1 text-xs font-normal text-[#8b8174]">{property.listingPurpose === 'BUY' ? 'final price' : '/month'}</span></p></div></button>)}</div>}</main><Footer />
    {selected && <div className="fixed inset-0 z-[80] flex items-center justify-center p-4"><button aria-label="Close" onClick={() => !sharing && setSelected(null)} className="absolute inset-0 bg-black/65 backdrop-blur-sm" /><div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"><button onClick={() => !sharing && setSelected(null)} className="absolute right-5 top-5 rounded-full p-2 text-[#756f66] hover:bg-[#f1ede5]"><X size={19} /></button><img src={selected.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1000'} alt={selected.title} className="h-64 w-full rounded-2xl object-cover" /><p className="mt-5 text-xs font-bold uppercase tracking-[.16em] text-[#a47737]">{selected.type} · {selected.listingPurpose === 'BUY' ? 'For sale' : 'For rent'}</p><h2 className="mt-2 pr-10 text-2xl font-bold text-[#211e19]">{selected.title}</h2><p className="mt-2 flex items-center gap-1 text-sm text-[#756f66]"><MapPin size={14} />{selected.address || selected.city}</p><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-[#faf7f0] p-4"><p className="text-xs font-bold uppercase text-[#9a9284]">Price</p><p className="mt-1 font-bold text-[#a47737]">${Number(selected.listingPurpose === 'BUY' ? selected.finalPrice : selected.pricePerMonth).toLocaleString()}</p></div><div className="rounded-2xl bg-[#faf7f0] p-4"><p className="text-xs font-bold uppercase text-[#9a9284]">Rooms</p><p className="mt-1 font-bold">{selected.bedrooms} bed · {selected.bathrooms} bath</p></div><div className="rounded-2xl bg-[#faf7f0] p-4"><p className="text-xs font-bold uppercase text-[#9a9284]">Area</p><p className="mt-1 font-bold">{selected.area || '—'} sq ft</p></div></div><p className="mt-5 text-sm leading-6 text-[#5f564b]">{selected.description || 'No additional property description has been provided.'}</p>{selected.amenities?.length > 0 && <div className="mt-5 flex flex-wrap gap-2">{selected.amenities.map((amenity: string) => <span key={amenity} className="rounded-full bg-[#f1ede5] px-3 py-1.5 text-xs font-semibold text-[#62584c]">{amenity}</span>)}</div>}<div className="mt-7 flex justify-end gap-3"><button onClick={() => setSelected(null)} disabled={sharing} className="rounded-xl border border-[#d9d1c4] px-5 py-3 text-sm font-semibold text-[#575149]">Back</button><button onClick={share} disabled={sharing || alreadyShared.has(selected._id)} className="inline-flex items-center gap-2 rounded-xl bg-[#b9822d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#211e19] disabled:cursor-not-allowed disabled:opacity-60">{sharing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}{alreadyShared.has(selected._id) ? 'Already shared' : 'Share this property'}</button></div></div></div>}
    {notice && <div className="fixed inset-0 z-[90] flex items-center justify-center p-4"><button onClick={() => setNotice('')} className="absolute inset-0 bg-black/60 backdrop-blur-sm" /><div className="relative w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl"><CheckCircle2 className="mx-auto text-emerald-500" size={48} /><p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-emerald-600">Shared successfully</p><h2 className="mt-2 text-2xl font-bold text-[#211e19]">Property sent to user</h2><p className="mt-3 text-sm leading-6 text-[#756f66]">{notice}</p><button onClick={() => setNotice('')} className="mt-6 rounded-xl bg-[#211e19] px-5 py-3 text-sm font-semibold text-white">Continue browsing</button></div></div>}
  </div>
}
