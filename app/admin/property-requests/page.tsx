"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Brain,
  Building2,
  ClipboardList,
  Eye,
  Loader2,
  Send,
  Trash2,
  Users,
  X,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const STATUSES = ["NEW", "REVIEWING", "CONTACTED", "MATCH_FOUND", "CLOSED"];
const STATUS_STYLE: Record<string, string> = {
  NEW: "bg-sky-100 text-sky-700",
  REVIEWING: "bg-amber-100 text-amber-700",
  CONTACTED: "bg-violet-100 text-violet-700",
  MATCH_FOUND: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-slate-200 text-slate-700",
};
const NAV = [
  { icon: Building2, label: "Dashboard", href: "/admin" },
  { icon: Building2, label: "Properties", href: "/admin/properties" },
  {
    icon: ClipboardList,
    label: "Listing Requests",
    href: "/admin/listing-requests",
  },
  {
    icon: ClipboardList,
    label: "Property Requests",
    href: "/admin/property-requests",
    active: true,
  },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: BookOpen, label: "Bookings", href: "/admin/bookings" },
  { icon: Brain, label: "AI Activity", href: "/admin/ai" },
];

export default function AdminPropertyRequestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = (session?.user as any)?.role;
  const [requests, setRequests] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/property-requests");
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Unable to load requests.");
      setRequests(data.requests || []);
    } catch (err: any) {
      setError(err.message || "Unable to load requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (status === "authenticated" && role !== "ADMIN") router.replace("/");
  }, [status, role, router]);

  useEffect(() => {
    if (status === "authenticated" && role === "ADMIN") load();
  }, [status, role]);

  const open = async (request: any) => {
    setError("");
    try {
      const response = await fetch(
        `/api/admin/property-requests/${request._id}`,
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Unable to open request.");
      setSelected(data.request);
    } catch (err: any) {
      setError(err.message || "Unable to open request.");
    }
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(
        `/api/admin/property-requests/${selected._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: selected.status,
            adminNotes: selected.adminNotes || "",
            matchedPropertyIds: (selected.matchedProperties || []).map(
              (property: any) => property._id,
            ),
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save update.");
      setRequests((current) =>
        current.map((request) =>
          request._id === data.request._id ? data.request : request,
        ),
      );
      setSelected(null);
    } catch (err: any) {
      setError(err.message || "Unable to save update.");
    } finally {
      setSaving(false);
    }
  };

  const deleteRequest = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError("");
    try {
      const response = await fetch(
        `/api/admin/property-requests/${deleteTarget._id}`,
        { method: "DELETE" },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Unable to delete request.");
      setRequests((current) =>
        current.filter((request) => request._id !== data.deletedId),
      );
      setDeleteTarget(null);
    } catch (err: any) {
      setError(err.message || "Unable to delete request.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f6f1]">
      <Navbar />
      <section className="relative overflow-hidden bg-[#0e0d0b] px-4 pb-10 pt-28 sm:px-6 sm:pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(185,138,67,.3),transparent_45%)]" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#d9ab59]">
            Concierge management
          </p>
          <h1 className="mt-3 text-4xl font-light text-white sm:text-5xl">
            Property Requests
          </h1>
          <p className="mt-2 text-sm text-[#d2c8b8]">
            Review user requests, send notes, and share suitable homes.
          </p>
        </div>
      </section>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          <aside className="hidden w-56 shrink-0 flex-col gap-2 lg:flex">
            {NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${link.active ? "bg-[#211e19] text-white shadow-md" : "bg-white text-[#575149] shadow-sm hover:bg-[#f1ede5]"}`}
              >
                <link.icon size={17} />
                {link.label}
              </Link>
            ))}
          </aside>
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold text-[#211e19]">
              All user property requests
            </h2>
            <p className="mt-1 text-sm text-[#756f66]">
              Open a request to reply or select a property.
            </p>
            {error && (
              <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}
            {loading ? (
              <div className="flex justify-center py-24">
                <Loader2 className="animate-spin text-[#b9822d]" size={36} />
              </div>
            ) : requests.length === 0 ? (
              <div className="mt-6 rounded-3xl bg-white p-16 text-center shadow-card">
                <ClipboardList className="mx-auto text-[#b9822d]" size={42} />
                <h3 className="mt-4 text-xl font-bold">
                  No property requests yet
                </h3>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {requests.map((request) => (
                  <article
                    key={request._id}
                    className="relative rounded-3xl border border-[#e0d9cd] bg-white shadow-card transition hover:-translate-y-0.5 hover:border-[#b9822d]"
                  >
                    <button
                      type="button"
                      onClick={() => open(request)}
                      className="w-full p-5 pr-14 text-left"
                    >
                      <div className="flex justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#a47737]">
                            {request.purpose} · {request.propertyType}
                          </p>
                          <h3 className="mt-2 text-lg font-bold text-[#211e19]">
                            {request.preferredLocation}
                          </h3>
                        </div>
                        <span
                          className={`h-fit rounded-full px-2.5 py-1 text-[10px] font-bold ${STATUS_STYLE[request.status]}`}
                        >
                          {request.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-[#756f66]">
                        Up to ${Number(request.maxBudget).toLocaleString()} ·{" "}
                        {request.bedrooms}+ bed · {request.bathrooms}+ bath
                      </p>
                      <p className="mt-4 flex items-center gap-1 text-xs font-bold text-[#a47737]">
                        Open request <Eye size={13} />
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(request)}
                      title="Delete request"
                      aria-label="Delete request"
                      className="absolute right-4 top-4 rounded-xl border border-red-100 bg-white p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </article>
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
            onClick={() => !saving && setSelected(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <button
              onClick={() => !saving && setSelected(null)}
              className="absolute right-5 top-5 rounded-full p-2 text-[#756f66] hover:bg-[#f1ede5]"
            >
              <X size={19} />
            </button>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#a47737]">
              {selected.purpose} request
            </p>
            <h2 className="mt-2 pr-8 text-2xl font-bold text-[#211e19]">
              {selected.propertyType} in {selected.preferredLocation}
            </h2>
            <p className="mt-2 text-sm text-[#756f66]">
              From {selected.ownerId?.name || "User"} ·{" "}
              {selected.ownerId?.email || "No email"}
            </p>
            <div className="mt-5 rounded-2xl bg-[#faf7f0] p-4 text-sm leading-6 text-[#5f564b]">
              <strong className="text-[#211e19]">Requirements</strong>
              <p className="mt-1">{selected.requirements}</p>
            </div>
            <label className="mt-5 block text-sm font-bold text-[#312c25]">
              Request status
              <select
                value={selected.status}
                onChange={(event) =>
                  setSelected({ ...selected, status: event.target.value })
                }
                className="mt-2 w-full rounded-xl border border-[#ded6ca] bg-white px-3 py-3 outline-none focus:border-[#b9822d]"
              >
                {STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {item.replace("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-5 block text-sm font-bold text-[#312c25]">
              Reply / note for user
              <textarea
                rows={5}
                value={selected.adminNotes || ""}
                onChange={(event) =>
                  setSelected({ ...selected, adminNotes: event.target.value })
                }
                placeholder="Write an update for the user..."
                className="mt-2 w-full resize-y rounded-xl border border-[#ded6ca] px-3 py-3 outline-none focus:border-[#b9822d]"
              />
            </label>
            <div className="mt-6 rounded-2xl border border-[#e5ddd1] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-[#211e19]">Shared properties</p>
                  <p className="mt-1 text-xs text-[#756f66]">
                    {selected.matchedProperties?.length || 0} homes currently
                    visible to this user.
                  </p>
                </div>
                <Link
                  href={`/admin/property-requests/select?requestId=${selected._id}`}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#211e19] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#b9822d]"
                >
                  Select a Property
                </Link>
              </div>
              {selected.matchedProperties?.length > 0 && (
                <div className="mt-4 space-y-2">
                  {selected.matchedProperties.map((property: any) => (
                    <div
                      key={property._id}
                      className="flex items-center gap-3 rounded-xl bg-[#faf7f0] p-2"
                    >
                      <img
                        src={property.images?.[0]}
                        alt=""
                        className="h-11 w-14 rounded-lg object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#211e19]">
                          {property.title}
                        </p>
                        <p className="text-xs text-[#756f66]">
                          {property.city}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            <div className="mt-7 flex justify-end gap-3">
              <button
                onClick={() => setSelected(null)}
                disabled={saving}
                className="rounded-xl border border-[#d9d1c4] px-5 py-3 text-sm font-semibold text-[#575149]"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-[#b9822d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#211e19] disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Send size={16} />
                )}
                Save reply
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteTarget && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <button
            aria-label="Close confirmation"
            onClick={() => !deleting && setDeleteTarget(null)}
            className="absolute inset-0 bg-black/60"
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.16em] text-red-600">
                  Delete request
                </p>
                <h2 className="mt-2 text-xl font-bold text-[#211e19]">
                  Remove this property request?
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <p className="mt-4 text-sm leading-6 text-[#756f66]">
              This removes the request and its shared-property links from the
              admin and user view. This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="rounded-xl border border-[#d9d1c4] px-4 py-2.5 text-sm font-semibold text-[#575149]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteRequest}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {deleting && <Loader2 size={15} className="animate-spin" />}
                Delete request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
