'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ArrowLeft, Ban, Bot, Loader2, Search, Trash2, UserCheck } from 'lucide-react'

export default function UserActivitiesPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [updatingBan, setUpdatingBan] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [notice, setNotice] = useState('')

  const loadActivity = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${params.id}/activities`)
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to load activity.')
      setData(result)
    } catch (error: any) { setNotice(error.message || 'Unable to load activity.') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN') router.push('/dashboard')
  }, [status, session, router])
  useEffect(() => { if (status === 'authenticated' && params.id) loadActivity() }, [status, params.id])

  const deleteHistory = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/admin/users/${params.id}/activities`, { method: 'DELETE' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to delete history.')
      setData((current: any) => ({ ...current, chat: [], searches: [], lastChatActivityAt: null }))
      setNotice('Chat and AI search history has been deleted from the database.')
      setConfirmDelete(false)
    } catch (error: any) { setNotice(error.message || 'Unable to delete history.') }
    finally { setDeleting(false) }
  }

  const updateBan = async () => {
    if (!data?.user) return
    const action = data.user.isBanned ? 'UNBAN' : 'BAN'
    setUpdatingBan(true)
    try {
      const response = await fetch(`/api/admin/users/${params.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to update user.')
      setData((current: any) => ({ ...current, user: { ...current.user, isBanned: action === 'BAN' } }))
      setNotice(action === 'BAN' ? 'User has been banned.' : 'User has been unbanned.')
    } catch (error: any) { setNotice(error.message || 'Unable to update user.') }
    finally { setUpdatingBan(false) }
  }

  return <div className="min-h-screen bg-[#f8f6f1]"><Navbar />
    <section className="relative overflow-hidden bg-[#0e0d0b] px-5 pb-12 pt-28 sm:px-8 sm:pt-32"><div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(185,138,67,.28),transparent_44%)]" /><div className="relative mx-auto max-w-6xl"><Link href="/admin/users" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#d9ab59] transition hover:text-white"><ArrowLeft size={14} />Back to Users</Link><p className="mt-7 text-xs font-bold uppercase tracking-[.2em] text-[#d9ab59]">User intelligence</p><h1 className="mt-2 font-display text-4xl font-light text-white sm:text-5xl">User Activities</h1><p className="mt-2 text-sm text-[#d2c8b8]">Review this user&apos;s saved chat and AI property-search history.</p></div></section>
    <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8"><>{notice && <div className="mb-5 rounded-xl border border-[#dfc88f] bg-[#fff9e9] px-4 py-3 text-sm text-[#73531c]">{notice}</div>}{loading ? <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#b98025]" size={32} /></div> : data?.user ? <div className="space-y-6"><section className={`flex flex-col gap-4 rounded-3xl border bg-white p-6 shadow-card sm:flex-row sm:items-center sm:justify-between ${data.user.isBanned ? 'border-red-200 opacity-60' : 'border-[#e3dbcf]'}`}><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#a56d1e]">{`User #${data.user.publicId || '—'}`}</p><h2 className="mt-1 text-2xl font-semibold text-[#211e19]">{data.user.name}</h2><p className="mt-1 text-sm text-[#786f64]">{data.user.email}</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setConfirmDelete(true)} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50"><Trash2 size={16} />Delete History</button><button type="button" disabled={updatingBan} onClick={updateBan} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50 ${data.user.isBanned ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>{updatingBan ? <Loader2 size={16} className="animate-spin" /> : data.user.isBanned ? <UserCheck size={16} /> : <Ban size={16} />}{data.user.isBanned ? 'Unban User' : 'Ban User'}</button></div></section>
      <section className="overflow-hidden rounded-3xl border border-[#e3dbcf] bg-white shadow-card"><div className="flex items-center justify-between border-b border-[#eee8de] px-6 py-5"><div className="flex items-center gap-3"><div className="rounded-xl bg-[#211e19] p-2 text-[#e7bd72]"><Bot size={18} /></div><div><h2 className="font-semibold text-[#211e19]">Chat History</h2><p className="text-xs text-[#8e8579]">{data.chat.length ? `${data.chat.length} saved messages` : 'No chat saved yet'}</p></div></div></div><div className="max-h-[540px] space-y-4 overflow-y-auto bg-[#fcfbf8] p-5">{data.chat.length ? data.chat.map((message: any, index: number) => <div key={`${message.createdAt}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[82%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'bg-[#c99338] text-white' : 'border border-[#e7dfd3] bg-white text-[#443d34]'}`}><p className="mb-1 text-[10px] font-bold uppercase tracking-[.14em] opacity-65">{message.role === 'user' ? data.user.name : 'StayNest AI'}</p>{message.content}<p className="mt-2 text-[10px] opacity-60">{message.createdAt ? new Date(message.createdAt).toLocaleString() : ''}</p></div></div>) : <p className="py-10 text-center text-sm text-[#8e8579]">No saved chat history for this user.</p>}</div></section>
      <section className="overflow-hidden rounded-3xl border border-[#e3dbcf] bg-white shadow-card"><div className="flex items-center gap-3 border-b border-[#eee8de] px-6 py-5"><div className="rounded-xl bg-[#fff1d2] p-2 text-[#a66c18]"><Search size={18} /></div><div><h2 className="font-semibold text-[#211e19]">AI Search History</h2><p className="text-xs text-[#8e8579]">{data.searches.length} saved searches</p></div></div><div className="divide-y divide-[#eee8de]">{data.searches.length ? data.searches.map((search: any) => <article key={search._id} className="p-6"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#211e19] px-2.5 py-1 text-xs font-bold text-white">{search.listingPurpose || 'RENT'}</span><span className="text-xs text-[#8e8579]">{new Date(search.createdAt).toLocaleString()}</span></div><p className="mt-3 font-medium text-[#211e19]">{search.input}</p>{search.criteria && <div className="mt-3 flex flex-wrap gap-2">{Object.entries(search.criteria).filter(([, value]) => value !== null && value !== '' && (!Array.isArray(value) || value.length)).map(([key, value]) => <span key={key} className="rounded-lg bg-[#f4efe6] px-2.5 py-1 text-xs text-[#665b4f]">{key}: {Array.isArray(value) ? value.join(', ') : String(value)}</span>)}</div>}<p className="mt-3 text-sm leading-6 text-[#665b4f]">{search.output}</p><p className="mt-2 text-xs text-[#a56d1e]">{search.matchedPropertyIds?.length || 0} matching property records</p></article>) : <p className="py-10 text-center text-sm text-[#8e8579]">No saved AI property searches for this user.</p>}</div></section></div> : <div className="py-24 text-center text-[#8e8579]">User not found.</div>}</>
    </main>
    {confirmDelete && <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4"><section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"><h2 className="text-xl font-semibold text-[#211e19]">Delete all AI history?</h2><p className="mt-3 text-sm leading-6 text-[#6d6459]">This permanently deletes this user&apos;s saved chat conversation and AI property-search history from MongoDB. It cannot be undone.</p><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setConfirmDelete(false)} className="rounded-xl border border-[#ddd4c7] px-4 py-2.5 text-sm font-semibold text-[#5b5144]">Cancel</button><button type="button" onClick={deleteHistory} disabled={deleting} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{deleting && <Loader2 size={15} className="animate-spin" />}Delete History</button></div></section></div>}
    <Footer />
  </div>
}
