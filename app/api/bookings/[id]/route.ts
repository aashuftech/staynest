import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Booking } from "@/lib/models/Booking";
import { Property } from "@/lib/models/Property";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const booking = await Booking.findById(params.id)
      .populate("propertyId")
      .lean();
    if (!booking)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      booking: {
        ...booking,
        property: booking.propertyId,
        id: booking._id?.toString(),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const body = await req.json();
    const booking = await Booking.findByIdAndUpdate(params.id, body, {
      new: true,
    }).populate("propertyId");
    return NextResponse.json({
      booking: {
        ...booking?.toObject(),
        property: booking?.propertyId,
        id: booking?._id?.toString(),
      },
    });
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
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const booking = await Booking.findById(params.id);
    if (!booking)
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    const isAdmin = (session.user as any).role === "ADMIN";
    if (!isAdmin && booking.userId !== (session.user as any).id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    if (new URL(req.url).searchParams.get("mode") === "delete") {
      if (booking.status !== "CANCELLED")
        return NextResponse.json(
          { error: "Only cancelled bookings can be deleted." },
          { status: 400 },
        );
      await Booking.findByIdAndDelete(params.id);
      return NextResponse.json({ success: true });
    }
    if (booking.status === "CANCELLED" || booking.status === "COMPLETED")
      return NextResponse.json(
        { error: "This booking cannot be cancelled" },
        { status: 400 },
      );
    booking.status = "CANCELLED";
    await booking.save();
    if (booking.bookingType === "PURCHASE_RESERVATION") {
      await Property.findByIdAndUpdate(booking.propertyId, {
        saleStatus: "AVAILABLE",
        isAvailable: true,
        $unset: { reservationDeadline: "" },
      });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
