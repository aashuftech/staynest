import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";

/**
 * Uses the signed HTTP-only JWT directly, then checks MongoDB. This lets an
 * already-open browser discover an admin ban without waiting for a new login.
 */
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const userId = typeof token?.id === "string" ? token.id : "";

    if (!userId) {
      return NextResponse.json(
        { authenticated: false, banned: false },
        {
          headers: { "Cache-Control": "no-store, max-age=0" },
        },
      );
    }

    await connectDB();
    const user = await User.findById(userId).select("isBanned").lean();
    const banned = !user || user.isBanned === true;

    return NextResponse.json(
      { authenticated: !banned, banned },
      {
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    );
  } catch (error) {
    console.error("Account status check failed:", error);
    // Do not log a user out merely because the temporary status check failed.
    return NextResponse.json(
      { authenticated: true, banned: false },
      {
        headers: { "Cache-Control": "no-store, max-age=0" },
      },
    );
  }
}
