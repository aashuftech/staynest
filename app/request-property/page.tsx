"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CalendarDays, CheckCircle2, Home, Loader2, Send } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const types = ["ANY", "FLAT", "HOUSE", "STUDIO", "CONDO", "TOWNHOUSE", "VILLA"];

export default function RequestPropertyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({
    purpose: "RENT",
    propertyType: "ANY",
    preferredLocation: "",
    minBudget: "",
    maxBudget: "",
    bedrooms: "1",
    bathrooms: "1",
    moveInDate: "",
    requirements: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated")
      router.replace("/login?next=/request-property");
    if (status === "authenticated" && (session?.user as any)?.role === "ADMIN")
      router.replace("/admin");
  }, [status, session, router]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/property-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Unable to submit your request.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Unable to submit your request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading")
    return <div className="min-h-screen bg-[#f8f6f1]" />;
  if (submitted)
    return (
      <div className="min-h-screen bg-[#f8f6f1]">
        <Navbar />
        <main className="mx-auto flex min-h-screen max-w-xl items-center px-5 pt-16 text-center">
          <div className="w-full rounded-3xl border border-[#e0d9cd] bg-white p-8 shadow-card">
            <CheckCircle2 className="mx-auto text-emerald-500" size={54} />
            <p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-[#b9822d]">
              Request received
            </p>
            <h1 className="mt-2 text-3xl font-bold text-[#211e19]">
              We will look for the right fit.
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#756f66]">
              Your request is now marked New. Our team can review your details
              and share matching verified properties with you.
            </p>
            <button
              onClick={() => router.push("/dashboard/property-requests")}
              className="mt-7 rounded-xl bg-[#211e19] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b9822d]"
            >
              View My Property Requests
            </button>
          </div>
        </main>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f8f6f1]">
      <Navbar />
      <section className="relative overflow-hidden bg-[#0e0d0b] px-4 pb-11 pt-28 sm:px-6 sm:pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(185,138,67,.3),transparent_44%)]" />
        <div className="relative mx-auto max-w-5xl">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#d9ab59]">
            Personal property concierge
          </p>
          <h1 className="mt-3 text-4xl font-light text-white sm:text-5xl">
            Request a Property
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#d2c8b8]">
            Tell us what you need. We will review the request and share suitable
            verified homes.
          </p>
        </div>
      </section>
      <main className="mx-auto max-w-5xl px-4 py-9 sm:px-6">
        <form
          onSubmit={submit}
          className="rounded-3xl border border-[#e0d9cd] bg-white p-5 shadow-card sm:p-8"
        >
          <div className="mb-7 flex items-start gap-3 rounded-2xl bg-[#faf7f0] p-4 text-sm text-[#6f6251]">
            <Home className="mt-0.5 shrink-0 text-[#b9822d]" size={19} />
            Your request is private. Only the StayNest admin team can review
            your details and send matches.
          </div>
          {error && (
            <p className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold text-[#312c25]">
              I want to
              <input type="hidden" />
              <select
                value={form.purpose}
                onChange={(e) =>
                  setForm({
                    ...form,
                    purpose: e.target.value,
                    moveInDate: e.target.value === "BUY" ? "" : form.moveInDate,
                  })
                }
                className="mt-2 w-full rounded-xl border border-[#ded6ca] bg-white px-3 py-3 outline-none focus:border-[#b9822d]"
              >
                <option value="RENT">Rent a property</option>
                <option value="BUY">Buy a property</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-[#312c25]">
              Property type
              <select
                value={form.propertyType}
                onChange={(e) =>
                  setForm({ ...form, propertyType: e.target.value })
                }
                className="mt-2 w-full rounded-xl border border-[#ded6ca] bg-white px-3 py-3 outline-none focus:border-[#b9822d]"
              >
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type === "ANY"
                      ? "Any property type"
                      : type[0] + type.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-[#312c25] sm:col-span-2">
              Preferred location
              <input
                required
                value={form.preferredLocation}
                onChange={(e) =>
                  setForm({ ...form, preferredLocation: e.target.value })
                }
                placeholder="City or preferred area"
                className="mt-2 w-full rounded-xl border border-[#ded6ca] px-4 py-3 outline-none focus:border-[#b9822d]"
              />
            </label>
            <label className="text-sm font-semibold text-[#312c25]">
              Minimum budget (optional)
              <input
                type="number"
                min="0"
                value={form.minBudget}
                onChange={(e) =>
                  setForm({ ...form, minBudget: e.target.value })
                }
                placeholder="$ 0"
                className="mt-2 w-full rounded-xl border border-[#ded6ca] px-4 py-3 outline-none focus:border-[#b9822d]"
              />
            </label>
            <label className="text-sm font-semibold text-[#312c25]">
              Maximum{" "}
              {form.purpose === "BUY" ? "final price" : "monthly budget"}
              <input
                required
                type="number"
                min="1"
                value={form.maxBudget}
                onChange={(e) =>
                  setForm({ ...form, maxBudget: e.target.value })
                }
                placeholder="$ 0"
                className="mt-2 w-full rounded-xl border border-[#ded6ca] px-4 py-3 outline-none focus:border-[#b9822d]"
              />
            </label>
            <label className="text-sm font-semibold text-[#312c25]">
              Bedrooms
              <select
                value={form.bedrooms}
                onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                className="mt-2 w-full rounded-xl border border-[#ded6ca] bg-white px-3 py-3 outline-none focus:border-[#b9822d]"
              >
                {[0, 1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>
                    {value === 0 ? "Studio / any" : `${value}+ bedrooms`}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-[#312c25]">
              Bathrooms
              <select
                value={form.bathrooms}
                onChange={(e) =>
                  setForm({ ...form, bathrooms: e.target.value })
                }
                className="mt-2 w-full rounded-xl border border-[#ded6ca] bg-white px-3 py-3 outline-none focus:border-[#b9822d]"
              >
                {[0, 1, 2, 3, 4].map((value) => (
                  <option key={value} value={value}>
                    {value === 0 ? "Any" : `${value}+ bathrooms`}
                  </option>
                ))}
              </select>
            </label>
            {form.purpose === "RENT" && (
              <label className="text-sm font-semibold text-[#312c25] sm:col-span-2">
                Move-in date
                <CalendarDays
                  className="inline ml-2 text-[#b9822d]"
                  size={15}
                />
                <input
                  required
                  type="date"
                  value={form.moveInDate}
                  onChange={(e) =>
                    setForm({ ...form, moveInDate: e.target.value })
                  }
                  className="mt-2 w-full rounded-xl border border-[#ded6ca] px-4 py-3 outline-none focus:border-[#b9822d]"
                />
              </label>
            )}
            <label className="text-sm font-semibold text-[#312c25] sm:col-span-2">
              Detailed requirements
              <textarea
                required
                rows={5}
                maxLength={3000}
                value={form.requirements}
                onChange={(e) =>
                  setForm({ ...form, requirements: e.target.value })
                }
                placeholder="Tell us about preferred neighbourhoods, amenities, lifestyle needs, furnishing, pets, or anything else important to you."
                className="mt-2 w-full resize-y rounded-xl border border-[#ded6ca] px-4 py-3 outline-none focus:border-[#b9822d]"
              />
            </label>
          </div>
          <div className="mt-7 flex justify-end">
            <button
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-[#b9822d] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#211e19] disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Send size={17} />
              )}
              Submit property request
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
