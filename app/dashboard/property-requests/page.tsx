"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Loader2,
  MapPin,
  MessageSquare,
  Plus,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const statusStyle: Record<string, string> = {
  NEW: "bg-sky-100 text-sky-700",
  REVIEWING: "bg-amber-100 text-amber-700",
  CONTACTED: "bg-violet-100 text-violet-700",
  MATCH_FOUND: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-slate-200 text-slate-700",
};
const sidebar = [
  { icon: Sparkles, label: "My Matches", href: "/dashboard" },
  {
    icon: ClipboardList,
    label: "My Property Requests",
    href: "/dashboard/property-requests",
  },
  { icon: MessageSquare, label: "Messages", href: "/dashboard/messages" },
  { icon: Building2, label: "Your Listings", href: "/dashboard/listings" },
];

export default function MyPropertyRequestsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (status === "unauthenticated")
      router.replace("/login?next=/dashboard/property-requests");
  }, [status, router]);
  useEffect(() => {
    if (status === "authenticated")
      fetch("/api/property-requests")
        .then((r) => r.json())
        .then((data) => setRequests(data.requests || []))
        .finally(() => setLoading(false));
  }, [status]);
  return (
    <div className="min-h-screen bg-[#f8f6f1]">
      <Navbar />
      <section className="relative overflow-hidden bg-[#0e0d0b] px-4 pb-10 pt-28 sm:px-6 sm:pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(185,138,67,.28),transparent_42%)]" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#d9ab59]">
            Your StayNest space
          </p>
          <h1 className="mt-3 text-4xl font-light text-white sm:text-5xl">
            My Property Requests
          </h1>
          <p className="mt-2 text-sm text-[#d2c8b8]">
            Track your personal property search and see homes shared by our
            team.
          </p>
        </div>
      </section>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          <aside className="hidden w-56 shrink-0 flex-col gap-2 lg:flex">
            {sidebar.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${link.href === "/dashboard/property-requests" ? "bg-[#211e19] text-white shadow-md" : "bg-white text-[#575149] shadow-sm hover:bg-[#f1ede5]"}`}
              >
                <link.icon size={17} />
                {link.label}
              </Link>
            ))}
          </aside>
          <div className="min-w-0 flex-1">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#211e19]">
                  Your requests
                </h2>
                <p className="mt-1 text-sm text-[#756f66]">
                  A specialist will update you as your search progresses.
                </p>
              </div>
              <Link
                href="/request-property"
                className="inline-flex items-center gap-2 rounded-xl bg-[#b9822d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#211e19]"
              >
                <Plus size={16} />
                Request a Property
              </Link>
            </div>
            {loading ? (
              <div className="flex justify-center py-24">
                <Loader2 className="animate-spin text-[#b9822d]" size={35} />
              </div>
            ) : requests.length === 0 ? (
              <div className="rounded-3xl border border-[#e0d9cd] bg-white px-6 py-20 text-center shadow-card">
                <ClipboardList className="mx-auto text-[#b9822d]" size={42} />
                <h3 className="mt-4 text-xl font-bold text-[#211e19]">
                  Start your property search
                </h3>
                <p className="mt-2 text-sm text-[#756f66]">
                  Tell our team what you need and receive suitable verified
                  homes.
                </p>
                <Link
                  href="/request-property"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#211e19] px-5 py-3 text-sm font-semibold text-white"
                >
                  Create request <ArrowRight size={15} />
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                {requests.map((request) => (
                  <article
                    key={request._id}
                    className="rounded-3xl border border-[#e0d9cd] bg-white p-5 shadow-card sm:p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#a47737]">
                            {request.purpose === "BUY" ? "Buying" : "Rental"}{" "}
                            request
                          </p>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyle[request.status] || statusStyle.NEW}`}
                          >
                            {request.status.replace("_", " ")}
                          </span>
                        </div>
                        <h3 className="mt-2 text-xl font-bold text-[#211e19]">
                          {request.propertyType === "ANY"
                            ? "Any property type"
                            : request.propertyType}{" "}
                          in {request.preferredLocation}
                        </h3>
                        <p className="mt-2 text-sm text-[#756f66]">
                          Budget up to $
                          {Number(request.maxBudget).toLocaleString()}{" "}
                          {request.purpose === "RENT" ? "/ month" : ""} ·{" "}
                          {request.bedrooms}+ bed · {request.bathrooms}+ bath
                        </p>
                        {request.moveInDate && (
                          <p className="mt-2 flex items-center gap-1 text-xs text-[#8b8174]">
                            <CalendarDays size={13} /> Move-in:{" "}
                            {new Date(request.moveInDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-[#9a9284]">
                        Submitted{" "}
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="mt-5 rounded-2xl bg-[#faf7f0] p-4 text-sm leading-6 text-[#635a50]">
                      {request.requirements}
                    </p>
                    {request.adminNotes && (
                      <div className="mt-4 flex gap-3 rounded-2xl border border-[#ead7b1] bg-[#fff8e9] p-4 text-sm text-[#705321]">
                        <MessageSquare className="mt-0.5 shrink-0" size={17} />
                        <div>
                          <p className="font-bold">Note from StayNest</p>
                          <p className="mt-1 leading-6">{request.adminNotes}</p>
                        </div>
                      </div>
                    )}
                    {request.matchedProperties?.length > 0 && (
                      <section className="mt-5">
                        <div className="flex items-center gap-2">
                          <CheckCircle2
                            className="text-emerald-600"
                            size={18}
                          />
                          <h4 className="font-bold text-[#211e19]">
                            Properties shared for you
                          </h4>
                        </div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {request.matchedProperties.map((property: any) => (
                            <Link
                              href={`/apartments/${property._id}`}
                              key={property._id}
                              className="overflow-hidden rounded-2xl border border-[#e6dfd4] bg-[#fbfaf7] transition hover:-translate-y-0.5 hover:border-[#b9822d]"
                            >
                              <img
                                src={
                                  property.images?.[0] ||
                                  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600"
                                }
                                alt={property.title}
                                className="h-28 w-full object-cover"
                              />
                              <div className="p-3">
                                <p className="truncate text-sm font-bold text-[#211e19]">
                                  {property.title}
                                </p>
                                <p className="mt-1 flex items-center gap-1 text-xs text-[#83796d]">
                                  <MapPin size={11} />
                                  {property.city}
                                </p>
                                <p className="mt-2 text-sm font-bold text-[#a47737]">
                                  $
                                  {Number(
                                    property.listingPurpose === "BUY"
                                      ? property.finalPrice
                                      : property.pricePerMonth,
                                  ).toLocaleString()}
                                  <span className="ml-1 text-[11px] font-normal text-[#8b8174]">
                                    {property.listingPurpose === "BUY"
                                      ? "final price"
                                      : "/month"}
                                  </span>
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </section>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
