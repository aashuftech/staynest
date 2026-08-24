'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Reveal from '@/components/Reveal'
import Link from 'next/link'
import { Building2, Users, BookOpen, Brain, ChevronRight, AlertTriangle, Loader2, Plus, ClipboardList } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const matchData = [1,3,5,7,9,11,13,15,18,21,24,27,30].map((d,i) => ({ d, m: 250 + i * 50 + Math.random() * 100 | 0 }))
const memData = ['Jan','Feb','Mar','Apr','May','Jun'].map((mo,i) => ({ mo, mb: 400 + i * 70 }))

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({ totalProperties: 0, newUsers: 0, matchesToday: 0, revenue: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN') router.push('/dashboard')
  }, [status, session, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/admin/stats').then(r => r.json()).then(d => { setStats(d); setLoading(false) }).catch(() => setLoading(false))
  }, [status])

  const sidebarLinks = [
    { icon: Building2, label: 'Dashboard', href: '/admin', active: true },
    { icon: Building2, label: 'Properties', href: '/admin/properties' },
    { icon: ClipboardList, label: 'Property Requests', href: '/admin/property-requests' },
    { icon: Users, label: 'Users', href: '/admin/users' },
    { icon: BookOpen, label: 'Bookings', href: '/admin/bookings' },
    { icon: Brain, label: 'AI Training', href: '/admin/ai' },
  ]

  if (status === 'loading') return <div className="flex min-h-screen items-center justify-center bg-[#f8f6f1]"><Loader2 size={36} className="animate-spin text-[#b98a43]" /></div>

  return (
    <div className="min-h-screen bg-[#f8f6f1]">
      <Navbar />
      <section className="relative overflow-hidden bg-[#0e0d0b] px-4 pb-10 pt-28 sm:px-6 sm:pt-32"><div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(185,138,67,.3),transparent_45%)]" /><div className="relative mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#d9ab59]">Administration</p><h1 className="mt-3 font-display text-4xl font-light text-white sm:text-5xl">StayNest Control Centre</h1><p className="mt-2 max-w-2xl text-sm text-[#d2c8b8]">A clear overview of properties, users, bookings, and AI operations.</p></div></section>
      <div>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <aside className="hidden w-56 shrink-0 flex-col gap-1.5 lg:flex">
              {sidebarLinks.map(link => (
                <Link key={link.href} href={link.href} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${(link as any).active ? 'bg-[#211e19] text-white shadow-md' : 'bg-white text-[#575149] shadow-sm hover:bg-[#f1ede5] hover:text-[#211e19]'}`}>
                  <link.icon size={20} /><span className="text-xs font-medium">{link.label}</span>
                </Link>
              ))}
            </aside>
            <main className="flex-1 space-y-6">
              <Reveal>
                <div className="flex items-center justify-between">
                  <h1 className="font-display text-3xl font-semibold text-[#211e19]">StayNest Master Admin</h1>
                  <Link href="/admin/properties/add" className="lux-gold-button px-5 py-2.5 text-xs"><Plus size={16} />Add Property</Link>
                </div>
              </Reveal>
              <Reveal>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {[{ label: 'Total Properties', value: loading ? '...' : stats.totalProperties.toLocaleString() },
                    { label: 'New Users (month)', value: loading ? '...' : stats.newUsers.toLocaleString() },
                    { label: 'Matches Today', value: loading ? '...' : stats.matchesToday.toLocaleString() },
                    { label: 'Revenue', value: loading ? '...' : '$' + stats.revenue.toLocaleString() }].map(s => (
                    <div key={s.label} className="rounded-2xl border border-[#e0d9cd] bg-white p-5 shadow-[0_8px_24px_rgba(24,21,17,.05)]">
                      <div className="mb-1 text-sm text-[#9a9284]">{s.label}</div>
                      <div className="font-display text-2xl font-semibold text-[#211e19]">{s.value}</div>
                    </div>
                  ))}
                </div>
              </Reveal>
              <Reveal>
                <div className="rounded-[24px] border border-[#e0d9cd] bg-white p-6 shadow-[0_10px_30px_rgba(24,21,17,.05)]">
                  <div className="mb-5 flex items-center justify-between"><h2 className="font-display text-lg font-semibold text-[#211e19]">AI Matching Performance (30 days)</h2><ChevronRight size={18} className="text-[#c3bcae]" /></div>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={matchData}><CartesianGrid strokeDasharray="3 3" stroke="#f1ede5" /><XAxis dataKey="d" tick={{ fontSize: 11, fill: '#a89f90' }} /><YAxis tick={{ fontSize: 11, fill: '#a89f90' }} /><Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(24,21,17,0.14)' }} /><Line type="monotone" dataKey="m" stroke="#b98a43" strokeWidth={2.5} dot={false} name="Matches" /></LineChart>
                  </ResponsiveContainer>
                </div>
              </Reveal>
              <div className="grid gap-6 lg:grid-cols-2">
                <Reveal>
                  <div className="rounded-[24px] border border-[#e0d9cd] bg-white p-6 shadow-[0_10px_30px_rgba(24,21,17,.05)]">
                    <div className="mb-4 flex items-center justify-between"><h2 className="font-display text-lg font-semibold text-[#211e19]">AI Training Status</h2><span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600"><div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />Live</span></div>
                    <div className="flex items-center gap-5">
                      <div className="relative h-24 w-24 shrink-0">
                        <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eee9e0" strokeWidth="3" />
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#b98a43" strokeWidth="3" strokeDasharray="70, 100" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-display text-lg font-semibold text-[#211e19]">70%</div>
                      </div>
                      <div className="flex-1 space-y-2">
                        {[{ n: 'Property Images', v: 42 }, { n: 'Bedroom Classification', v: 33 }, { n: 'Pet-Friendly Detection', v: 10 }].map(d => (
                          <div key={d.n}><div className="mb-1 flex justify-between text-xs"><span className="text-[#756f66]">{d.n}</span><span className="font-semibold text-[#211e19]">{d.v}%</span></div><div className="h-1.5 rounded-full bg-[#f1ede5]"><div className="h-full rounded-full bg-[#b98a43]" style={{ width: `${d.v}%` }} /></div></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Reveal>
                <Reveal delay={90}>
                  <div className="space-y-4">
                    <div className="rounded-[24px] border border-[#e0d9cd] bg-white p-5 shadow-[0_10px_30px_rgba(24,21,17,.05)]">
                      <h3 className="mb-3 font-display text-sm font-semibold text-[#211e19]">System Memory Usage</h3>
                      <ResponsiveContainer width="100%" height={100}><BarChart data={memData} barSize={14}><XAxis dataKey="mo" tick={{ fontSize: 10, fill: '#a89f90' }} /><Tooltip contentStyle={{ borderRadius: 10, border: 'none' }} /><Bar dataKey="mb" fill="#b98a43" radius={[3,3,0,0]} /></BarChart></ResponsiveContainer>
                    </div>
                    <div className="rounded-[24px] border border-[#e0d9cd] bg-white p-5 shadow-[0_10px_30px_rgba(24,21,17,.05)]">
                      <h3 className="mb-3 font-display text-sm font-semibold text-[#211e19]">Recent Reports</h3>
                      <div className="space-y-3">
                        {[{ user: 'Content Issue', time: '22 min ago', color: 'text-amber-500' }, { user: 'New Signup', time: '23 min ago', color: 'text-[#a47737]' }, { user: 'Payment Query', time: '25 min ago', color: 'text-emerald-500' }].map((r, i) => (
                          <div key={i} className="flex items-center justify-between border-b border-[#f1ede5] py-1 last:border-0">
                            <div className="flex items-center gap-2"><AlertTriangle size={13} className={r.color} /><div><div className="text-sm font-medium text-[#3c3934]">{r.user}</div><div className="text-xs text-[#a89f90]">{r.time}</div></div></div>
                            <ChevronRight size={13} className="text-[#c3bcae]" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
