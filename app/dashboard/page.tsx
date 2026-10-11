"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle,
  ChevronRight,
  CreditCard,
  Loader2,
  MapPin,
  MessageSquare,
  Sparkles,
  User,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);
  useEffect(() => {
    if (status !== "authenticated") return;
    Promise.all([
      fetch("/api/properties?limit=3&isVerified=true").then((response) =>
        response.json(),
      ),
      fetch("/api/bookings").then((response) => response.json()),
    ])
      .then(([propertyData, bookingData]) => {
        setProperties(propertyData.properties || []);
        setBookings(bookingData.bookings || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status]);

  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const links = [
    { icon: Sparkles, label: "My Matches", href: "/dashboard" },
    { icon: BookOpen, label: "Applications", href: "/dashboard/bookings" },
    { icon: MessageSquare, label: "Messages", href: "/dashboard/messages" },
    { icon: CreditCard, label: "Payments", href: "/dashboard/payments" },
    { icon: Building2, label: "Your Listings", href: "/dashboard/listings" },
    { icon: User, label: "Profile", href: "/dashboard/profile" },
  ].filter((link) => !isAdmin || link.href !== "/dashboard/listings");
  const activeBooking = bookings.find(
    (booking) => booking.status === "CONFIRMED",
  );
  if (status === "loading" || loading)
    return (
      <div className="min-h-screen bg-[#f8f6f1]">
        <Navbar />
        <div className="flex h-screen items-center justify-center">
          <Loader2 size={36} className="animate-spin text-[#b98a43]" />
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f8f6f1]">
      <Navbar />
      <section className="relative overflow-hidden bg-[#0e0d0b] px-4 pb-12 pt-28 sm:px-6 sm:pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(185,138,67,.28),transparent_42%)]" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#d9ab59]">
            Your StayNest space
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl font-light text-white sm:text-5xl">
                Welcome back, {session?.user?.name?.split(" ")[0] || "there"}.
              </h1>
              <p className="mt-2 text-sm text-[#d2c8b8]">
                Your home search, applications, and listings—one calm place.
              </p>
            </div>
            <Link
              href="/apartments"
              className="rounded-xl bg-[#b98a43] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#9f7435]"
            >
              Browse homes
            </Link>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex gap-2 overflow-x-auto pb-2 lg:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex shrink-0 flex-col items-center gap-1 rounded-xl border px-4 py-3 text-xs font-medium ${link.href === "/dashboard" ? "border-[#211e19] bg-[#211e19] text-white" : "border-[#e0d9cd] bg-white text-[#575149]"}`}
            >
              <link.icon size={17} />
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex gap-8">
          <aside className="hidden w-56 shrink-0 flex-col gap-2 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${link.href === "/dashboard" ? "bg-[#211e19] text-white shadow-lg" : "bg-white text-[#575149] shadow-sm hover:bg-[#f1ede5] hover:text-[#211e19]"}`}
              >
                <link.icon size={17} />
                {link.label}
              </Link>
            ))}
          </aside>
          <main className="min-w-0 flex-1 space-y-6">
            <section className="rounded-3xl border border-[#e0d9cd] bg-white p-5 shadow-card sm:p-6">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.16em] text-[#a47737]">
                    Curated for you
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-semibold text-[#211e19]">
                    Top AI Recommendations
                  </h2>
                  <p className="mt-1 text-sm text-[#9a9284]">
                    Hover over a property to see its match reason.
                  </p>
                </div>
                <Link
                  href="/apartments"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[#a47737] hover:text-[#211e19]"
                >
                  View all <ArrowRight size={14} />
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {properties.length === 0 ? (
                  <div className="col-span-full py-10 text-center text-sm text-[#9a9284]">
                    No verified recommendations available yet.
                  </div>
                ) : (
                  properties.map((property) => (
                    <div
                      key={property._id}
                      onMouseEnter={() => setTooltip(property._id)}
                      onMouseLeave={() => setTooltip(null)}
                      className="group relative overflow-hidden rounded-2xl border border-[#e8e2d7] bg-[#faf9f6] transition hover:-translate-y-1 hover:border-[#b98a43]/60 hover:shadow-lg"
                    >
                      <Link href={`/apartments/${property._id}`}>
                        <img
                          src={property.images?.[0]}
                          alt={property.title}
                          className="h-40 w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                        <div className="p-4">
                          <h3 className="truncate font-semibold text-[#211e19]">
                            {property.title}
                          </h3>
                          <p className="mt-1 text-sm font-bold text-[#a47737]">
                            $
                            {property.listingPurpose === "BUY"
                              ? property.finalPrice?.toLocaleString()
                              : property.pricePerMonth?.toLocaleString()}
                            <span className="ml-1 text-xs font-normal text-[#9a9284]">
                              {property.listingPurpose === "BUY"
                                ? "final price"
                                : "/month"}
                            </span>
                          </p>
                          <p className="mt-2 flex items-center gap-1 text-xs text-[#9a9284]">
                            <MapPin size={11} />
                            {property.city}
                          </p>
                        </div>
                      </Link>
                      {tooltip === property._id && (
                        <div className="absolute inset-x-3 top-16 rounded-xl bg-[#171511]/95 p-3 text-xs leading-5 text-white shadow-xl">
                          <strong className="block text-[#e8d5b1]">
                            Why AI matched it
                          </strong>
                          Verified property aligned with your saved preferences
                          in {property.city}.
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>
            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-3xl border border-[#e0d9cd] bg-white p-6 shadow-card">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-xl font-semibold text-[#211e19]">
                    Saved searches
                  </h2>
                  <Link
                    href="/apartments"
                    className="text-xs font-semibold text-[#a47737]"
                  >
                    New search
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Flat in Toronto, $200–$400",
                    "Studio in NYC, $250–$350",
                    "House in Seattle, $400+",
                    "Condo in Miami, $200–$300",
                  ].map((search) => (
                    <button
                      key={search}
                      className="rounded-full border border-[#e0d9cd] bg-[#f8f6f1] px-3 py-2 text-xs font-medium text-[#575149] transition hover:border-[#b98a43] hover:bg-[#211e19] hover:text-white"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </section>
              <section className="rounded-3xl bg-[#211e19] p-6 text-white shadow-card">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-xl font-semibold">
                    Active booking
                  </h2>
                  <Link
                    href="/dashboard/bookings"
                    className="inline-flex items-center gap-1 text-xs text-[#e8d5b1]"
                  >
                    View all <ChevronRight size={12} />
                  </Link>
                </div>
                {activeBooking ? (
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="font-semibold">
                      {activeBooking.property?.title}
                    </p>
                    <p className="mt-1 text-xs text-white/65">
                      Check-in:{" "}
                      {new Date(activeBooking.checkIn).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-white/65">
                    No active bookings yet.
                  </p>
                )}
                <Link
                  href="/contact"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#b98a43] px-4 py-3 text-sm font-semibold text-white hover:bg-[#9f7435]"
                >
                  <MessageSquare size={15} />
                  Talk to an agent
                </Link>
              </section>
            </div>
            <section className="rounded-3xl border border-[#e0d9cd] bg-white p-6 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-5">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#211e19]">
                      <Sparkles size={16} className="text-[#e8d5b1]" />
                    </div>
                    <h2 className="font-display text-xl font-semibold text-[#211e19]">
                      My AI Vibe Profile
                    </h2>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {["Downtown", "Modern", "Verified", "Pet-Friendly"].map(
                      (tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-[#b98a43]/35 bg-[#faf3e6] px-3 py-1 text-xs font-medium text-[#a47737]"
                        >
                          {tag}
                        </span>
                      ),
                    )}
                  </div>
                </div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#b98a43]/50 px-4 py-3 text-sm font-semibold text-[#8d5d1d] hover:bg-[#faf3e6]"
                >
                  <Sparkles size={15} />
                  Get new matches
                </Link>
              </div>
            </section>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
