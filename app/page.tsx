"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  ArrowDown,
  ArrowUpRight,
  Bath,
  BedDouble,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  CreditCard,
  DollarSign,
  Home,
  MapPin,
  Search,
  Shield,
  Smile,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import Reveal from "@/components/Reveal";

const PROPERTY_TYPES = [
  "Flat",
  "House",
  "Studio",
  "Condo",
  "Townhouse",
  "Villa",
];
const CITIES = [
  "Toronto",
  "New York",
  "Miami",
  "Seattle",
  "Denver",
  "San Francisco",
  "London",
  "Mumbai",
  "Dubai",
  "Sydney",
  "Chicago",
  "Los Angeles",
  "Boston",
  "Austin",
  "Paris",
  "Berlin",
  "Singapore",
  "Tokyo",
  "Barcelona",
  "Amsterdam",
];

interface Property {
  _id: string;
  title: string;
  city: string;
  neighborhood?: string;
  pricePerMonth: number;
  finalPrice?: number;
  listingPurpose?: "RENT" | "BUY";
  images: string[];
  rating: number;
  reviewCount: number;
  type: string;
  bedrooms: number;
  bathrooms: number;
  isVerified: boolean;
}

export default function HomePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    city: "",
    propertyType: "",
    minBudget: "",
    maxBudget: "",
    bedrooms: "",
    preferences: "",
  });
  const [loading, setLoading] = useState(false);
  const [listingPurpose, setListingPurpose] = useState<"RENT" | "BUY">("RENT");
  const [properties, setProperties] = useState<Property[]>([]);
  const [propsLoading, setPropsLoading] = useState(true);
  const [cityInput, setCityInput] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [statsStarted, setStatsStarted] = useState(false);
  const [stats, setStats] = useState([0, 0, 0]);
  const locationRequest = useRef<AbortController | null>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Use the same public listings query as the Apartments page.
    setPropsLoading(true);
    fetch(`/api/properties?limit=6&listingPurpose=${listingPurpose}`)
      .then((r) => r.json())
      .then((d) => {
        setProperties(d.properties || []);
        setPropsLoading(false);
      })
      .catch(() => setPropsLoading(false));
  }, [listingPurpose]);

  useEffect(() => {
    const element = statsRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.45 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!statsStarted) return;
    const targets = [14250, 98, 4.9];
    const startedAt = performance.now();
    let frame = 0;
    const animate = (now: number) => {
      const progress = Math.min((now - startedAt) / 1400, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setStats(targets.map((target) => target * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [statsStarted]);

  useEffect(() => {
    const elements = document.querySelectorAll(".home-luxury .lux-reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const handleCityInput = async (val: string) => {
    setCityInput(val);
    setForm((p) => ({ ...p, city: val }));
    locationRequest.current?.abort();
    if (!val.trim()) {
      setCitySuggestions([]);
      return;
    }
    const controller = new AbortController();
    locationRequest.current = controller;
    try {
      const response = await fetch(
        `/api/locations?q=${encodeURIComponent(val)}`,
        { signal: controller.signal },
      );
      const data = await response.json();
      if (!controller.signal.aborted) setCitySuggestions(data.locations || []);
    } catch (error: any) {
      if (error.name !== "AbortError")
        setCitySuggestions(
          CITIES.filter((city) =>
            city.toLowerCase().includes(val.toLowerCase()),
          ).slice(0, 25),
        );
    }
  };

  const selectCity = (city: string) => {
    setCityInput(city);
    setForm((p) => ({ ...p, city: city.split(",")[0].trim() }));
    setCitySuggestions([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const params = new URLSearchParams();
    if (form.city) params.set("city", form.city);
    if (form.propertyType) params.set("type", form.propertyType.toUpperCase());
    if (form.minBudget) params.set("minPrice", form.minBudget);
    if (form.maxBudget) params.set("maxPrice", form.maxBudget);
    if (form.bedrooms && form.bedrooms !== "Any")
      params.set("bedrooms", form.bedrooms);
    if (form.preferences) params.set("preferences", form.preferences);
    params.set("listingPurpose", listingPurpose);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <main className="home-luxury min-h-screen overflow-hidden bg-[#f8f6f1] text-[#2d2924]">
      <Navbar />

      <section className="relative flex min-h-[100svh] items-end overflow-hidden bg-[#0e0d0b] pb-32 pt-32 sm:items-center sm:pb-40 sm:pt-28">
        <img
          src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=2400&q=92"
          alt="Architectural luxury residence"
          className="lux-hero-image absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,8,6,.9)_0%,rgba(9,8,6,.58)_44%,rgba(9,8,6,.14)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.22)_0%,transparent_32%,rgba(10,9,7,.8)_100%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#171511] to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="max-w-4xl pb-6 sm:pb-16">
            <div className="lux-reveal mb-8 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#e8d5b1]">
              <span className="h-px w-12 bg-[#b98a43]" /> The StayNest
              collection
            </div>
            <h1 className="lux-reveal delay-100 font-hero max-w-4xl text-6xl leading-[1.05] text-white sm:text-7xl lg:text-[6.6rem]">
              Find a place.
              <br />
              <span
                className="italic text-[#e8d5b1]"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                Make it yours.
              </span>
            </h1>
            <p className="lux-reveal delay-200 mt-8 max-w-xl text-sm leading-7 tracking-[0.01em] text-white/65 sm:text-base">
              Rent a home, buy your next property, or list a place you love.
              StayNest brings every move together.
            </p>
            <div className="lux-reveal delay-300 mt-8 grid max-w-2xl grid-cols-1 gap-2 sm:grid-cols-3">
              <Link
                href="/apartments"
                className="group rounded-2xl border border-white/20 bg-black/20 px-4 py-3.5 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-[#e8d5b1]/70 hover:bg-white/10"
              >
                <span className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-[#e8d5b1]">
                  Rent{" "}
                  <ArrowUpRight
                    size={13}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </span>
                <span className="mt-1.5 block text-sm text-white/75">
                  Find your home
                </span>
              </Link>
              <Link
                href="/apartments"
                className="group rounded-2xl border border-white/20 bg-black/20 px-4 py-3.5 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-[#e8d5b1]/70 hover:bg-white/10"
              >
                <span className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-[#e8d5b1]">
                  Buy{" "}
                  <ArrowUpRight
                    size={13}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </span>
                <span className="mt-1.5 block text-sm text-white/75">
                  Own what&apos;s next
                </span>
              </Link>
              <Link
                href="/list-property"
                className="group rounded-2xl border border-white/20 bg-black/20 px-4 py-3.5 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-[#e8d5b1]/70 hover:bg-white/10"
              >
                <span className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-[#e8d5b1]">
                  List{" "}
                  <ArrowUpRight
                    size={13}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </span>
                <span className="mt-1.5 block text-sm text-white/75">
                  Rent or sell
                </span>
              </Link>
            </div>
          </div>
        </div>
        <a
          href="#residence-finder"
          className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 text-[9px] font-semibold uppercase tracking-[0.25em] text-white/65 sm:flex"
        >
          Discover your residence
          <span className="flex h-10 w-6 items-start justify-center rounded-full border border-white/45 p-1.5">
            <span className="h-2 w-1 rounded-full bg-[#e8d5b1] animate-[lux-scroll_1.8s_ease-in-out_infinite]" />
          </span>
        </a>
      </section>

      <section
        id="residence-finder"
        className="relative z-20 -mt-16 bg-[#171511] pb-20 pt-0 sm:-mt-24 sm:pb-28"
      >
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 0%, #b98a43 0, transparent 28%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="lux-reveal mb-10 max-w-2xl pt-16 sm:pt-24">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#e8d5b1]">
              Your private search
            </p>
            <h2 className="font-display text-4xl font-normal leading-tight text-white sm:text-5xl">
              Find the residence that feels like yours.
            </h2>
          </div>
          <div className="lux-reveal delay-100 rounded-[28px] border border-white/15 bg-white/10 p-5 shadow-[0_30px_90px_rgba(0,0,0,.3)] backdrop-blur-xl sm:p-8 lg:p-10">
            <div className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#b98a43]/60 bg-[#b98a43]/15 text-[#e8d5b1]">
                  <Sparkles size={17} />
                </span>
                <div>
                  <h3 className="font-display text-2xl text-white">
                    Residence Finder
                  </h3>
                  <p className="mt-1 text-sm text-white/55">
                    Tell us how you want to live. We will find the match.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-black/20 p-1.5">
                <span className="pl-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#e8d5b1]/80">
                  Search for
                </span>
                <div className="flex rounded-lg bg-white/10 p-0.5">
                  <button
                    type="button"
                    onClick={() => setListingPurpose("RENT")}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${listingPurpose === "RENT" ? "bg-white text-[#211e19] shadow-sm" : "text-white/65 hover:text-white"}`}
                  >
                    Rent
                  </button>
                  <button
                    type="button"
                    onClick={() => setListingPurpose("BUY")}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${listingPurpose === "BUY" ? "bg-[#b98a43] text-white shadow-sm" : "text-white/65 hover:text-white"}`}
                  >
                    Buy
                  </button>
                </div>
              </div>
            </div>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12 lg:gap-6"
            >
              <div className="lg:col-span-4">
                <label className="lux-label">Location (City / Area)</label>
                <div className="relative">
                  <MapPin
                    size={15}
                    className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#e8d5b1]/75"
                  />
                  <input
                    type="text"
                    placeholder="Type any city e.g. Mumbai, London..."
                    className="lux-input pl-12"
                    value={cityInput}
                    onChange={(e) => handleCityInput(e.target.value)}
                    autoComplete="off"
                  />
                  {citySuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-[#b98a43]/30 bg-[#211e19] p-1 shadow-2xl">
                      {citySuggestions.map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => selectCity(city)}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-white/80 transition hover:bg-white/10 hover:text-[#e8d5b1]"
                        >
                          <MapPin size={13} className="text-[#b98a43]" />
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="lg:col-span-3">
                <label className="lux-label">Property Type</label>
                <div className="relative">
                  <Home
                    size={15}
                    className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#e8d5b1]/75"
                  />
                  <select
                    className="lux-input appearance-none pl-12 pr-9"
                    value={form.propertyType}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, propertyType: e.target.value }))
                    }
                  >
                    <option value="">Flat, House, Studio...</option>
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#e8d5b1]/60"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 lg:col-span-3">
                <div>
                  <label
                    className={`lux-label ${listingPurpose === "BUY" ? "whitespace-nowrap" : ""}`}
                  >
                    {listingPurpose === "BUY"
                      ? "Min price ($)"
                      : "Min Budget ($/month)"}
                  </label>
                  <div className="relative">
                    <DollarSign
                      size={14}
                      className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#e8d5b1]/75"
                    />
                    <input
                      type="number"
                      placeholder="0"
                      className="lux-input pl-9"
                      value={form.minBudget}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, minBudget: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <label
                    className={`lux-label ${listingPurpose === "BUY" ? "whitespace-nowrap" : ""}`}
                  >
                    {listingPurpose === "BUY"
                      ? "Max price ($)"
                      : "Max Budget ($/month)"}
                  </label>
                  <div className="relative">
                    <DollarSign
                      size={14}
                      className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#e8d5b1]/75"
                    />
                    <input
                      type="number"
                      placeholder="Any"
                      className="lux-input pl-9"
                      value={form.maxBudget}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, maxBudget: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2 lg:self-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="lux-gold-button w-full justify-center px-4"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Finding...
                    </>
                  ) : (
                    <>
                      <Search size={16} />
                      Search
                    </>
                  )}
                </button>
              </div>
              <div className="md:col-span-2 lg:col-span-7">
                <label className="lux-label">Bedrooms</label>
                <div className="flex gap-2">
                  {["Any", "0", "1", "2", "3", "4+"].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          bedrooms: b === "Any" ? "" : b,
                        }))
                      }
                      className={`lux-bedroom ${(b === "Any" && !form.bedrooms) || form.bedrooms === b ? "is-selected" : ""}`}
                    >
                      {b === "0" ? "Studio" : b}
                    </button>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2 lg:col-span-5">
                <label className="lux-label">
                  Additional Preferences (Optional)
                </label>
                <textarea
                  className="lux-input min-h-[46px] resize-none py-3"
                  rows={2}
                  placeholder="e.g. near metro, quiet area, modern interior..."
                  value={form.preferences}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, preferences: e.target.value }))
                  }
                />
              </div>
            </form>
          </div>
        </div>
      </section>

      <section ref={statsRef} className="bg-[#f1ede5] py-14 sm:py-16">
        <div className="lux-reveal mx-auto grid max-w-7xl grid-cols-1 divide-y divide-[#cdbf9f]/50 px-5 text-center sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8 lg:px-10">
          {[
            {
              value: `${Math.round(stats[0]).toLocaleString()}+`,
              label: "Verified residences",
            },
            { value: `${Math.round(stats[1])}%`, label: "Guest confidence" },
            { value: `${stats[2].toFixed(1)}★`, label: "Average guest rating" },
          ].map((stat) => (
            <div key={stat.label} className="px-6 py-6 sm:py-1">
              <div className="font-display text-5xl font-semibold text-[#211e19] sm:text-6xl">
                {stat.value}
              </div>
              <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#756f66]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#f8f6f1] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="lux-reveal mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#a47737]">
                The collection
              </p>
              <h2 className="max-w-xl font-display text-4xl font-normal leading-tight text-[#211e19] sm:text-5xl">
                A considered selection of remarkable stays.
              </h2>
            </div>
            <Link href="/apartments" className="lux-text-link">
              View all residences <ArrowUpRight size={15} />
            </Link>
          </div>
          {propsLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-[22px] border border-[#e0d9cd] bg-white"
                >
                  <div className="shimmer h-72 w-full" />
                  <div className="space-y-3 p-6">
                    <div className="shimmer h-5 w-3/4 rounded" />
                    <div className="shimmer h-3 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="rounded-[28px] border border-[#e0d9cd] bg-white px-6 py-16 text-center">
              <Home size={32} className="mx-auto mb-4 text-[#b98a43]" />
              <h3 className="font-display text-2xl text-[#211e19]">
                No residences available yet
              </h3>
              <p className="mt-2 text-sm text-[#756f66]">
                Run the seed command to add sample properties.
              </p>
              <code className="mt-5 inline-block rounded-full bg-[#f1ede5] px-4 py-2 text-xs text-[#575149]">
                npm run seed
              </code>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property, index) => (
                <Link
                  key={property._id}
                  href={`/apartments/${property._id}`}
                  className="group relative overflow-hidden rounded-[22px] border border-[#e0d9cd] bg-white shadow-[0_10px_28px_rgba(24,21,17,.07)] transition-all duration-400 hover:-translate-y-1.5 hover:shadow-[0_22px_48px_rgba(24,21,17,.14)]"
                >
                  <article>
                    <div className="relative h-80 overflow-hidden">
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="lux-zoom-img h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#15130f]/90 via-[#15130f]/10 to-transparent opacity-75 transition duration-500 group-hover:opacity-100" />
                      {property.isVerified && (
                        <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full border border-white/25 bg-[#171511]/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur">
                          <CheckCircle size={12} className="text-[#e8d5b1]" />
                          Verified
                        </span>
                      )}
                      <span className="absolute right-4 top-4 rounded-full border border-white/25 bg-[#171511]/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur">
                        {property.type}
                      </span>
                      <div className="absolute inset-x-5 bottom-5 translate-y-2 text-white transition duration-500 group-hover:translate-y-0">
                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#e8d5b1]">
                              {property.city}
                              {property.neighborhood
                                ? ` · ${property.neighborhood}`
                                : ""}
                            </p>
                            <h3 className="mt-1 font-display text-2xl leading-tight">
                              {property.title}
                            </h3>
                          </div>
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#211e19] opacity-0 transition duration-300 group-hover:opacity-100">
                            <ArrowUpRight size={16} />
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 bg-white px-5 py-4">
                      <div className="flex gap-3 text-xs text-[#756f66]">
                        <span className="flex items-center gap-1">
                          <BedDouble size={13} className="text-[#a47737]" />
                          {property.bedrooms === 0
                            ? "Studio"
                            : `${property.bedrooms} Bed`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Bath size={13} className="text-[#a47737]" />
                          {property.bathrooms} Bath
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-display text-xl font-semibold text-[#211e19]">
                          $
                          {(listingPurpose === "BUY"
                            ? property.finalPrice
                            : property.pricePerMonth
                          )?.toLocaleString()}
                        </span>
                        <span className="text-xs text-[#756f66]">
                          {listingPurpose === "BUY"
                            ? " final price"
                            : " / month"}
                        </span>
                        {property.rating > 0 && (
                          <span className="ml-2 inline-flex items-center gap-0.5 text-xs font-semibold text-[#a47737]">
                            <Star size={11} fill="currentColor" />
                            {property.rating}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
          <div className="mt-10 text-center sm:hidden">
            <Link href="/apartments" className="lux-gold-button">
              View all residences <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#e9e2d6] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="lux-reveal mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#a47737]">
              The StayNest standard
            </p>
            <h2 className="font-display text-4xl font-normal leading-tight text-[#211e19] sm:text-5xl">
              The details behind every exceptional stay.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[24px] border border-[#d3c9b9] bg-[#d3c9b9] sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Shield,
                title: "Verified for Quality",
                desc: "Every listing manually verified. Smart calendar ensures instant, up-to-date bookings.",
              },
              {
                icon: CreditCard,
                title: "Secure Payments",
                desc: "Powered by Stripe — industry-leading payment processors for fraud protection.",
              },
              {
                icon: Sparkles,
                title: "AI-Powered Matching",
                desc: "Claude AI analyzes your preferences to find properties that perfectly match your needs.",
              },
              {
                icon: Clock,
                title: "Real-Time Availability",
                desc: "See live availability and book instantly — no back-and-forth needed.",
              },
              {
                icon: Star,
                title: "Top-Rated Properties",
                desc: "Browse 5-star reviewed apartments trusted by over 50,000 happy guests.",
              },
              {
                icon: Zap,
                title: "Instant Booking",
                desc: "Book in seconds. Confirmed immediately with secure payment.",
              },
            ].map((feature, index) => (
              <article
                key={feature.title}
                className={`lux-reveal lux-flip-card delay-${Math.min(((index % 3) + 1) * 100, 300)} group bg-[#f8f6f1] p-8 duration-500 ease-out hover:bg-[#211e19] sm:p-9`}
              >
                <span className="mb-8 flex h-11 w-11 items-center justify-center rounded-full border border-[#b98a43]/45 text-[#a47737] duration-500 ease-out group-hover:bg-[#b98a43] group-hover:text-white">
                  <feature.icon size={19} />
                </span>
                <h3 className="font-display text-2xl font-normal text-[#211e19] duration-500 ease-out group-hover:text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-[#756f66] duration-500 ease-out group-hover:text-white/65">
                  {feature.desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f8f6f1] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="lux-reveal mb-16 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#a47737]">
                A simpler arrival
              </p>
              <h2 className="font-display text-4xl font-normal leading-tight text-[#211e19] sm:text-5xl">
                A home, in three considered steps.
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-[#756f66]">
              From first search to first night, StayNest keeps every moment
              straightforward.
            </p>
          </div>
          <div className="relative grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
            <div className="absolute left-[16.5%] right-[16.5%] top-8 hidden h-px bg-[#cdbf9f] md:block" />
            {[
              {
                n: "01",
                icon: Search,
                title: "Browse",
                desc: "Search for apartments by city, date, and preferences. Our AI filters the best options for you.",
              },
              {
                n: "02",
                icon: BookOpen,
                title: "Book",
                desc: "Select your desired apartment and make a reservation with our secure payment gateway.",
              },
              {
                n: "03",
                icon: Smile,
                title: "Enjoy",
                desc: "Check in, relax, and enjoy your new home. We handle everything else.",
              },
            ].map((step, index) => (
              <article
                key={step.n}
                className={`lux-reveal delay-${(index + 1) * 100} relative text-center md:text-left`}
              >
                <div className="relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#b98a43]/60 bg-[#f8f6f1] text-[#a47737] md:mx-0">
                  <step.icon size={22} />
                </div>
                <p className="mt-7 text-[10px] font-semibold tracking-[0.24em] text-[#a47737]">
                  {step.n}
                </p>
                <h3 className="mt-2 font-display text-3xl font-normal text-[#211e19]">
                  {step.title}
                </h3>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-[#756f66] md:mx-0">
                  {step.desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#12110f] py-28 sm:py-36">
        <img
          src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=2200&q=85"
          alt="Luxury apartment interior"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-[#12110f]/60" />
        <div className="lux-reveal relative mx-auto max-w-3xl px-5 text-center sm:px-8">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#e8d5b1]">
            Begin beautifully
          </p>
          <h2 className="font-display text-5xl font-normal leading-[1.02] text-white sm:text-6xl">
            Your next address is waiting.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-white/70">
            Join thousands of guests who have found a more considered way to
            stay.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/signup" className="lux-gold-button">
              Get Started Free <ArrowUpRight size={16} />
            </Link>
            <Link href="/apartments" className="lux-outline-button">
              Browse Apartments
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx global>{`
        .home-luxury {
          --gold: #b98a43;
          --champagne: #e8d5b1;
          --ink: #211e19;
        }
        .home-luxury > nav {
          background: rgba(18, 17, 15, 0.12) !important;
          border-color: transparent !important;
          box-shadow: none !important;
          backdrop-filter: blur(5px);
        }
        .home-luxury > nav.shadow-lg,
        .home-luxury > nav.shadow-md {
          background: rgba(18, 17, 15, 0.88) !important;
          border-bottom: 1px solid rgba(232, 213, 177, 0.18) !important;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.18) !important;
          backdrop-filter: blur(18px);
        }
        .home-luxury > nav .h-16 {
          height: 4.7rem;
          transition: height 0.3s ease;
        }
        .home-luxury > nav.shadow-lg .h-16,
        .home-luxury > nav.shadow-md .h-16 {
          height: 3.95rem;
        }
        .home-luxury > nav a[class*="bg-blue"],
        .home-luxury > nav button[class*="bg-blue"] {
          background-color: var(--gold) !important;
        }
        .home-luxury > nav > div > div > div:nth-child(2) > a {
          position: relative;
          border-radius: 0 !important;
          background: transparent !important;
        }
        .home-luxury
          > nav
          > div
          > div
          > div:nth-child(2)
          > a[class*="font-semibold"]::after {
          content: "";
          position: absolute;
          left: 1rem;
          right: 1rem;
          bottom: 0.22rem;
          height: 1px;
          background: var(--gold);
        }
        .home-luxury .lux-hero-image {
          animation: lux-hero-zoom 18s ease-out both;
        }
        @keyframes lux-hero-zoom {
          from {
            transform: scale(1.06);
          }
          to {
            transform: scale(1);
          }
        }
        @keyframes lux-scroll {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.45;
          }
          50% {
            transform: translateY(15px);
            opacity: 1;
          }
        }
        .home-luxury .lux-reveal {
          opacity: 0;
          transform: translateY(22px);
          transition:
            opacity 0.75s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.75s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .home-luxury .lux-reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .home-luxury .delay-100 {
          transition-delay: 0.1s;
        }
        .home-luxury .delay-200 {
          transition-delay: 0.2s;
        }
        .home-luxury .delay-300 {
          transition-delay: 0.3s;
        }
        .home-luxury .lux-bedroom {
          flex: 1;
          min-width: 0;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 0.7rem;
          padding: 0.68rem 0.25rem;
          color: rgba(255, 255, 255, 0.68);
          font-size: 0.78rem;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        .home-luxury .lux-bedroom:hover {
          border-color: rgba(232, 213, 177, 0.55);
          color: #fff;
        }
        .home-luxury .lux-bedroom.is-selected {
          border-color: #b98a43;
          background: #b98a43;
          color: white;
        }
        .home-luxury .lux-text-link {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          color: #8d5d1d;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          transition: gap 0.2s ease;
        }
        .home-luxury .lux-text-link:hover {
          gap: 0.7rem;
        }
        .home-luxury footer {
          background: #12110f !important;
          border-top: 1px solid rgba(232, 213, 177, 0.14);
        }
        .home-luxury footer h4,
        .home-luxury footer .font-extrabold {
          color: #fff !important;
        }
        .home-luxury footer a:hover {
          color: #e8d5b1 !important;
        }
        .home-luxury footer [class*="text-blue"] {
          color: #d5ad69 !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .home-luxury *,
          .home-luxury *::before,
          .home-luxury *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
          .home-luxury .lux-reveal {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </main>
  );
}
