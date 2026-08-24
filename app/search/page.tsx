'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { Sparkles, Loader2, MapPin, Star, CheckCircle, Heart } from 'lucide-react'
import { getAiVisitorId } from '@/lib/ai-visitor'

function SearchContent() {
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState<any[]>([])
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [loading, setLoading] = useState(true)
  const isAiMatch = searchParams.get('aiMatch') === 'true'
  const city = searchParams.get('city') || ''
  const type = searchParams.get('type') || ''
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''
  const bedrooms = searchParams.get('bedrooms') || ''
  const preferences = searchParams.get('preferences') || ''
  const listingPurpose = searchParams.get('listingPurpose') === 'BUY' ? 'BUY' : 'RENT'

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      if (isAiMatch) {
        try {
          const res = await fetch('/api/ai-match', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ city, propertyType: type, minBudget: minPrice ? Number(minPrice) : undefined, maxBudget: maxPrice ? Number(maxPrice) : undefined, bedrooms: bedrooms && bedrooms !== 'Any' ? Number(bedrooms) : undefined, preferences, listingPurpose, visitorId: getAiVisitorId() }) })
          const data = await res.json()
          setProperties(data.properties || []); setAiSuggestion(data.suggestion || '')
        } catch { setProperties([]) }
      } else {
        const params = new URLSearchParams()
        if (city) params.set('city', city); if (type) params.set('type', type); if (minPrice) params.set('minPrice', minPrice)
        if (maxPrice) params.set('maxPrice', maxPrice); if (bedrooms && bedrooms !== 'Any') params.set('bedrooms', bedrooms)
        params.set('listingPurpose', listingPurpose)
        params.set('limit', '9')
        try { const res = await fetch(`/api/properties?${params}`); const data = await res.json(); setProperties(data.properties || []) } catch { setProperties([]) }
      }
      setLoading(false)
    }
    fetchData()
  }, [city, type, minPrice, maxPrice, bedrooms, preferences, isAiMatch, listingPurpose])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-16">
        <div className="bg-[#1e2a4a] py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-white">{isAiMatch ? '✨ AI Search Results' : 'Search Results'}</h1>
            <p className="text-white/60 text-sm mt-1">{listingPurpose === 'BUY' ? 'Buy properties' : 'Rental properties'}{city && ` · 📍 ${city}`}{type && ` · ${type}`}{(minPrice || maxPrice) && ` · $${minPrice || '0'}–$${maxPrice || 'any'}${listingPurpose === 'BUY' ? ' final price' : '/month'}`}</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isAiMatch && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0"><Sparkles size={16} className="text-white" /></div>
                <div>
                  <div className="font-semibold text-blue-900 mb-1 flex items-center gap-2">AI Recommendation{loading && <Loader2 size={14} className="animate-spin text-blue-500" />}</div>
                  <p className="text-blue-700 text-sm leading-relaxed">{loading ? 'Analyzing your preferences...' : aiSuggestion || 'Showing best matches for your criteria.'}</p>
                </div>
              </div>
            </div>
          )}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 size={40} className="animate-spin text-blue-600" />
              <p className="text-gray-400">{isAiMatch ? 'AI is finding your perfect match...' : 'Loading properties...'}</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl shadow-card">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No properties found</h3>
              <p className="text-gray-500 mb-2">We couldn't find exact matches for your criteria.</p>
              <p className="text-gray-400 text-sm mb-6">Try: removing filters, changing the city, or adjusting budget range.</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link href="/apartments" className="btn-primary">Browse All Properties</Link>
                <Link href="/" className="btn-secondary">New AI Search</Link>
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-500 mb-5 font-medium">{properties.length} propert{properties.length > 1 ? 'ies' : 'y'} found{city ? ` in ${city}` : ''}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {properties.map(p => (
                  <Link key={p._id} href={`/apartments/${p._id}`}>
                    <div className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all group cursor-pointer">
                      <div className="relative h-52 overflow-hidden">
                        <img src={p.images?.[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        {p.isVerified && <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full"><CheckCircle size={11} />Verified</div>}
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{p.title}</h3>
                          {p.rating > 0 && <div className="flex items-center gap-0.5 text-yellow-500 text-xs font-bold ml-2 shrink-0"><Star size={11} fill="currentColor" />{p.rating}</div>}
                        </div>
                        <div className="flex items-center gap-1 text-gray-400 text-xs mb-2"><MapPin size={11} />{p.city}</div>
                        <div className="flex items-center justify-between">
                          <div><span className="text-lg font-bold text-blue-600">${(listingPurpose === 'BUY' ? p.finalPrice : p.pricePerMonth)?.toLocaleString()}</span><span className="text-gray-400 text-xs">{listingPurpose === 'BUY' ? ' final price' : '/month'}</span></div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function SearchPage() {
  return <Suspense fallback={<div className="flex justify-center pt-40"><Loader2 size={36} className="animate-spin text-blue-600" /></div>}><SearchContent /></Suspense>
}
