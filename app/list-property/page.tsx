'use client'

import Link from 'next/link'
import { Building2, KeyRound } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function ListPropertyPage() {
  return (
    <div className="min-h-screen bg-[#f8f6f1]">
      <Navbar />
      <section className="relative overflow-hidden bg-[#0e0d0b] px-4 pb-16 pt-28 text-center sm:px-6 sm:pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(185,138,67,.22),transparent_47%)]" />
        <div className="relative mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[.18em] text-[#d9ab59]">List with StayNest</p>
          <h1 className="mt-3 text-4xl font-bold text-white">List your property</h1>
          <p className="mx-auto mt-3 max-w-xl text-[#d2c8b8]">Choose how you want to list your property. Your listing will be saved for admin review.</p>
        </div>
      </section>
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-10 sm:px-6 sm:pt-12">
        <div className="grid gap-5 md:grid-cols-2">
          <Link href="/list-property/add?listingPurpose=RENT" className="group rounded-3xl border border-[#e0d9cd] bg-white p-8 shadow-card transition hover:-translate-y-1 hover:border-[#b98a43]/60 hover:shadow-card-hover">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#b98a43]/15 text-[#a47737]"><Building2 size={27} /></div>
            <h2 className="mt-5 text-2xl font-bold text-[#211e19]">Rent Out your property</h2>
            <p className="mt-2 text-sm leading-6 text-[#756f66]">Earn monthly income from your property</p>
            <span className="mt-6 inline-block text-sm font-semibold text-[#a47737] group-hover:text-[#7d5520]">Create rental listing →</span>
          </Link>
          <Link href="/list-property/add?listingPurpose=BUY" className="group rounded-3xl border border-[#e0d9cd] bg-white p-8 shadow-card transition hover:-translate-y-1 hover:border-[#b98a43]/60 hover:shadow-card-hover">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#b98a43]/15 text-[#a47737]"><KeyRound size={27} /></div>
            <h2 className="mt-5 text-2xl font-bold text-[#211e19]">Sell property</h2>
            <p className="mt-2 text-sm leading-6 text-[#756f66]">List your property for sale</p>
            <span className="mt-6 inline-block text-sm font-semibold text-[#a47737] group-hover:text-[#7d5520]">Create sale listing →</span>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
