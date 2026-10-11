"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Bot, Loader2, MessageSquare, Send, User, X } from "lucide-react";
import { getAiVisitorId } from "@/lib/ai-visitor";

type Message = { role: "user" | "assistant"; content: string };

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content:
    "Hi! I’m StayNest AI. Hindi, English ya Hinglish mein poochhiye — I can help you find a home or explain any StayNest feature.",
};

function renderMessageContent(content: string): ReactNode[] {
  const tokenPattern =
    /(!?)\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<]+)/g;
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(content)) !== null) {
    if (match.index > cursor) nodes.push(content.slice(cursor, match.index));

    const isImage = match[1] === "!";
    const label = match[2] || match[4];
    const href = match[3] || match[4];

    if (isImage) {
      nodes.push(
        <a
          key={`${match.index}-image`}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-3 block max-w-full"
          title="Open image in a new tab"
        >
          <img
            src={href}
            alt={label || "Image shared by StayNest AI"}
            className="max-h-52 max-w-full rounded-xl border border-white/10 object-cover"
          />
          <span className="mt-1 block text-xs font-medium text-[#edcc8a] underline">
            Open image
          </span>
        </a>,
      );
    } else {
      nodes.push(
        <a
          key={`${match.index}-link`}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-[#edcc8a] underline decoration-[#edcc8a]/50 underline-offset-2 transition hover:text-white"
          title={href}
        >
          {label}
        </a>,
      );
    }

    cursor = tokenPattern.lastIndex;
  }

  if (cursor < content.length) nodes.push(content.slice(cursor));
  return nodes;
}

export default function StayNestChatWidget() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const loadedConversation = useRef(false);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, loading]);

  useEffect(() => {
    const openChat = () => setOpen(true);
    window.addEventListener("staynest:open-chat", openChat);
    return () => window.removeEventListener("staynest:open-chat", openChat);
  }, []);

  useEffect(() => {
    if (!open || loadedConversation.current) return;

    let active = true;
    const loadConversation = async () => {
      try {
        const response = await fetch(
          `/api/ai-chat?visitorId=${encodeURIComponent(getAiVisitorId())}`,
        );
        const data = await response.json();
        if (active && Array.isArray(data?.messages) && data.messages.length) {
          setMessages(
            data.messages
              .map((message: any) => ({
                role: message.role === "user" ? "user" : "assistant",
                content: String(message.content || ""),
              }))
              .filter((message: Message) => message.content),
          );
        }
      } catch {
        // A new conversation can still start when a previous one cannot be loaded.
      } finally {
        loadedConversation.current = true;
      }
    };
    loadConversation();
    return () => {
      active = false;
    };
  }, [open]);

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || loading) return;

    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          context: {
            pathname,
            role: (session?.user as any)?.role || "GUEST",
          },
          visitorId: getAiVisitorId(),
        }),
      });
      const data = await response.json();
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            typeof data?.reply === "string"
              ? data.reply
              : "I could not reply right now. Please try again.",
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "Sorry, I am having trouble responding right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // This intentionally clears only this browser's visible chat window.
  // AiConversation remains unchanged for user history and admin review.
  const clearVisibleChat = () => {
    if (loading) return;
    setMessages([WELCOME_MESSAGE]);
    setInput("");
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] sm:bottom-6 sm:right-6">
      {open ? (
        <section className="flex h-[min(560px,calc(100vh-2rem))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[24px] border border-[#40382d] bg-[#171511] shadow-[0_24px_70px_rgba(0,0,0,.42)] sm:w-[390px]">
          <header className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-[#211e19] to-[#302719] px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c99338] text-white shadow-lg">
                <Bot size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">StayNest AI</p>
                <p className="flex items-center gap-1.5 text-xs text-[#e7c98f]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Ready to help
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={clearVisibleChat}
                disabled={loading}
                className="rounded-lg px-2 py-1.5 text-xs font-semibold text-[#edcc8a] transition hover:bg-white/10 hover:text-white disabled:opacity-40"
              >
                Clear chat
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                aria-label="Close AI chat"
              >
                <X size={18} />
              </button>
            </div>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex items-start gap-2.5 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${message.role === "user" ? "bg-white/15 text-white" : "bg-[#c99338]/20 text-[#edcc8a]"}`}
                >
                  {message.role === "user" ? (
                    <User size={14} />
                  ) : (
                    <Bot size={14} />
                  )}
                </div>
                <div
                  className={`max-w-[78%] whitespace-pre-wrap break-words [overflow-wrap:anywhere] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${message.role === "user" ? "rounded-tr-md bg-[#c99338] text-white" : "rounded-tl-md border border-white/10 bg-white/[.08] text-[#fffaf0]"}`}
                >
                  {renderMessageContent(message.content)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#c99338]/20 text-[#edcc8a]">
                  <Bot size={14} />
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[.08] px-3.5 py-2.5">
                  <Loader2 size={16} className="animate-spin text-[#edcc8a]" />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form
            className="border-t border-white/10 p-3"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/[.06] p-1.5 focus-within:border-[#c99338]/70">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                rows={1}
                maxLength={1500}
                placeholder="Ask about StayNest…"
                className="max-h-24 min-h-[42px] flex-1 resize-none bg-transparent px-2 py-2.5 text-sm text-white outline-none placeholder:text-white/40"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#c99338] text-white transition hover:bg-[#dda947] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="px-2 pt-2 text-[10px] text-white/40">
              AI can guide you, but it cannot change your account or make
              decisions for you.
            </p>
          </form>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full bg-[#c99338] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,0,0,.28)] transition hover:-translate-y-0.5 hover:bg-[#dda947]"
          aria-label="Open StayNest AI chat"
        >
          <MessageSquare size={18} />
          Chat with AI
        </button>
      )}
    </div>
  );
}
