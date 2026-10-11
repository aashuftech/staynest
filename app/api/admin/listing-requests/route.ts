import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { ListingRequest } from "@/lib/models/Property";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const requests = await ListingRequest.find({ listingStatus: "PENDING" })
      .populate("ownerId", "name email image")
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ requests });
  } catch {
    return NextResponse.json(
      { error: "Unable to load listing requests." },
      { status: 500 },
    );
  }
}
