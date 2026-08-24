'use client'
import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import DashboardHero from '../../../components/dashboard/DashboardHero'
import Link from 'next/link'
import { Sparkles, BookOpen, MessageSquare, CreditCard, User, Mail, LogOut, Eye, EyeOff, Loader2, CheckCircle, Upload } from 'lucide-react'

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [form, setForm] = useState({ name: '', image: '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [showCurr, setShowCurr] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => { if (status === 'unauthenticated') router.push('/login') }, [status, router])
  useEffect(() => { if (session?.user) setForm({ name: session.user.name || '', image: session.user.image || '' }) }, [session])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError(''); setSaved(false)
    try {
      const res = await fetch('/api/user/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, image: form.image || undefined }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed'); setSaving(false); return }
      await update({ name: form.name, image: form.image }); setSaved(true); setTimeout(() => setSaved(false), 3000)
    } catch { setError('Something went wrong.') }
    setSaving(false)
  }

  const uploadProfileImage = async (file?: File) => {
    if (!file) return
    setUploadingImage(true); setError('')
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('scope', 'profile')
      const response = await fetch('/api/uploads/image', { method: 'POST', body })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to upload image.')
      setForm(current => ({ ...current, image: data.url }))
    } catch (err: any) { setError(err.message || 'Unable to upload image.') } finally { setUploadingImage(false) }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError(''); setSaved(false)
    if (pwForm.newPassword.length < 6) { setError('New password must be at least 6 characters'); setSaving(false); return }
    try {
      const res = await fetch('/api/user/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pwForm) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed'); setSaving(false); return }
      setPwForm({ currentPassword: '', newPassword: '' }); setSaved(true); setTimeout(() => setSaved(false), 3000)
    } catch { setError('Something went wrong.') }
    setSaving(false)
  }

  const sidebarLinks = [
    { icon: Sparkles, label: 'My Matches', href: '/dashboard' },
    { icon: BookOpen, label: 'Applications', href: '/dashboard/bookings' },
    { icon: MessageSquare, label: 'Messages', href: '/dashboard/messages' },
    { icon: CreditCard, label: 'Payments', href: '/dashboard/payments' },
    { icon: User, label: 'Profile', href: '/dashboard/profile', active: true },
  ]

  return (
    <div className="min-h-screen bg-[#f8f6f1]">
      <Navbar />
      <DashboardHero eyebrow="Account" title="Your Profile" description="Manage your personal information, password, and account preferences." />
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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">User Profile: {session?.user?.name}</h1>
                  <span className={`badge mt-1 inline-block ${(session?.user as any)?.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'badge-blue'}`}>{(session?.user as any)?.role || 'USER'}</span>
                </div>
                <button onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 border border-red-200 hover:bg-red-50 px-4 py-2 rounded-xl transition-all">
                  <LogOut size={15} />Sign Out
                </button>
              </div>
              {saved && <div className="bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-2xl flex items-center gap-2"><CheckCircle size={16} />Changes saved successfully!</div>}
              {error && <div className="bg-red-50 border border-red-200 text-red-600 px-5 py-4 rounded-2xl">{error}</div>}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl shadow-card p-6">
                  <h2 className="font-bold text-gray-900 mb-5">Personal Information</h2>
                  <form onSubmit={handleSave} className="space-y-4">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                        {form.image ? <img src={form.image} className="w-full h-full object-cover" alt="" /> : (session?.user?.name?.[0] || 'U').toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <label className="label">Profile image</label>
                        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#b98a43]/60 bg-[#fffaf0] px-4 py-2.5 text-sm font-semibold text-[#8d5d1d] transition hover:bg-[#f8ecd3]">
                          {uploadingImage ? <><Loader2 size={16} className="animate-spin" />Uploading…</> : <><Upload size={16} />Upload from device</>}
                          <input type="file" accept="image/*" className="sr-only" disabled={uploadingImage} onChange={event => { uploadProfileImage(event.target.files?.[0]); event.currentTarget.value = '' }} />
                        </label>
                        <p className="mt-1 text-xs text-gray-400">PNG, JPG, WEBP or GIF · maximum 8 MB</p>
                      </div>
                    </div>
                    <div><label className="label">Full Name</label><input type="text" className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
                    <div><label className="label">Email Address</label>
                      <div className="relative"><Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="email" className="input-field pl-9 bg-gray-50 cursor-not-allowed" value={session?.user?.email || ''} disabled />
                      </div><p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                    </div>
                    <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 py-3 px-6">
                      {saving ? <><Loader2 size={16} className="animate-spin" />Saving...</> : 'Save Changes'}
                    </button>
                  </form>
                </div>
                <div className="bg-white rounded-3xl shadow-card p-6">
                  <h2 className="font-bold text-gray-900 mb-5">Change Password</h2>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div><label className="label">Current Password</label>
                      <div className="relative">
                        <input type={showCurr ? 'text' : 'password'} className="input-field pr-10" placeholder="Current password" value={pwForm.currentPassword} onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} required />
                        <button type="button" onClick={() => setShowCurr(!showCurr)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showCurr ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                      </div>
                    </div>
                    <div><label className="label">New Password</label>
                      <div className="relative">
                        <input type={showNew ? 'text' : 'password'} className="input-field pr-10" placeholder="Min 6 characters" value={pwForm.newPassword} onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} required minLength={6} />
                        <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showNew ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                      </div>
                    </div>
                    <button type="submit" disabled={saving || !pwForm.currentPassword || !pwForm.newPassword} className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold px-6 py-3 rounded-xl transition-all flex items-center gap-2 disabled:opacity-40">
                      {saving ? <><Loader2 size={16} className="animate-spin" />Updating...</> : 'Update Password'}
                    </button>
                  </form>
                </div>
              </div>
              <div className="bg-white rounded-3xl shadow-card p-6">
                <h2 className="font-bold text-gray-900 mb-4">Quick Links</h2>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[{ href: '/dashboard/bookings', icon: BookOpen, label: 'My Bookings' }, { href: '/dashboard/payments', icon: CreditCard, label: 'Payment History' }, { href: '/dashboard/messages', icon: MessageSquare, label: 'AI Assistant' }].map(item => (
                    <Link key={item.href} href={item.href} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all">
                      <item.icon size={18} className="text-blue-500" /><span className="text-sm font-medium">{item.label}</span>
                    </Link>
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
