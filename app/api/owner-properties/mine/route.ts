import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/lib/models/Property";
import { ListingRequest } from "@/lib/models/Property";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    // The authenticated owner needs their saved contact number to edit a listing.
    // It is never returned by public property endpoints.
    const [properties, requests] = await Promise.all([
      Property.find({
        ownerId: userId,
        $or: [
          { listingStatus: "APPROVED" },
          { listingStatus: { $exists: false } },
        ],
      }).lean(),
      ListingRequest.find({ ownerId: userId }).lean(),
    ]);
    const listings = [...properties, ...requests].sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return NextResponse.json({ properties: listings });
  } catch {
    return NextResponse.json(
      { error: "Unable to load your listings." },
      { status: 500 },
    );
  }
}
