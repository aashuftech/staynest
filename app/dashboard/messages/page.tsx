"use client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DashboardHero from "../../../components/dashboard/DashboardHero";
import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  MessageSquare,
  CreditCard,
  User,
  Send,
  Bot,
  Loader2,
} from "lucide-react";

const QUICK = [
  "How do I cancel my booking?",
  "What payment methods are accepted?",
  "How does AI matching work?",
  "How to contact a landlord?",
  "What is the refund policy?",
];

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm your StayNest AI assistant. Ask me about bookings, properties, payments, or anything else. 😊",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);
  // Scroll only the chat panel. scrollIntoView() was also moving the full page to the top.
  useEffect(() => {
    const list = messageListRef.current;
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I'm having trouble. Please email staynest@staynest.com",
        },
      ]);
    }
    setLoading(false);
  };

  const sidebarLinks = [
    { icon: Sparkles, label: "My Matches", href: "/dashboard" },
    { icon: BookOpen, label: "Applications", href: "/dashboard/bookings" },
    {
      icon: MessageSquare,
      label: "Messages",
      href: "/dashboard/messages",
      active: true,
    },
    { icon: CreditCard, label: "Payments", href: "/dashboard/payments" },
    { icon: User, label: "Profile", href: "/dashboard/profile" },
  ];

  return (
    <div className="min-h-screen bg-[#f8f6f1]">
      <Navbar />
      <DashboardHero
        eyebrow="Messages"
        title="StayNest Assistant"
        description="Ask questions about your search, bookings, listings, or payments."
      />
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            <aside className="hidden lg:flex flex-col w-56 shrink-0 gap-1">
              {sidebarLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all ${(link as any).active ? "bg-[#211e19] text-white shadow-md" : "bg-white shadow-sm hover:bg-[#f1ede5] text-[#575149] hover:text-[#211e19]"}`}
                >
                  <link.icon size={20} />
                  <span className="text-xs font-medium">{link.label}</span>
                </Link>
              ))}
            </aside>
            <main className="flex-1">
              <div
                className="bg-white rounded-3xl shadow-card flex flex-col"
                style={{ height: "72vh" }}
              >
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Bot size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">
                      StayNest AI Assistant
                    </div>
                    <div className="flex items-center gap-1.5 text-green-500 text-xs font-medium">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      Always Online
                    </div>
                  </div>
                </div>
                <div
                  ref={messageListRef}
                  className="flex-1 overflow-y-auto p-5 space-y-4"
                >
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "assistant" ? "bg-blue-100" : "bg-blue-600"}`}
                      >
                        {msg.role === "assistant" ? (
                          <Bot size={15} className="text-blue-600" />
                        ) : (
                          <span className="text-white text-xs font-bold">
                            {session?.user?.name?.[0]?.toUpperCase() || "U"}
                          </span>
                        )}
                      </div>
                      <div
                        className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === "assistant" ? "bg-gray-50 text-gray-700 border border-gray-100" : "bg-blue-600 text-white"}`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bot size={15} className="text-blue-600" />
                      </div>
                      <div className="bg-gray-50 border border-gray-100 px-4 py-3 rounded-2xl">
                        <div className="flex gap-1.5">
                          {[0, 1, 2].map((i) => (
                            <div
                              key={i}
                              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                              style={{ animationDelay: `${i * 0.15}s` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {messages.length <= 2 && (
                  <div className="px-5 pb-3">
                    <p className="text-xs text-gray-400 mb-2">
                      Quick questions:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {QUICK.map((q) => (
                        <button
                          key={q}
                          onClick={() => sendMessage(q)}
                          className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="p-4 border-t border-gray-100">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      className="flex-1 input-field py-3"
                      placeholder="Type your message..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") sendMessage();
                      }}
                    />
                    <button
                      onClick={() => sendMessage()}
                      disabled={!input.trim() || loading}
                      className="w-12 h-12 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all shrink-0"
                    >
                      {loading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Send size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
