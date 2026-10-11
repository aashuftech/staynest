"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  BookOpen,
  Brain,
  Building2,
  CheckCircle2,
  ClipboardList,
  Database,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  Sparkles,
  Users,
} from "lucide-react";

type Insights = {
  daily: { date: string; searches: number; matchedSearches: number }[];
  overview: {
    searches: number;
    searchesWithMatches: number;
    matchRate: number;
    activeConversations: number;
  };
  knowledge: {
    propertyCount: number;
    rentPropertyCount: number;
    buyPropertyCount: number;
    verifiedPropertyCount: number;
  };
  latestSync: {
    synchronizedAt: string;
    propertyCount: number;
    rentPropertyCount: number;
    buyPropertyCount: number;
    verifiedPropertyCount: number;
  } | null;
  model: string;
};

const NAV = [
  { icon: Building2, label: "Dashboard", href: "/admin" },
  { icon: Building2, label: "Properties", href: "/admin/properties" },
  {
    icon: ClipboardList,
    label: "Property Requests",
    href: "/admin/property-requests",
  },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: BookOpen, label: "Bookings", href: "/admin/bookings" },
  { icon: Brain, label: "AI Activity", href: "/admin/ai", active: true },
];

function syncLabel(value: string | undefined) {
  return value ? new Date(value).toLocaleString() : "Not synced yet";
}

