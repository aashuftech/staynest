"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Brain,
  Building2,
  Check,
  ClipboardList,
  Loader2,
  MapPin,
  Phone,
  Users,
  X,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function ListingRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<"APPROVE" | "DECLINE" | null>(
    null,
  );
  const [declining, setDeclining] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [error, setError] = useState("");
  const sidebarLinks = [
    { icon: Building2, label: "Dashboard", href: "/admin" },
    { icon: Building2, label: "Properties", href: "/admin/properties" },
    {
      icon: ClipboardList,
      label: "Listing Requests",
      href: "/admin/listing-requests",
      active: true,
    },
    {
      icon: ClipboardList,
      label: "Property Requests",
      href: "/admin/property-requests",
    },
    { icon: Users, label: "Users", href: "/admin/users" },
    { icon: BookOpen, label: "Bookings", href: "/admin/bookings" },
    { icon: Brain, label: "AI Activity", href: "/admin/ai" },
  ];

  useEffect(() => {
    fetch("/api/admin/listing-requests")
      .then((response) => response.json())
      .then((data) => setRequests(data.requests || data.properties || []))
      .finally(() => setLoading(false));
  }, []);

  const close = () => {
    if (actioning) return;
    setSelected(null);
    setDeclining(false);
    setDeclineReason("");
    setError("");
  };

  const decide = async (action: "APPROVE" | "DECLINE") => {
    if (!selected) return;
    if (action === "DECLINE" && !declineReason.trim()) {
      setError("Please enter the reason for declining this listing.");
      return;
    }
    setActioning(action);
    setError("");
    try {
      const response = await fetch(
        `/api/admin/listing-requests/${selected._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            declineReason:
              action === "DECLINE" ? declineReason.trim() : undefined,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Unable to update this request.");
        return;
      }
      setRequests((current) =>
        current.filter((request) => request._id !== selected._id),
      );
      setSelected(null);
      setDeclining(false);
      setDeclineReason("");
      setError("");
    } catch {
      setError("Unable to update this request. Please try again.");
    } finally {
      setActioning(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f6f1]">
      <Navbar />
      <section className="relative overflow-hidden bg-[#0e0d0b] px-4 pb-10 pt-28 sm:px-6 sm:pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(185,138,67,.3),transparent_45%)]" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#d9ab59]">
            Property management
          </p>
          <h1 className="mt-3 font-display text-4xl font-light text-white sm:text-5xl">
            Listing Requests
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#d2c8b8]">
            Review user-submitted rental and sale property requests before
            publication.
          </p>
        </div>
      </section>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          <aside className="hidden w-56 shrink-0 flex-col gap-2 lg:flex">
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${link.active ? "bg-[#211e19] text-white shadow-md" : "bg-white text-[#575149] shadow-sm hover:bg-[#f1ede5] hover:text-[#211e19]"}`}
              >
                <link.icon size={17} />
                {link.label}
              </Link>
            ))}
          </aside>
          <div className="min-w-0 flex-1">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[#a47737]">
                  Admin
                </p>
                <h1 className="mt-2 text-3xl font-bold text-[#211e19]">
                  Listing Requests
                </h1>
                <p className="mt-1 text-sm text-[#756f66]">
                  Review user-submitted rental and sale property requests.
                </p>
              </div>
              <Link
                href="/admin/properties"
                className="rounded-xl border border-[#d9d1c4] bg-white px-4 py-2.5 text-sm font-semibold text-[#575149] transition hover:bg-[#f1ede5]"
              >
                Back to Properties
              </Link>
            </div>
            {loading ? (
              <div className="flex justify-center py-24">
                <Loader2 className="animate-spin text-[#a47737]" size={36} />
              </div>
            ) : requests.length === 0 ? (
              <div className="rounded-3xl border border-[#e0d9cd] bg-white px-6 py-20 text-center shadow-card">
                <ClipboardList className="mx-auto text-[#a47737]" size={40} />
                <h2 className="mt-4 text-xl font-bold text-[#211e19]">
                  No pending requests
                </h2>
                <p className="mt-2 text-sm text-[#756f66]">
                  New property listing requests will appear here.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {requests.map((request) => (
                  <button
                    key={request._id}
                    type="button"
                    onClick={() => setSelected(request)}
                    className="overflow-hidden rounded-3xl border border-[#e0d9cd] bg-white text-left shadow-card transition hover:-translate-y-1 hover:shadow-card-hover"
                  >
                    <img
                      src={
                        request.images?.[0] ||
                        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"
                      }
                      alt=""
                      className="h-44 w-full object-cover"
                    />
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="font-semibold text-[#211e19]">
                          {request.title}
                        </h2>
                        <span className="shrink-0 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-700">
                          PENDING
                        </span>
                      </div>
                      <p className="mt-2 flex items-center gap-1 text-sm text-[#756f66]">
                        <MapPin size={13} />
                        {request.city}
                      </p>
                      <p className="mt-3 flex items-center gap-1 text-sm text-[#575149]">
                        <Phone size={13} className="text-[#a47737]" />
                        {request.ownerContact}
                      </p>
                      <p className="mt-3 text-sm font-bold text-[#a47737]">
                        {request.listingPurpose === "BUY"
                          ? `$${Number(request.finalPrice).toLocaleString()} final price`
                          : `$${Number(request.pricePerMonth).toLocaleString()}/month`}
                      </p>
                      <p className="mt-4 text-xs font-semibold text-[#8d5d1d]">
                        Open details and review →
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      {selected && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <button
            aria-label="Close"
            onClick={close}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <button
              aria-label="Close"
              onClick={close}
              disabled={!!actioning}
              className="absolute right-5 top-5 rounded-full p-2 text-gray-500 hover:bg-gray-100"
            >
              <X size={18} />
            </button>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#a47737]">
              {selected.listingPurpose === "BUY" ? "Sale" : "Rental"} listing
              request
            </p>
            <h2 className="mt-2 pr-10 text-2xl font-bold text-[#211e19]">
              {selected.title}
            </h2>
            <img
              src={
                selected.images?.[0] ||
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"
              }
              alt=""
              className="mt-5 h-56 w-full rounded-2xl object-cover"
            />
            <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div className="rounded-2xl bg-[#f8f6f1] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[#9a9284]">
                  Owner contact
                </p>
                <p className="mt-2 font-semibold text-[#211e19]">
                  {selected.ownerContact}
                </p>
                <p className="mt-1 text-[#756f66]">
                  {selected.ownerId?.name || "User"} ·{" "}
                  {selected.ownerId?.email || "No email"}
                </p>
              </div>
              <div className="rounded-2xl bg-[#f8f6f1] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[#9a9284]">
                  Property details
                </p>
                <p className="mt-2 font-semibold text-[#211e19]">
                  {selected.city} · {selected.type}
                </p>
                <p className="mt-1 text-[#756f66]">
                  {selected.bedrooms} bed · {selected.bathrooms} bath ·{" "}
                  {selected.area || "—"} sq ft
                </p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-[#575149]">
              {selected.description}
            </p>
            {declining && (
              <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4">
                <label
                  htmlFor="decline-reason"
                  className="block text-sm font-bold text-red-900"
                >
                  Reason for decline *
                </label>
                <p className="mt-1 text-xs text-red-700">
                  This message will be shown only to the listing owner.
                </p>
                <textarea
                  id="decline-reason"
                  value={declineReason}
                  onChange={(event) => setDeclineReason(event.target.value)}
                  rows={4}
                  placeholder="Explain what the owner needs to correct before re-registering..."
                  className="mt-3 w-full resize-none rounded-xl border border-red-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-400"
                />
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              </div>
            )}
            {!declining && error && (
              <p className="mt-5 text-sm text-red-600">{error}</p>
            )}
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              {declining ? (
                <>
                  <button
                    onClick={() => {
                      setDeclining(false);
                      setDeclineReason("");
                      setError("");
                    }}
                    disabled={!!actioning}
                    className="rounded-xl border border-[#d9d1c4] px-5 py-3 text-sm font-semibold text-[#575149] disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => decide("DECLINE")}
                    disabled={!!actioning}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                  >
                    {actioning === "DECLINE" ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <X size={16} />
                    )}
                    Confirm decline
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setDeclining(true);
                      setError("");
                    }}
                    disabled={!!actioning}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    <X size={16} />
                    Decline
                  </button>
                  <button
                    onClick={() => decide("APPROVE")}
                    disabled={!!actioning}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#b9822d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#9f6d22] disabled:opacity-50"
                  >
                    {actioning === "APPROVE" ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Check size={16} />
                    )}
                    Approve listing
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
