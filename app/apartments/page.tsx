"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Reveal from "@/components/Reveal";
import { getAiVisitorId } from "@/lib/ai-visitor";
import Link from "next/link";
import {
  Loader2,
  SlidersHorizontal,
  X,
  MapPin,
  Star,
  CheckCircle,
  Heart,
  BedDouble,
  Bath,
  Sparkles,
  Search,
} from "lucide-react";

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
];

const TYPES = ["FLAT", "HOUSE", "STUDIO", "CONDO", "TOWNHOUSE", "VILLA"];

type Filters = {
  city: string;
  type: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  isVerified: boolean;
};

function FilterPanel({
  citySearch,
  citySuggestions,
  filters,
  onCityChange,
  onSelectCity,
  onChangeFilters,
  onClear,
  onApply,
  aiMode,
  onToggleAi,
  aiPrompt,
  onAiPromptChange,
  onAiSearch,
  aiLoading,
  aiSuggestion,
  listingPurpose,
}: {
  citySearch: string;
  citySuggestions: string[];
  filters: Filters;
  onCityChange: (value: string) => void;
  onSelectCity: (city: string) => void;
  onChangeFilters: React.Dispatch<React.SetStateAction<Filters>>;
  onClear: () => void;
  onApply: () => void;
  aiMode: boolean;
  onToggleAi: () => void;
  aiPrompt: string;
  onAiPromptChange: (value: string) => void;
  onAiSearch: () => void;
  aiLoading: boolean;
  aiSuggestion: string;
  listingPurpose: "RENT" | "BUY";
}) {
  if (aiMode) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold text-white">
            Search with AI
          </h3>
          <button
            type="button"
            onClick={onToggleAi}
            className="text-xs text-[#e8d5b1] underline"
          >
            Filters
          </button>
        </div>
        <p className="text-sm leading-5 text-white/60">
          Hindi, English ya Hinglish mein apni requirement batayein.
        </p>
        <textarea
          value={aiPrompt}
          onChange={(e) => onAiPromptChange(e.target.value)}
          placeholder="Jaise: Mumbai mein 2 bedroom flat, ₹50,000 per month ke andar, parking ke saath"
          className="lux-input min-h-32 resize-none"
        />
        <button
          type="button"
          onClick={onAiSearch}
          disabled={!aiPrompt.trim() || aiLoading}
          className="lux-gold-button w-full"
        >
          {aiLoading ? "Searching..." : "Find with AI"}
        </button>
        {aiSuggestion && (
          <p className="rounded-xl bg-white/10 p-3 text-sm leading-6 text-white/80">
            {aiSuggestion}
          </p>
        )}
      </div>
    );
  }
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-semibold text-white">
          Filters
        </h3>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onToggleAi}
            className="text-xs font-medium text-[#e8d5b1]"
          >
            AI Search
          </button>
          <button
            onClick={onClear}
            className="text-xs font-medium text-[#e8d5b1]/80 underline-offset-2 transition-colors hover:text-white hover:underline"
          >
            Clear All
          </button>
        </div>
      </div>

      <div>
        <label className="lux-label">City / Location</label>

        <div className="relative">
          <input
            type="text"
            placeholder="Type any city or area..."
            className="lux-input"
            value={citySearch}
            onChange={(e) => onCityChange(e.target.value)}
            autoComplete="off"
          />

          {citySuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-[#b98a43]/30 bg-[#211e19] p-1 shadow-2xl">
              {citySuggestions.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => onSelectCity(city)}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-white/80 transition hover:bg-white/10 hover:text-[#e8d5b1]"
                >
                  <MapPin size={12} className="text-[#b98a43]" />
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="lux-label">Property Type</label>

        <select
          className="lux-input appearance-none"
          value={filters.type}
          onChange={(e) =>
            onChangeFilters((p) => ({
              ...p,
              type: e.target.value,
            }))
          }
        >
          <option value="">All Types</option>

          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0) + t.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="lux-label">
          {listingPurpose === "BUY" ? "Final Price ($)" : "Price/Month ($)"}
        </label>

        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            className="lux-input"
            value={filters.minPrice}
            onChange={(e) =>
              onChangeFilters((p) => ({
                ...p,
                minPrice: e.target.value,
              }))
            }
          />

          <input
            type="number"
            placeholder="Max"
            className="lux-input"
            value={filters.maxPrice}
            onChange={(e) =>
              onChangeFilters((p) => ({
                ...p,
                maxPrice: e.target.value,
              }))
            }
          />
        </div>
      </div>

      <div>
        <label className="lux-label">Bedrooms</label>

        <div className="flex flex-wrap gap-2">
          {["Any", "0", "1", "2", "3", "4+"].map((b) => (
            <button
              key={b}
              type="button"
              onClick={() =>
                onChangeFilters((p) => ({
                  ...p,
                  bedrooms: b === "Any" ? "" : b,
                }))
              }
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                (b === "Any" && !filters.bedrooms) || filters.bedrooms === b
                  ? "border-[#b98a43] bg-[#b98a43] text-white"
                  : "border-white/15 text-white/65 hover:border-[#b98a43]/50 hover:text-white"
              }`}
            >
              {b === "0" ? "Studio" : b}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={filters.isVerified}
            onChange={(e) =>
              onChangeFilters((p) => ({
                ...p,
                isVerified: e.target.checked,
              }))
            }
            className="h-4 w-4 accent-[#b98a43]"
          />

          <span className="text-sm font-medium text-white/75">
            Verified Only
          </span>
        </label>
      </div>

      <button onClick={onApply} className="lux-gold-button w-full">
        Apply Filters
      </button>
    </div>
  );
}

function PropertyCard({ p, index }: { p: any; index: number }) {
  const [liked, setLiked] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [showReservationNotice, setShowReservationNotice] = useState(false);

  const reservePurchase = async () => {
    setReserving(true);
    try {
      const response = await fetch("/api/purchase-reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: p._id }),
      });
      const data = await response.json();
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!response.ok) {
        window.alert(data.error || "Unable to reserve this property.");
        return;
      }
      window.location.href = `/payment?bookingId=${data.bookingId}`;
    } finally {
      setReserving(false);
    }
  };

  return (
    <Reveal delay={(index % 6) * 70}>
      <div className="group relative overflow-hidden rounded-[22px] border border-[#e0d9cd] bg-white shadow-[0_10px_28px_rgba(24,21,17,.07)] transition-all duration-400 hover:-translate-y-1.5 hover:shadow-[0_22px_48px_rgba(24,21,17,.14)]">
        <Link href={`/apartments/${p._id}`}>
          <div className="relative h-52 overflow-hidden">
            <img
              src={
                p.images?.[0] ||
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600"
              }
              alt={p.title}
              className="lux-zoom-img h-full w-full object-cover"
            />

            {p.isVerified && (
              <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-[#a47737] backdrop-blur">
                <CheckCircle size={11} />
                Verified
              </div>
            )}

            <div className="absolute right-10 top-3 rounded-full bg-[#171511]/80 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
              {p.type}
            </div>
          </div>

          <div className="p-4">
            <div className="mb-1 flex items-start justify-between">
              <h3 className="line-clamp-1 font-display text-lg font-semibold text-[#211e19]">
                {p.title}
              </h3>

              {p.rating > 0 && (
                <div className="ml-2 flex shrink-0 items-center gap-0.5 text-xs font-bold text-[#a47737]">
                  <Star size={11} fill="currentColor" />
                  {p.rating}
                </div>
              )}
            </div>

            <div className="mb-2 flex items-center gap-1 text-xs text-[#9a9284]">
              <MapPin size={11} />
              {p.city}
              {p.neighborhood ? `, ${p.neighborhood}` : ""}
            </div>

            <div className="mb-3 flex items-center gap-3 text-xs text-[#9a9284]">
              <span className="flex items-center gap-1">
                <BedDouble size={12} />
                {p.bedrooms === 0 ? "Studio" : `${p.bedrooms} Bed`}
              </span>

              <span className="flex items-center gap-1">
                <Bath size={12} />
                {p.bathrooms} Bath
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                {p.listingPurpose === "BUY" ? (
                  <>
                    <span className="font-display text-lg font-semibold text-[#211e19]">
                      ${p.finalPrice?.toLocaleString()}
                    </span>
                    <span className="text-xs text-[#9a9284]"> final price</span>
                    <div className="mt-1 text-xs font-semibold text-[#a47737]">
                      Book for ${p.bookingPrice?.toLocaleString()}
                    </div>
                  </>
                ) : (
                  <>
                    <span className="font-display text-lg font-semibold text-[#211e19]">
                      ${p.pricePerMonth?.toLocaleString()}
                    </span>
                    <span className="text-xs text-[#9a9284]">/month</span>
                    {Number(p.securityDeposit) > 0 && (
                      <div className="mt-1 text-xs font-medium text-[#a47737]">
                        Security deposit: $
                        {Number(p.securityDeposit).toLocaleString()}
                      </div>
                    )}
                  </>
                )}
              </div>

              <span className="text-xs text-[#c3bcae]">
                {p.reviewCount} reviews
              </span>
            </div>
          </div>
        </Link>

        {p.listingPurpose === "BUY" && p.saleStatus !== "SOLD" && (
          <button
            type="button"
            onClick={() => setShowReservationNotice(true)}
            disabled={reserving}
            className="mx-4 mb-4 w-[calc(100%-2rem)] rounded-xl bg-[#211e19] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#b98a43] disabled:opacity-60"
          >
            {reserving
              ? "Preparing booking..."
              : `Book this property — $${p.bookingPrice?.toLocaleString()}`}
          </button>
        )}

        {showReservationNotice && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <button
              aria-label="Close booking notice"
              onClick={() => setShowReservationNotice(false)}
              className="absolute inset-0 bg-[#0e0d0b]/75 backdrop-blur-sm"
            />
            <div
              role="dialog"
              aria-modal="true"
              className="relative w-full max-w-md rounded-3xl border border-[#b98a43]/35 bg-[#24211c] p-7 text-[#fffaf0] shadow-2xl"
            >
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#d7a247]">
                Purchase reservation
              </p>
              <h3 className="mt-2 font-display text-2xl">
                Reserve this property for 7 days
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#d2c8b8]">
                Pay{" "}
                <strong className="text-white">
                  ${p.bookingPrice?.toLocaleString()}
                </strong>{" "}
                now to reserve this property. Complete the purchase within 7
                days; after this deadline, the booking price is non-refundable.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowReservationNotice(false)}
                  className="flex-1 rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white/80"
                >
                  Not now
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReservationNotice(false);
                    reservePurchase();
                  }}
                  className="flex-1 rounded-xl bg-[#b98a43] px-4 py-3 text-sm font-semibold text-white hover:bg-[#9f7435]"
                >
                  Continue to pay
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setLiked(!liked)}
          className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition-all duration-200 hover:scale-110 active:scale-95 ${
            liked
              ? "bg-red-500 text-white"
              : "bg-white/90 text-gray-400 hover:text-red-400"
          }`}
        >
          <Heart size={13} fill={liked ? "currentColor" : "none"} />
        </button>
      </div>
    </Reveal>
  );
}

function ApartmentsContent() {
  const searchParams = useSearchParams();

  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [citySearch, setCitySearch] = useState(searchParams.get("city") || "");

  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);

  const [filters, setFilters] = useState<Filters>({
    city: searchParams.get("city") || "",
    type: searchParams.get("type") || "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    isVerified: false,
  });

  const locationRequest = useRef<AbortController | null>(null);

  // AI search state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [aiMode, setAiMode] = useState(false);
  const [listingPurpose, setListingPurpose] = useState<"RENT" | "BUY">("RENT");

  const fetchProperties = async (f = filters, p = page) => {
    setLoading(true);

    const params = new URLSearchParams();

    if (f.city) params.set("city", f.city);
    if (f.type) params.set("type", f.type);
    if (f.minPrice) params.set("minPrice", f.minPrice);
    if (f.maxPrice) params.set("maxPrice", f.maxPrice);
    if (f.bedrooms) params.set("bedrooms", f.bedrooms);
    if (f.isVerified) params.set("isVerified", "true");
    params.set("listingPurpose", listingPurpose);

    params.set("page", String(p));
    params.set("limit", "9");

    try {
      const res = await fetch(`/api/properties?${params}`);

      const data = await res.json();

      setProperties(data.properties || []);
      setTotal(data.total || 0);
    } catch {}

    setLoading(false);
  };

  useEffect(() => {
    fetchProperties();
  }, [listingPurpose]);

  const handleCitySearch = async (val: string) => {
    setCitySearch(val);

    setFilters((p) => ({
      ...p,
      city: val,
    }));

    locationRequest.current?.abort();

    if (!val.trim()) {
      return setCitySuggestions([]);
    }

    const controller = new AbortController();

    locationRequest.current = controller;

    try {
      const res = await fetch(`/api/locations?q=${encodeURIComponent(val)}`, {
        signal: controller.signal,
      });

      const data = await res.json();

      if (!controller.signal.aborted) {
        setCitySuggestions(data.locations || []);
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        setCitySuggestions(
          CITIES.filter((c) =>
            c.toLowerCase().includes(val.toLowerCase()),
          ).slice(0, 8),
        );
      }
    }
  };

  const applyFilters = (newFilters = filters) => {
    setPage(1);
    fetchProperties(newFilters, 1);
    setShowFilters(false);
  };

  const clearFilters = () => {
    const f: Filters = {
      city: "",
      type: "",
      minPrice: "",
      maxPrice: "",
      bedrooms: "",
      isVerified: false,
    };

    setFilters(f);
    setCitySearch("");
    setCitySuggestions([]);

    applyFilters(f);
  };

  const selectCity = (city: string) => {
    setCitySearch(city);

    setFilters((p) => ({
      ...p,
      city: city.split(",")[0].trim(),
    }));

    setCitySuggestions([]);
  };

  const searchWithAI = async () => {
    if (!aiPrompt.trim() || aiLoading) {
      return;
    }

    setAiLoading(true);
    setAiSuggestion("");

    try {
      const response = await fetch("/api/ai-property", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: aiPrompt.trim(),
          listingPurpose,
          visitorId: getAiVisitorId(),
        }),
      });

      const data = await response.json();

      setProperties(data.properties || []);
      setTotal(data.total || 0);
      setPage(1);
      setAiSuggestion(data.suggestion || "");
    } catch (error) {
      console.error("AI property search error:", error);

      setAiSuggestion("Sorry, I could not process your AI search right now.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f6f1]">
      <Navbar />

      <div className="relative overflow-hidden bg-[#0e0d0b] pb-14 pt-32 sm:pb-16 sm:pt-36">
        <img
          src="https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=2200&q=85"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-[#0e0d0b]/50 via-[#0e0d0b]/75 to-[#0e0d0b]" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <Reveal>
            <p className="lux-eyebrow mb-3">Explore the collection</p>
          </Reveal>

          <Reveal delay={70}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="font-display text-4xl font-light text-white sm:text-5xl">
                {listingPurpose === "BUY"
                  ? "Buy a Property"
                  : "Browse Apartments"}
              </h1>
              <div className="inline-flex rounded-xl border border-white/20 bg-black/20 p-1">
                <button
                  onClick={() => setListingPurpose("RENT")}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold ${listingPurpose === "RENT" ? "bg-white text-[#211e19]" : "text-white/75"}`}
                >
                  Rent
                </button>
                <button
                  onClick={() => setListingPurpose("BUY")}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold ${listingPurpose === "BUY" ? "bg-[#b98a43] text-white" : "text-white/75"}`}
                >
                  Buy a Property
                </button>
              </div>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <p className="mt-2 text-white/60">
              Find your perfect verified home from our global listings
            </p>
          </Reveal>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* EXISTING FILTERS — UNCHANGED */}
          <div className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-24 rounded-[22px] bg-[#171511] p-6 shadow-[0_20px_50px_rgba(23,21,17,.18)]">
              <FilterPanel
                citySearch={citySearch}
                citySuggestions={citySuggestions}
                filters={filters}
                onCityChange={handleCitySearch}
                onSelectCity={selectCity}
                onChangeFilters={setFilters}
                onClear={clearFilters}
                onApply={() => applyFilters()}
                aiMode={aiMode}
                onToggleAi={() => setAiMode((value) => !value)}
                aiPrompt={aiPrompt}
                onAiPromptChange={setAiPrompt}
                onAiSearch={searchWithAI}
                aiLoading={aiLoading}
                aiSuggestion={aiSuggestion}
                listingPurpose={listingPurpose}
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-6 hidden overflow-hidden rounded-[22px] border border-[#b98a43]/30 bg-white shadow-[0_10px_30px_rgba(24,21,17,.07)]">
              <div className="border-b border-white/10 bg-[#211e19] px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#b98a43]/15">
                    <Sparkles size={17} className="text-[#e8d5b1]" />
                  </div>

                  <div>
                    <h2 className="font-display text-lg font-semibold text-white">
                      Search with AI
                    </h2>

                    <p className="text-xs text-white/55">
                      Describe what you&apos;re looking for in your own words
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Search
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a47737]"
                    />

                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          searchWithAI();
                        }
                      }}
                      placeholder="e.g. modern 2 bedroom villa in Gurugram under $150 with pool and parking"
                      className="h-12 w-full rounded-xl border border-[#e0d9cd] bg-[#faf9f6] pl-11 pr-4 text-sm text-[#211e19] outline-none transition focus:border-[#b98a43]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={searchWithAI}
                    disabled={!aiPrompt.trim() || aiLoading}
                    className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#b98a43] px-6 text-sm font-semibold text-white transition hover:bg-[#9f7435] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 size={17} className="animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Sparkles size={17} />
                        Find with AI
                      </>
                    )}
                  </button>
                </div>

                {aiSuggestion && (
                  <div className="mt-4 rounded-xl bg-[#f8f3ea] px-4 py-3 text-sm leading-6 text-[#575149]">
                    <span className="font-semibold text-[#a47737]">
                      StayNest AI:
                    </span>{" "}
                    {aiSuggestion}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-5 flex items-center justify-between">
              <p className="font-medium text-[#575149]">
                {loading ? "Loading..." : `${total} properties found`}
              </p>

              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 rounded-xl border border-[#e0d9cd] bg-white px-4 py-2 text-sm font-medium text-[#3c3934] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md lg:hidden"
              >
                <SlidersHorizontal size={16} />
                Filters
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 size={36} className="animate-spin text-[#b98a43]" />
              </div>
            ) : properties.length === 0 ? (
              <div className="rounded-[26px] border border-[#e0d9cd] bg-white py-24 text-center shadow-[0_10px_30px_rgba(24,21,17,.06)]">
                {/* <div className="mb-4 text-6xl">
                  🏠
                </div> */}

                <h3 className="mb-2 font-display text-xl font-semibold text-[#211e19]">
                  No properties found
                </h3>

                <p className="mb-5 text-[#756f66]">
                  Try adjusting your filters or search a different city.
                </p>

                <button
                  onClick={clearFilters}
                  className="lux-gold-button-light inline-flex rounded-full bg-[#211e19] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all hover:-translate-y-0.5 hover:bg-[#b98a43]"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {properties.map((p, i) => (
                  <PropertyCard key={p._id} p={p} index={i} />
                ))}
              </div>
            )}

            {total > 9 && !loading && (
              <div className="mt-10 flex justify-center gap-2">
                {[...Array(Math.ceil(total / 9))].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setPage(i + 1);
                      fetchProperties(filters, i + 1);
                    }}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-medium transition-all ${
                      page === i + 1
                        ? "bg-[#211e19] text-white"
                        : "border border-[#e0d9cd] bg-white text-[#575149] hover:border-[#b98a43]/40 hover:text-[#211e19]"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />

          <div className="absolute bottom-0 right-0 top-0 w-80 overflow-y-auto bg-[#171511] shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-white/10 bg-[#171511] p-5">
              <h2 className="font-display text-lg font-semibold text-white">
                Filters
              </h2>

              <button
                onClick={() => setShowFilters(false)}
                className="rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5">
              <FilterPanel
                citySearch={citySearch}
                citySuggestions={citySuggestions}
                filters={filters}
                onCityChange={handleCitySearch}
                onSelectCity={selectCity}
                onChangeFilters={setFilters}
                onClear={clearFilters}
                onApply={() => applyFilters()}
                aiMode={aiMode}
                onToggleAi={() => setAiMode((value) => !value)}
                aiPrompt={aiPrompt}
                onAiPromptChange={setAiPrompt}
                onAiSearch={searchWithAI}
                aiLoading={aiLoading}
                aiSuggestion={aiSuggestion}
                listingPurpose={listingPurpose}
              />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function ApartmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0e0d0b]">
          <Loader2 size={36} className="animate-spin text-[#b98a43]" />
        </div>
      }
    >
      <ApartmentsContent />
    </Suspense>
  );
}
