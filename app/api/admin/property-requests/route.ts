import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { PropertyRequest } from "@/lib/models/PropertyRequest";

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const requests = await PropertyRequest.find()
    .populate("ownerId", "name email image")
    .populate(
      "matchedProperties",
      "title description city neighborhood address type bedrooms bathrooms area amenities images listingPurpose pricePerMonth securityDeposit finalPrice bookingPrice isVerified",
    )
    .sort({ updatedAt: -1 })
    .lean();
  return NextResponse.json({ requests });
}
