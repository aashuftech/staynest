import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/lib/models/Property";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const properties = await Property.find({
      ownerId: { $exists: true },
      $or: [
        { listingStatus: "APPROVED" },
        { listingStatus: { $exists: false } },
      ],
    })
      .populate("ownerId", "name email image role createdAt")
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ properties });
  } catch {
    return NextResponse.json(
      { error: "Unable to load user listings." },
      { status: 500 },
    );
  }
}
