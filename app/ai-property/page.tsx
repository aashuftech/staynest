"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, MapPin, Star, CheckCircle, Sparkles } from "lucide-react";
import { getAiVisitorId } from "@/lib/ai-visitor";

export default function AIPropertyPage() {
  const [prompt, setPrompt] = useState("");
  const [properties, setProperties] = useState<any[]>([]);
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(false);

  const searchWithAI = async () => {
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setProperties([]);
    setSuggestion("");

    try {
      const response = await fetch("/api/ai-property", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          visitorId: getAiVisitorId(),
        }),
      });

      const data = await response.json();

      setProperties(data.properties || []);
      setSuggestion(data.suggestion || "");
    } catch {
      setSuggestion("Sorry, I could not process your request right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pt-24">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600">
              <Sparkles size={22} className="text-white" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900">
            Find a Property with AI
          </h1>

          <p className="mt-3 text-gray-500">
            Tell us what you want in your own words. We&apos;ll search the
            actual StayNest listings.
          </p>

          <div className="mt-8 rounded-3xl bg-white p-5 shadow-card">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Gurgaon mein pool aur parking ke saath 2 bedroom villa $3,000 per month ke andar chahiye."
              className="min-h-32 w-full resize-none rounded-2xl border border-gray-200 p-4 text-sm outline-none focus:border-blue-500"
            />

            <button
              onClick={searchWithAI}
              disabled={!prompt.trim() || loading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Finding properties...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Find My Property
                </>
              )}
            </button>
          </div>
        </div>

        {suggestion && (
          <div className="mx-auto mt-8 max-w-4xl rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex gap-3">
              <Sparkles size={18} className="mt-0.5 shrink-0 text-blue-600" />

              <p className="text-sm leading-6 text-blue-800">{suggestion}</p>
            </div>
          </div>
        )}

        {properties.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-5 text-xl font-bold text-gray-900">
              Matching StayNest Properties
            </h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <Link key={property._id} href={`/apartments/${property._id}`}>
                  <article className="group overflow-hidden rounded-2xl bg-white shadow-card transition hover:-translate-y-1 hover:shadow-card-hover">
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={property.images?.[0]}
                        alt={property.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {property.isVerified && (
                        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-blue-600">
                          <CheckCircle size={11} />
                          Verified
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <h3 className="line-clamp-1 text-sm font-semibold text-gray-900">
                          {property.title}
                        </h3>

                        {property.rating > 0 && (
                          <div className="ml-2 flex shrink-0 items-center gap-0.5 text-xs font-bold text-yellow-500">
                            <Star size={11} fill="currentColor" />
                            {property.rating}
                          </div>
                        )}
                      </div>

                      <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                        <MapPin size={11} />
                        {property.city}
                      </div>

                      <div className="mt-3">
                        <span className="text-lg font-bold text-blue-600">
                          ${property.pricePerMonth?.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400">/month</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
