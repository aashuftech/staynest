import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type AiActor = {
  userId?: string;
  visitorId?: string;
  role: "GUEST" | "USER" | "ADMIN";
};

export async function resolveAiActor(rawVisitorId: unknown): Promise<AiActor> {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (user?.id) {
    return {
      userId: String(user.id),
      role: user.role === "ADMIN" ? "ADMIN" : "USER",
    };
  }

  const visitorId = typeof rawVisitorId === "string" ? rawVisitorId.trim() : "";
  // Limit the accepted anonymous id to harmless UUID-like/local ids.
  if (/^[a-zA-Z0-9_-]{12,100}$/.test(visitorId)) {
    return { visitorId, role: "GUEST" };
  }

  return { role: "GUEST" };
}
