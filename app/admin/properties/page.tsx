"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import {
  Building2,
  Users,
  BookOpen,
  Brain,
  ClipboardList,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  MapPin,
  BedDouble,
  Eye,
  Pencil,
} from "lucide-react";

export default function AdminPropertiesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [showListingChoice, setShowListingChoice] = useState(false);
  const [listingPurpose, setListingPurpose] = useState<"RENT" | "BUY">("RENT");
  const [showUserListings, setShowUserListings] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated" && (session?.user as any)?.role !== "ADMIN")
      router.push("/dashboard");
  }, [status, session, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    setLoading(true);
    if (showUserListings) {
      fetch("/api/admin/user-listings")
        .then((r) => r.json())
        .then((d) => {
          const results = d.properties || [];
          setProperties(
            search
              ? results.filter((p: any) =>
                  `${p.city} ${p.title}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                )
              : results,
          );
          setLoading(false);
        })
        .catch(() => setLoading(false));
      return;
    }
    const query = new URLSearchParams({
      limit: "50",
      listingPurpose,
      adminOnly: "true",
    });
    if (search) query.set("city", search);
    fetch(`/api/properties?${query.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setProperties(d.properties || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status, search, listingPurpose, showUserListings]);

  const handleVerify = async (id: string, current: boolean) => {
    setVerifying(id);
    await fetch(`/api/properties/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVerified: !current }),
    });
    setProperties((prev) =>
      prev.map((p) => (p._id === id ? { ...p, isVerified: !current } : p)),
    );
    setVerifying(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this property permanently?")) return;
    setDeleting(id);
    await fetch(`/api/properties/${id}`, { method: "DELETE" });
    setProperties((prev) => prev.filter((p) => p._id !== id));
    setDeleting(null);
  };

  const sidebarLinks = [
    { icon: Building2, label: "Dashboard", href: "/admin" },
    {
      icon: Building2,
      label: "Properties",
      href: "/admin/properties",
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
            Properties
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#d2c8b8]">
            Review every published and user-submitted property listing.
          </p>
        </div>
      </section>
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            <aside className="hidden lg:flex flex-col w-56 shrink-0 gap-1">
              {sidebarLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#575149] shadow-sm transition-all hover:bg-[#f1ede5] hover:text-[#211e19]"
                >
                  <link.icon size={20} />
                  <span className="text-xs font-medium">{link.label}</span>
                </Link>
              ))}
            </aside>
            <main className="flex-1 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Properties
                  </h1>
                  <p className="text-gray-400 text-sm">
                    {properties.length} listings
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href="/admin/listing-requests"
                    className="inline-flex items-center gap-2 rounded-xl border border-[#d9d1c4] bg-white px-4 py-2.5 text-sm font-semibold text-[#575149] transition hover:bg-[#f1ede5]"
                  >
                    <ClipboardList size={16} />
                    Listing Requests
                  </Link>
                  <button
                    onClick={() => setShowListingChoice(true)}
                    className="btn-primary flex items-center gap-2 py-2.5 px-5 text-sm"
                  >
                    <Plus size={16} />
                    Add Property
                  </button>
                </div>
              </div>
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search by city..."
                  className="input-field pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="inline-flex flex-wrap rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
                <button
                  onClick={() => {
                    setShowUserListings(false);
                    setListingPurpose("RENT");
                  }}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold ${!showUserListings && listingPurpose === "RENT" ? "bg-blue-600 text-white" : "text-gray-600"}`}
                >
                  Rent
                </button>
                <button
                  onClick={() => {
                    setShowUserListings(false);
                    setListingPurpose("BUY");
                  }}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold ${!showUserListings && listingPurpose === "BUY" ? "bg-amber-500 text-white" : "text-gray-600"}`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setShowUserListings(true)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold ${showUserListings ? "bg-[#211e19] text-white" : "text-gray-600"}`}
                >
                  User Listings
                </button>
              </div>
              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader2 size={36} className="animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {properties.map((p) => (
                    <div
                      key={p._id}
                      className="bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover transition-all"
                    >
                      <div className="relative h-40">
                        <img
                          src={
                            p.images?.[0] ||
                            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"
                          }
                          className="w-full h-full object-cover"
                          alt={p.title}
                        />
                        <div
                          className={`absolute top-2 left-2 flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${p.isVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                        >
                          {p.isVerified ? (
                            <CheckCircle size={10} />
                          ) : (
                            <XCircle size={10} />
                          )}
                          {p.isVerified ? "Verified" : "Unverified"}
                        </div>
                        <div className="absolute top-2 right-2 bg-[#1e2a4a]/80 text-white text-xs px-2 py-0.5 rounded-full">
                          {p.type}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                          {p.title}
                        </h3>
                        <div className="flex items-center gap-3 text-gray-400 text-xs mb-2">
                          <span className="flex items-center gap-1">
                            <MapPin size={11} />
                            {p.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <BedDouble size={11} />
                            {p.bedrooms === 0 ? "Studio" : `${p.bedrooms} bed`}
                          </span>
                        </div>
                        <div className="text-blue-600 font-bold text-sm mb-3">
                          {p.listingPurpose === "BUY" ? (
                            <>
                              <span>${p.finalPrice?.toLocaleString()}</span>
                              <span className="text-gray-400 text-xs font-normal">
                                {" "}
                                final price
                              </span>
                            </>
                          ) : (
                            <>
                              <span>${p.pricePerMonth?.toLocaleString()}</span>
                              <span className="text-gray-400 text-xs font-normal">
                                /month
                              </span>
                              {Number(p.securityDeposit) > 0 && (
                                <div className="mt-1 text-xs font-medium text-amber-700">
                                  Deposit: $
                                  {Number(p.securityDeposit).toLocaleString()}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        {showUserListings && (
                          <div className="mb-3 rounded-xl bg-slate-50 p-3 text-xs text-gray-600">
                            <div>
                              Contact:{" "}
                              <span className="font-semibold text-gray-900">
                                {p.ownerContact || "Not provided"}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedOwner(p.ownerId)}
                              className="mt-1 font-semibold text-blue-600 hover:underline"
                            >
                              Listed by {p.ownerId?.name || "User"}
                            </button>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVerify(p._id, p.isVerified)}
                            disabled={verifying === p._id}
                            className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1 ${p.isVerified ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100" : "bg-green-50 text-green-700 hover:bg-green-100"}`}
                          >
                            {verifying === p._id ? (
                              <Loader2 size={11} className="animate-spin" />
                            ) : p.isVerified ? (
                              "Unverify"
                            ) : (
                              "Verify"
                            )}
                          </button>
                          <Link
                            href={`/apartments/${p._id}`}
                            className="flex-1 text-xs py-1.5 rounded-lg font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 text-center flex items-center justify-center gap-1"
                          >
                            <Eye size={11} /> View
                          </Link>
                          <Link
                            href={`/admin/properties/add?listingPurpose=${p.listingPurpose || "RENT"}&edit=${p._id}`}
                            aria-label={`Edit ${p.title}`}
                            className="w-8 h-7 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 flex items-center justify-center"
                          >
                            <Pencil size={13} />
                          </Link>
                          <button
                            onClick={() => handleDelete(p._id)}
                            disabled={deleting === p._id}
                            className="w-8 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center"
                          >
                            {deleting === p._id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Trash2 size={13} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
      <Footer />
      {selectedOwner && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <button
            aria-label="Close owner information"
            onClick={() => setSelectedOwner(null)}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-lg font-bold text-white">
              {selectedOwner.image ? (
                <img
                  src={selectedOwner.image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                (selectedOwner.name?.[0] || "U").toUpperCase()
              )}
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900">
              {selectedOwner.name || "User"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {selectedOwner.email || "No email available"}
            </p>
            <p className="mt-2 text-xs text-gray-400">
              Role: {selectedOwner.role || "USER"} · Joined{" "}
              {selectedOwner.createdAt
                ? new Date(selectedOwner.createdAt).toLocaleDateString()
                : "—"}
            </p>
            <button
              onClick={() => setSelectedOwner(null)}
              className="btn-primary mt-6 px-5 py-2.5 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {showListingChoice && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button
            aria-label="Close"
            onClick={() => setShowListingChoice(false)}
            className="absolute inset-0 bg-black/50"
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900">
              What would you like to list?
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Choose the listing type before adding property details.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link
                href="/admin/properties/add?listingPurpose=RENT"
                className="rounded-2xl border-2 border-blue-100 p-5 text-center transition hover:border-blue-600 hover:bg-blue-50"
              >
                <div className="font-semibold text-gray-900">
                  Rental property
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Monthly rent listing
                </div>
              </Link>
              <Link
                href="/admin/properties/add?listingPurpose=BUY"
                className="rounded-2xl border-2 border-amber-100 p-5 text-center transition hover:border-amber-500 hover:bg-amber-50"
              >
                <div className="font-semibold text-gray-900">Buy property</div>
                <div className="mt-1 text-xs text-gray-500">
                  Final & booking price
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
