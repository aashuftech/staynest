"use client";

const VISITOR_STORAGE_KEY = "staynest_ai_visitor_id";

/** Anonymous browser id for guest AI activity. Logged-in activity always uses the server session instead. */
export function getAiVisitorId() {
  if (typeof window === "undefined") return "";

  const saved = window.localStorage.getItem(VISITOR_STORAGE_KEY);
  if (saved) return saved;

  const id =
    typeof crypto?.randomUUID === "function"
      ? crypto.randomUUID()
      : `visitor_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  window.localStorage.setItem(VISITOR_STORAGE_KEY, id);
  return id;
}
