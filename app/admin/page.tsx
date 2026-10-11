"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Reveal from "@/components/Reveal";
import Link from "next/link";
import {
  Building2,
  Users,
  BookOpen,
  Brain,
  ChevronRight,
  Activity,
  Loader2,
  Plus,
  ClipboardList,
  Search,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type AiInsights = {
  daily: { date: string; searches: number; matchedSearches: number }[];
  overview: {
    searches: number;
    searchesWithMatches: number;
    matchRate: number;
    activeConversations: number;
  };
  latestSync: { synchronizedAt: string } | null;
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalProperties: 0,
    newUsers: 0,
    matchesToday: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState<AiInsights | null>(null);

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
    Promise.all([fetch("/api/admin/stats"), fetch("/api/admin/ai-insights")])
      .then(async ([statsResponse, insightsResponse]) => {
        const statsData = await statsResponse.json();
        const insightsData = await insightsResponse.json();
        if (statsResponse.ok) setStats(statsData);
        if (insightsResponse.ok) setAiInsights(insightsData);
      })
      .finally(() => setLoading(false));
  }, [status]);

  const sidebarLinks = [
    { icon: Building2, label: "Dashboard", href: "/admin", active: true },
    { icon: Building2, label: "Properties", href: "/admin/properties" },
    {
      icon: ClipboardList,
      label: "Property Requests",
      href: "/admin/property-requests",
    },
    { icon: Users, label: "Users", href: "/admin/users" },
    { icon: BookOpen, label: "Bookings", href: "/admin/bookings" },
    { icon: Brain, label: "AI Activity", href: "/admin/ai" },
  ];

  if (status === "loading")
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f6f1]">
        <Loader2 size={36} className="animate-spin text-[#b98a43]" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f8f6f1]">
      <Navbar />
      <section className="relative overflow-hidden bg-[#0e0d0b] px-4 pb-10 pt-28 sm:px-6 sm:pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(185,138,67,.3),transparent_45%)]" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#d9ab59]">
            Administration
          </p>
          <h1 className="mt-3 font-display text-4xl font-light text-white sm:text-5xl">
            StayNest Control Centre
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#d2c8b8]">
            A clear overview of properties, users, bookings, and AI operations.
          </p>
        </div>
      </section>
      <div>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <aside className="hidden w-56 shrink-0 flex-col gap-1.5 lg:flex">
              {sidebarLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${(link as any).active ? "bg-[#211e19] text-white shadow-md" : "bg-white text-[#575149] shadow-sm hover:bg-[#f1ede5] hover:text-[#211e19]"}`}
                >
                  <link.icon size={20} />
                  <span className="text-xs font-medium">{link.label}</span>
                </Link>
              ))}
            </aside>
            <main className="flex-1 space-y-6">
              <Reveal>
                <div className="flex items-center justify-between">
                  <h1 className="font-display text-3xl font-semibold text-[#211e19]">
                    StayNest Master Admin
                  </h1>
                  <Link
                    href="/admin/properties/add"
                    className="lux-gold-button px-5 py-2.5 text-xs"
                  >
                    <Plus size={16} />
                    Add Property
                  </Link>
                </div>
              </Reveal>
              <Reveal>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {[
                    {
                      label: "Total Properties",
                      value: loading
                        ? "..."
                        : stats.totalProperties.toLocaleString(),
                    },
                    {
                      label: "New Users (month)",
                      value: loading ? "..." : stats.newUsers.toLocaleString(),
                    },
                    {
                      label: "Matches Today",
                      value: loading
                        ? "..."
                        : stats.matchesToday.toLocaleString(),
                    },
                    {
                      label: "Revenue",
                      value: loading
                        ? "..."
                        : "$" + stats.revenue.toLocaleString(),
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-2xl border border-[#e0d9cd] bg-white p-5 shadow-[0_8px_24px_rgba(24,21,17,.05)]"
                    >
                      <div className="mb-1 text-sm text-[#9a9284]">
                        {s.label}
                      </div>
                      <div className="font-display text-2xl font-semibold text-[#211e19]">
                        {s.value}
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
              <Reveal>
                <div className="rounded-[24px] border border-[#e0d9cd] bg-white p-6 shadow-[0_10px_30px_rgba(24,21,17,.05)]">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-lg font-semibold text-[#211e19]">
                        AI Property Search Activity (30 days)
                      </h2>
                      <p className="mt-1 text-xs text-[#9a9284]">
                        Real searches stored by Search with AI.
                      </p>
                    </div>
                    <Link href="/admin/ai" aria-label="Open AI insights">
                      <ChevronRight size={18} className="text-[#c3bcae]" />
                    </Link>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={aiInsights?.daily || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1ede5" />
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
                          border: "none",
                          boxShadow: "0 4px 20px rgba(24,21,17,0.14)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="searches"
                        stroke="#b98a43"
                        strokeWidth={2.5}
                        dot={false}
                        name="Searches"
                      />
                      <Line
                        type="monotone"
                        dataKey="matchedSearches"
                        stroke="#211e19"
                        strokeWidth={2}
                        dot={false}
                        name="With results"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Reveal>
              <div className="grid gap-6 lg:grid-cols-2">
                <Reveal>
                  <div className="rounded-[24px] border border-[#e0d9cd] bg-white p-6 shadow-[0_10px_30px_rgba(24,21,17,.05)]">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="font-display text-lg font-semibold text-[#211e19]">
                        AI Knowledge Status
                      </h2>
                      <Link
                        href="/admin/ai"
                        className="text-xs font-semibold text-[#a47737]"
                      >
                        Open insights
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        {
                          icon: Search,
                          label: "Searches",
                          value: aiInsights?.overview.searches || 0,
                        },
                        {
                          icon: CheckCircle2,
                          label: "With results",
                          value: aiInsights?.overview.searchesWithMatches || 0,
                        },
                        {
                          icon: Activity,
                          label: "Result rate",
                          value: `${aiInsights?.overview.matchRate || 0}%`,
                        },
                        {
                          icon: MessageSquare,
                          label: "Conversations",
                          value: aiInsights?.overview.activeConversations || 0,
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="rounded-xl bg-[#f8f6f1] p-3"
                        >
                          <item.icon
                            size={15}
                            className="mb-2 text-[#b98a43]"
                          />
                          <p className="text-xs text-[#9a9284]">{item.label}</p>
                          <p className="mt-0.5 font-semibold text-[#211e19]">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
                <Reveal delay={90}>
                  <div className="space-y-4">
                    <div className="rounded-[24px] border border-[#e0d9cd] bg-white p-5 shadow-[0_10px_30px_rgba(24,21,17,.05)]">
                      <h3 className="font-display text-sm font-semibold text-[#211e19]">
                        Knowledge sync
                      </h3>
                      <p className="mt-2 text-sm text-[#756f66]">
                        {aiInsights?.latestSync?.synchronizedAt
                          ? `Last synced ${new Date(aiInsights.latestSync.synchronizedAt).toLocaleString()}`
                          : "No inventory snapshot has been synced yet."}
                      </p>
                      <Link
                        href="/admin/ai"
                        className="mt-4 inline-flex text-xs font-semibold text-[#a47737]"
                      >
                        Sync published listings →
                      </Link>
                    </div>
                  </div>
                </Reveal>
              </div>
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
