'use client'
import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { Building2, Users, BookOpen, Brain, Plus, X, Loader2, CheckCircle, MapPin, Upload } from 'lucide-react'

export default function AddPropertyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const listingPurpose = searchParams.get('listingPurpose') === 'BUY' ? 'BUY' : 'RENT'
  const editId = searchParams.get('edit')
  const [showListingChoice, setShowListingChoice] = useState(!searchParams.get('listingPurpose'))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [images, setImages] = useState(['','',''])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [form, setForm] = useState({ title:'', description:'', type:'FLAT', city:'', neighborhood:'', address:'', latitude:'', longitude:'', pricePerMonth:'', securityDeposit:'', finalPrice:'', bookingPrice:'', bedrooms:'1', bathrooms:'1', area:'', maxGuests:'2' })
  const [citySuggestions, setCitySuggestions] = useState<string[]>([])
  const locationRequest = useRef<AbortController | null>(null)
  const u = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))
  const resetPropertyForm = () => {
    setForm({ title:'', description:'', type:'FLAT', city:'', neighborhood:'', address:'', latitude:'', longitude:'', pricePerMonth:'', securityDeposit:'', finalPrice:'', bookingPrice:'', bedrooms:'1', bathrooms:'1', area:'', maxGuests:'2' })
    setImages(['','',''])
    setCitySuggestions([])
    setError('')
    setSaved(false)
  }
  const handleCityInput = async (value: string) => {
    u('city', value)
    locationRequest.current?.abort()
    if (!value.trim()) return setCitySuggestions([])
    const controller = new AbortController()
    locationRequest.current = controller
    try {
      const response = await fetch(`/api/locations?q=${encodeURIComponent(value)}`, { signal: controller.signal })
      const data = await response.json()
      if (!controller.signal.aborted) setCitySuggestions(data.locations || [])
    } catch (error: any) { if (error.name !== 'AbortError') setCitySuggestions([]) }
  }
  const selectCity = (city: string) => { u('city', city.split(',')[0].trim()); setCitySuggestions([]) }

  const uploadPropertyImages = async (files: FileList | null) => {
    if (!files?.length) return
    setUploadingImages(true); setError('')
    try {
      const uploaded = await Promise.all(Array.from(files).map(async file => {
        const body = new FormData()
        body.append('file', file)
        body.append('scope', 'property')
        const response = await fetch('/api/uploads/image', { method: 'POST', body })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || `Unable to upload ${file.name}.`)
        return data.url as string
      }))
      setImages(current => [...current.filter(Boolean), ...uploaded])
    } catch (err: any) { setError(err.message || 'Unable to upload image.') } finally { setUploadingImages(false) }
  }

  useEffect(() => {
    if (!editId) return
    fetch(`/api/properties/${editId}`).then(r => r.json()).then(property => {
      if (!property?._id) { setError('Property not found.'); return }
      setForm({ title: property.title || '', description: property.description || '', type: property.type || 'FLAT', city: property.city || '', neighborhood: property.neighborhood || '', address: property.address || '', latitude: property.latitude?.toString() || '', longitude: property.longitude?.toString() || '', pricePerMonth: property.pricePerMonth?.toString() || '', securityDeposit: property.securityDeposit?.toString() || '', finalPrice: property.finalPrice?.toString() || '', bookingPrice: property.bookingPrice?.toString() || '', bedrooms: property.bedrooms?.toString() || '1', bathrooms: property.bathrooms?.toString() || '1', area: property.area?.toString() || '', maxGuests: property.maxGuests?.toString() || '2' })
      setImages(property.images?.length ? property.images : [''])
    }).catch(() => setError('Unable to load property details.'))
  }, [editId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const payload = { ...form, listingPurpose, images: images.filter(Boolean), pricePerMonth: listingPurpose === 'RENT' ? parseFloat(form.pricePerMonth) : 0, securityDeposit: listingPurpose === 'RENT' ? Number(form.securityDeposit || 0) : null, finalPrice: listingPurpose === 'BUY' ? parseFloat(form.finalPrice) : null, bookingPrice: listingPurpose === 'BUY' ? parseFloat(form.bookingPrice) : null, bedrooms: parseInt(form.bedrooms), bathrooms: parseInt(form.bathrooms), area: form.area ? parseFloat(form.area) : null, maxGuests: parseInt(form.maxGuests), latitude: form.latitude ? parseFloat(form.latitude) : null, longitude: form.longitude ? parseFloat(form.longitude) : null }
      const res = await fetch(editId ? `/api/properties/${editId}` : '/api/properties', { method: editId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed'); setSaving(false); return }
      setSaved(true)
    } catch { setError('Something went wrong.') }
    setSaving(false)
  }

  const sidebarLinks = [
    { icon: Building2, label: 'Dashboard', href: '/admin' },
    { icon: Building2, label: 'Properties', href: '/admin/properties', active: true },
    { icon: Users, label: 'Users', href: '/admin/users' },
    { icon: BookOpen, label: 'Bookings', href: '/admin/bookings' },
    { icon: Brain, label: 'AI Training', href: '/admin/ai' },
  ]

  return (
    <div className="min-h-screen bg-[#f8f6f1]">
      <Navbar />
      <section className="relative overflow-hidden bg-[#0e0d0b] px-4 pb-10 pt-28 sm:px-6 sm:pt-32"><div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(185,138,67,.3),transparent_45%)]" /><div className="relative mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#d9ab59]">Property management</p><h1 className="mt-3 font-display text-4xl font-light text-white sm:text-5xl">{listingPurpose === 'BUY' ? 'Add sale property' : 'Add rental property'}</h1><p className="mt-2 max-w-2xl text-sm text-[#d2c8b8]">Create a verified property listing for the StayNest collection.</p></div></section>
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            <aside className="hidden lg:flex flex-col w-56 shrink-0 gap-1">
              {sidebarLinks.map(link => (
                <Link key={link.href} href={link.href} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#575149] shadow-sm transition-all hover:bg-[#f1ede5] hover:text-[#211e19]">
                  <link.icon size={20} /><span className="text-xs font-medium">{link.label}</span>
                </Link>
              ))}
            </aside>
            <main className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <div><h1 className="text-2xl font-bold text-gray-900">{editId ? 'Edit Property' : 'Add New Property'}</h1><p className="text-gray-400 text-sm">{editId ? 'Update this property listing' : 'Fill in the details to list a new property'}</p></div>
                <Link href="/admin/properties" className="btn-secondary py-2.5 px-4 text-sm">← Back</Link>
              </div>
              {error && <div className="mb-5 bg-red-50 border border-red-200 text-red-600 px-5 py-4 rounded-2xl">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-3xl shadow-card p-6">
                  <h2 className="font-bold text-gray-900 text-lg mb-5">Basic Information</h2>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2"><label className="label">Property Title *</label><input className="input-field" placeholder="e.g. Modern Downtown Toronto Flat" value={form.title} onChange={e => u('title', e.target.value)} required /></div>
                    <div className="sm:col-span-2"><label className="label">Description *</label><textarea className="input-field resize-none" rows={4} placeholder="Describe the property..." value={form.description} onChange={e => u('description', e.target.value)} required /></div>
                    <div><label className="label">Property Type *</label><select className="input-field" value={form.type} onChange={e => u('type', e.target.value)}>{['FLAT','HOUSE','STUDIO','CONDO','TOWNHOUSE','VILLA'].map(t => <option key={t} value={t}>{t.charAt(0)+t.slice(1).toLowerCase()}</option>)}</select></div>
                    <div className="relative"><label className="label">City *</label><input className="input-field" placeholder="Type any city or area..." value={form.city} onChange={e => handleCityInput(e.target.value)} autoComplete="off" required />{citySuggestions.length > 0 && <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">{citySuggestions.map(city => <button key={city} type="button" onClick={() => selectCity(city)} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"><MapPin size={12} className="text-blue-400" />{city}</button>)}</div>}</div>
                    <div><label className="label">Neighborhood</label><input className="input-field" placeholder="e.g. Downtown" value={form.neighborhood} onChange={e => u('neighborhood', e.target.value)} /></div>
                    <div><label className="label">Full Address *</label><input className="input-field" placeholder="123 Main St, City, Country" value={form.address} onChange={e => u('address', e.target.value)} required /></div>
                    <div><label className="label">Latitude</label><input className="input-field" type="number" step="any" placeholder="43.6480" value={form.latitude} onChange={e => u('latitude', e.target.value)} /></div>
                    <div><label className="label">Longitude</label><input className="input-field" type="number" step="any" placeholder="-79.3832" value={form.longitude} onChange={e => u('longitude', e.target.value)} /></div>
                  </div>
                </div>
                <div className="bg-white rounded-3xl shadow-card p-6">
                  <h2 className="font-bold text-gray-900 text-lg mb-5">Pricing & Details</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                    {listingPurpose === 'RENT' ? <><div><label className="label">Price/Month (USD) *</label><input className="input-field" type="number" placeholder="3200" value={form.pricePerMonth} onChange={e => u('pricePerMonth', e.target.value)} required /></div><div><label className="label">Security Deposit (USD)</label><input className="input-field" type="number" min="0" placeholder="1600" value={form.securityDeposit} onChange={e => u('securityDeposit', e.target.value)} /></div></> : <><div><label className="label">Final Price (USD) *</label><input className="input-field" type="number" placeholder="250000" value={form.finalPrice} onChange={e => u('finalPrice', e.target.value)} required /></div><div><label className="label">Booking Price (USD) *</label><input className="input-field" type="number" placeholder="5000" value={form.bookingPrice} onChange={e => u('bookingPrice', e.target.value)} required /></div></>}
                    <div><label className="label">Bedrooms</label><select className="input-field" value={form.bedrooms} onChange={e => u('bedrooms', e.target.value)}>{['0','1','2','3','4','5','6'].map(n => <option key={n} value={n}>{n === '0' ? 'Studio' : n}</option>)}</select></div>
                    <div><label className="label">Bathrooms</label><select className="input-field" value={form.bathrooms} onChange={e => u('bathrooms', e.target.value)}>{['1','2','3','4'].map(n => <option key={n} value={n}>{n}</option>)}</select></div>
                    <div><label className="label">Area (sq ft)</label><input className="input-field" type="number" placeholder="850" value={form.area} onChange={e => u('area', e.target.value)} /></div>
                    {listingPurpose === 'RENT' && <div><label className="label">Max Guests</label><select className="input-field" value={form.maxGuests} onChange={e => u('maxGuests', e.target.value)}>{['1','2','3','4','5','6','8','10'].map(n => <option key={n} value={n}>{n}</option>)}</select></div>}
                  </div>
                </div>
                <div className="bg-white rounded-3xl shadow-card p-6">
                  <h2 className="font-bold text-gray-900 text-lg mb-2">Property Images</h2>
                  <p className="text-gray-400 text-sm mb-4">Upload property images directly from your device. PNG, JPG, WEBP or GIF · maximum 8 MB per image.</p>
                  <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#b98a43]/45 bg-[#fffaf0] px-5 text-center text-[#8d5d1d] transition hover:border-[#b98a43] hover:bg-[#f9efd9]">
                    {uploadingImages ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
                    <span className="text-sm font-semibold">{uploadingImages ? 'Uploading images…' : 'Upload from device'}</span>
                    <span className="text-xs text-[#a0865d]">You can select multiple images at once</span>
                    <input type="file" accept="image/*" multiple className="sr-only" disabled={uploadingImages} onChange={event => { uploadPropertyImages(event.target.files); event.currentTarget.value = '' }} />
                  </label>
                  {images.filter(Boolean).length > 0 && <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{images.filter(Boolean).map((url, index) => <div key={`${url}-${index}`} className="group relative overflow-hidden rounded-xl border border-[#e0d9cd]"><img src={url} alt={`Property upload ${index + 1}`} className="h-28 w-full object-cover" /><button type="button" onClick={() => setImages(current => current.filter(item => item !== url))} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/65 text-white opacity-100 transition hover:bg-red-600 sm:opacity-0 sm:group-hover:opacity-100" aria-label="Remove image"><X size={15} /></button></div>)}</div>}
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 py-3.5 px-8">{saving ? <><Loader2 size={18} className="animate-spin" />Saving...</> : <><Plus size={18} />{editId ? 'Save Changes' : 'Create Property'}</>}</button>
                  <Link href="/admin/properties" className="btn-secondary py-3.5 px-8">Cancel</Link>
                </div>
              </form>
            </main>
          </div>
        </div>
      </div>
      <Footer />
      {showListingChoice && <div className="fixed inset-0 z-[70] flex items-center justify-center p-4"><div className="absolute inset-0 bg-[#0f0e0b]/75 backdrop-blur-sm" /><div className="relative w-full max-w-md rounded-3xl border border-[#b98a43]/35 bg-[#24211c] p-7 shadow-2xl"><h2 className="font-display text-2xl text-[#f6efe2]">Choose listing type</h2><p className="mt-2 text-sm text-[#d2c8b8]">Select whether this property is available for rent or for sale.</p><div className="mt-6 grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => { setShowListingChoice(false); router.push('/admin/properties/add?listingPurpose=RENT') }} className="rounded-2xl border border-[#c4aa7a]/30 bg-[#302c25] p-5 text-center transition hover:border-[#d7a247] hover:bg-[#3a342b]"><div className="font-semibold text-[#fffaf0]">Rental property</div><div className="mt-1 text-xs text-[#cfc2ae]">Set monthly rent</div></button><button type="button" onClick={() => { setShowListingChoice(false); router.push('/admin/properties/add?listingPurpose=BUY') }} className="rounded-2xl border border-[#c4aa7a]/30 bg-[#302c25] p-5 text-center transition hover:border-[#d7a247] hover:bg-[#3a342b]"><div className="font-semibold text-[#fffaf0]">Buy property</div><div className="mt-1 text-xs text-[#cfc2ae]">Set final & booking price</div></button></div></div></div>}
      {saved && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="property-created-title">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
          <div className="relative w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600"><CheckCircle size={32} /></div>
            <h2 id="property-created-title" className="text-2xl font-bold text-gray-900">Property added successfully</h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">Your property has been saved and is ready to manage.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => router.push('/admin/properties')} className="btn-secondary flex-1 px-4 py-3 text-sm">Go Back</button>
              <button type="button" onClick={resetPropertyForm} className="btn-primary flex-1 px-4 py-3 text-sm">Add More</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
