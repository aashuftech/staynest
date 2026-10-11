import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { ListingRequest, Property } from "@/lib/models/Property";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { action, declineReason } = await req.json();
    if (action !== "APPROVE" && action !== "DECLINE")
      return NextResponse.json(
        { error: "Invalid request action." },
        { status: 400 },
      );
    await connectDB();
    const request = await ListingRequest.findOne({
      _id: params.id,
      listingStatus: "PENDING",
    });
    if (!request)
      return NextResponse.json(
        { error: "Listing request not found or already actioned." },
        { status: 404 },
      );
    if (action === "DECLINE") {
      if (typeof declineReason !== "string" || !declineReason.trim()) {
        return NextResponse.json(
          { error: "Please enter a reason for declining this listing." },
          { status: 400 },
        );
      }
      // `strict: false` also supports requests created before declineReason
      // was added to the schema, so the admin's message is never dropped.
      await ListingRequest.updateOne(
        { _id: request._id },
        {
          $set: {
            listingStatus: "DECLINED",
            declineReason: declineReason.trim(),
          },
        },
        { strict: false },
      );
      return NextResponse.json({ success: true });
    }
    const data = request.toObject();
    const { _id, createdAt, updatedAt, __v, listingStatus, ...propertyData } =
      data as any;
    const property = await Property.create({
      ...propertyData,
      listingStatus: "APPROVED",
      isAvailable: true,
      isVerified: true,
      saleStatus: "AVAILABLE",
    });
    await ListingRequest.findByIdAndDelete(request._id);
    return NextResponse.json({ property });
  } catch {
    return NextResponse.json(
      { error: "Unable to update listing request." },
      { status: 500 },
    );
  }
}
