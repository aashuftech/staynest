'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { Building2, Users, BookOpen, Brain, Sparkles, RefreshCw, CheckCircle, Database, Cpu, Activity, ClipboardList } from 'lucide-react'

export default function AdminAIPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [training, setTraining] = useState(false)
  const [progress, setProgress] = useState(70)
  const [lastTrained, setLastTrained] = useState('2 hours ago')

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN') router.push('/dashboard')
  }, [status, session, router])

  const handleRetrain = () => {
    setTraining(true); setProgress(0)
    const interval = setInterval(() => {
      setProgress(p => { if (p >= 100) { clearInterval(interval); setTraining(false); setLastTrained('just now'); return 100 } return p + 5 })
    }, 150)
  }

  const sidebarLinks = [
    { icon: Building2, label: 'Dashboard', href: '/admin' },
    { icon: Building2, label: 'Properties', href: '/admin/properties' },
    { icon: ClipboardList, label: 'Property Requests', href: '/admin/property-requests' },
    { icon: Users, label: 'Users', href: '/admin/users' },
    { icon: BookOpen, label: 'Bookings', href: '/admin/bookings' },
    { icon: Brain, label: 'AI Training', href: '/admin/ai', active: true },
  ]

  const metrics = [
    { label: 'Match Accuracy', value: '94.2%', bar: 94 },
    { label: 'Property Images Labeled', value: '70%', bar: 70 },
    { label: 'Bedroom Classification', value: '88%', bar: 88 },
    { label: 'Price Prediction', value: '91%', bar: 91 },
  ]

  return (
    <div className="min-h-screen bg-[#f8f6f1]">
      <Navbar />
      <section className="relative overflow-hidden bg-[#0e0d0b] px-4 pb-10 pt-28 sm:px-6 sm:pt-32"><div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(185,138,67,.3),transparent_45%)]" /><div className="relative mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#d9ab59]">Intelligence centre</p><h1 className="mt-3 font-display text-4xl font-light text-white sm:text-5xl">AI Training</h1><p className="mt-2 max-w-2xl text-sm text-[#d2c8b8]">Train, monitor, and maintain the StayNest matching engine.</p></div></section>
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
                <div><h1 className="text-2xl font-bold text-gray-900">AI Training Dashboard</h1><p className="text-gray-400 text-sm">Last trained: {lastTrained}</p></div>
                <button onClick={handleRetrain} disabled={training} className="btn-primary flex items-center gap-2 py-2.5 px-5">
                  {training ? <><RefreshCw size={16} className="animate-spin" />Training...</> : <><Sparkles size={16} />Retrain Model</>}
                </button>
              </div>
              {training && (
                <div className="bg-white rounded-2xl shadow-card p-5">
                  <div className="flex justify-between text-sm mb-2"><span className="font-medium text-gray-700">Training in progress...</span><span className="font-bold text-blue-600">{progress}%</span></div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} /></div>
                </div>
              )}
              <div className="bg-white rounded-3xl shadow-card p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center"><Activity size={20} className="text-green-600" /></div>
                  <div><div className="font-bold text-gray-900">AI Model Status</div><div className="flex items-center gap-1.5 text-green-500 text-sm font-medium"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />Live & Running</div></div>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[{ icon: Database, label: 'Training Data', value: '10 properties' }, { icon: Cpu, label: 'Model', value: 'GPT-OSS 120B' }, { icon: CheckCircle, label: 'Accuracy', value: '94.2%' }].map(item => (
                    <div key={item.label} className="bg-gray-50 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-1"><item.icon size={15} className="text-blue-600" /><span className="text-xs text-gray-400 font-medium">{item.label}</span></div>
                      <div className="font-bold text-gray-900">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-3xl shadow-card p-6">
                <h2 className="font-bold text-gray-900 mb-5">Model Performance Metrics</h2>
                <div className="space-y-4">
                  {metrics.map(m => (
                    <div key={m.label}>
                      <div className="flex justify-between mb-1.5"><span className="text-sm font-medium text-gray-700">{m.label}</span><span className="text-sm font-bold text-blue-600">{m.value}</span></div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${m.bar}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-3xl shadow-card p-6">
                <h2 className="font-bold text-gray-900 mb-4">Training Log</h2>
                <div className="space-y-2 font-mono text-sm">
                  {[{ time: '02:14:33', msg: 'Model training complete — accuracy: 94.2%', ok: true }, { time: '02:10:05', msg: 'Training on property samples from MongoDB...', ok: false }, { time: '02:09:55', msg: 'Loading dataset from MongoDB Atlas...', ok: false }, { time: '02:09:50', msg: 'Initializing AI training pipeline', ok: false }].map((log, i) => (
                    <div key={i} className={`flex gap-3 p-2.5 rounded-xl ${log.ok ? 'bg-green-50' : 'bg-gray-50'}`}>
                      <span className="text-gray-400 shrink-0 text-xs">{log.time}</span>
                      <span className={log.ok ? 'text-green-700 text-xs' : 'text-gray-600 text-xs'}>{log.msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