export default function AdminAIPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [notice, setNotice] = useState("");

  const loadInsights = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/ai-insights", {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Unable to load AI insights.");
      setInsights(data);
    } catch (error: any) {
      setNotice(error.message || "Unable to load AI insights.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated" && (session?.user as any)?.role !== "ADMIN")
      router.push("/dashboard");
  }, [status, session, router]);

  useEffect(() => {
    if (status === "authenticated") loadInsights();
  }, [status, loadInsights]);

  const syncKnowledge = async () => {
    setSyncing(true);
    setNotice("");
    try {
      const response = await fetch("/api/admin/ai-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SYNC_KNOWLEDGE" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Knowledge sync failed.");
      setNotice("Knowledge synced from current published StayNest listings.");
      await loadInsights();
    } catch (error: any) {
      setNotice(error.message || "Knowledge sync failed.");
    } finally {
      setSyncing(false);
    }
  };

  const overview = insights?.overview;
  const knowledge = insights?.knowledge;

  return (
    <div className="min-h-screen bg-[#f8f6f1]">
      <Navbar />
      <section className="relative overflow-hidden bg-[#0e0d0b] px-4 pb-10 pt-28 sm:px-6 sm:pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(185,138,67,.3),transparent_45%)]" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#d9ab59]">
            Intelligence centre
          </p>
          <h1 className="mt-3 font-display text-4xl font-light text-white sm:text-5xl">
            AI Insights &amp; Knowledge
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#d2c8b8]">
            Live analytics from saved AI searches and conversations, plus a
            controlled knowledge sync for published listings.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          <aside className="hidden w-56 shrink-0 flex-col gap-1 lg:flex">
            {NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${(link as any).active ? "bg-[#211e19] text-white shadow-md" : "bg-white text-[#575149] shadow-sm hover:bg-[#f1ede5] hover:text-[#211e19]"}`}
              >
                <link.icon size={20} />
                <span className="text-xs font-medium">{link.label}</span>
              </Link>
            ))}
          </aside>
          <main className="min-w-0 flex-1 space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#211e19]">
                  AI activity overview
                </h2>
                <p className="mt-1 text-sm text-[#8f8577]">
                  This page does not train Groq. It tracks real usage and syncs
                  current database knowledge.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={loadInsights}
                  disabled={loading || syncing}
                  title="Refresh insights"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#dfd6c8] bg-white text-[#8d6425] transition hover:bg-[#fffaf0] disabled:opacity-50"
                >
                  <RefreshCw
                    size={17}
                    className={loading ? "animate-spin" : ""}
                  />
                </button>
                <button
                  type="button"
                  onClick={syncKnowledge}
                  disabled={syncing}
                  className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm disabled:opacity-60"
                >
                  {syncing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Sync knowledge
                    </>
                  )}
                </button>
              </div>
            </div>
            {notice && (
              <div className="rounded-xl border border-[#dfc88f] bg-[#fff9e9] px-4 py-3 text-sm text-[#73531c]">
                {notice}
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  icon: Search,
                  label: "AI searches (30 days)",
                  value: overview?.searches ?? 0,
                },
                {
                  icon: CheckCircle2,
                  label: "Searches with results",
                  value: overview?.searchesWithMatches ?? 0,
                },
                {
                  icon: Activity,
                  label: "Match-result rate",
                  value: `${overview?.matchRate ?? 0}%`,
                },
                {
                  icon: MessageSquare,
                  label: "Active conversations",
                  value: overview?.activeConversations ?? 0,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-[#e0d9cd] bg-white p-5 shadow-[0_8px_24px_rgba(24,21,17,.05)]"
                >
                  <item.icon size={18} className="mb-3 text-[#b98025]" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#9a9284]">
                    {item.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-[#211e19]">
                    {loading ? "…" : item.value}
                  </p>
                </div>
              ))}
            </div>
            <section className="rounded-3xl border border-[#e0d9cd] bg-white p-6 shadow-[0_10px_30px_rgba(24,21,17,.05)]">
              <div className="mb-5">
                <h3 className="font-display text-lg font-semibold text-[#211e19]">
                  AI property searches — last 30 days
                </h3>
                <p className="mt-1 text-sm text-[#8f8577]">
                  Actual requests saved by Search with AI. A result counts when
                  the search returned at least one published listing.
                </p>
              </div>
              <div className="h-64">
                {loading ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="animate-spin text-[#b98025]" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={insights?.daily || []}>
                      <CartesianGrid vertical={false} stroke="#f1ede5" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: "#a89f90" }}
                        interval={4}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: "#a89f90" }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid #e0d9cd",
                        }}
                      />
                      <Bar
                        dataKey="searches"
                        name="Searches"
                        fill="#b98a43"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="matchedSearches"
                        name="With results"
                        fill="#211e19"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </section>
            <section className="grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
              <div className="rounded-3xl border border-[#e0d9cd] bg-white p-6 shadow-[0_10px_30px_rgba(24,21,17,.05)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff3d8] text-[#a56d1e]">
                    <Database size={20} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-[#211e19]">
                      Knowledge sync status
                    </h3>
                    <p className="text-sm text-[#8f8577]">
                      Last synced:{" "}
                      {syncLabel(insights?.latestSync?.synchronizedAt)}
                    </p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    {
                      label: "Published homes",
                      value: knowledge?.propertyCount ?? 0,
                    },
                    {
                      label: "Rent homes",
                      value: knowledge?.rentPropertyCount ?? 0,
                    },
                    {
                      label: "Buy homes",
                      value: knowledge?.buyPropertyCount ?? 0,
                    },
                    {
                      label: "Verified homes",
                      value: knowledge?.verifiedPropertyCount ?? 0,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl bg-[#f8f6f1] p-4"
                    >
                      <p className="text-xs text-[#8f8577]">{item.label}</p>
                      <p className="mt-1 text-xl font-bold text-[#211e19]">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-xs leading-5 text-[#8f8577]">
                  Sync records the latest published inventory for audit and
                  operations. AI Search still queries current published listings
                  live, so it never recommends an outdated property snapshot.
                </p>
              </div>
              <div className="rounded-3xl bg-[#211e19] p-6 text-white shadow-[0_10px_30px_rgba(24,21,17,.16)]">
                <Brain size={22} className="text-[#d9ab59]" />
                <h3 className="mt-4 font-display text-lg font-semibold">
                  Response model
                </h3>
                <p className="mt-2 break-words text-sm text-white/70">
                  Groq · {insights?.model || "Loading..."}
                </p>
                <p className="mt-5 text-sm leading-6 text-white/70">
                  The assistant uses the StayNest roadmap, current page context,
                  and live published-property data. It does not claim a fake
                  accuracy score or simulate model training.
                </p>
              </div>
            </section>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
