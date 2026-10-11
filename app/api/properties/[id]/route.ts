import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/lib/models/Property";
import { Booking } from "@/lib/models/Booking";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectDB();
    const [property, activeBookings] = await Promise.all([
      Property.findById(params.id).select("-ownerContact -ownerId").lean(),
      Booking.find({
        propertyId: params.id,
        status: "CONFIRMED",
        paymentStatus: "PAID",
      })
        .select("checkIn checkOut status")
        .sort({ checkIn: 1 })
        .lean(),
    ]);
    if (!property)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ...property, bookedRanges: activeBookings });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const body = await req.json();
    const property = await Property.findByIdAndUpdate(params.id, body, {
      new: true,
    });
    return NextResponse.json({ property });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    await Property.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
