import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Booking } from "@/lib/models/Booking";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const userId = (session.user as any).id;
    const isAdmin = (session.user as any).role === "ADMIN";
    // A checkout that was abandoned must not look like a real booking.
    const activeBooking = {
      $nor: [{ status: "PENDING", paymentStatus: "PENDING" }],
    };
    const query = isAdmin ? activeBooking : { userId, ...activeBooking };
    const bookings = await Booking.find(query)
      .populate("propertyId")
      .sort({ createdAt: -1 })
      .lean();
    const formatted = bookings.map((b) => ({
      ...b,
      property: b.propertyId,
      id: b._id?.toString(),
    }));
    return NextResponse.json({ bookings: formatted });
  } catch (err: any) {
    console.error("Create booking error:", err);
    return NextResponse.json(
      { error: err?.message || "Unable to create this booking." },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();
    const {
      propertyId,
      checkIn,
      checkOut,
      totalAmount,
      serviceTax,
      cleaningFee,
    } = await req.json();
    if (!propertyId || !checkIn || !checkOut || !totalAmount)
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (
      Number.isNaN(checkInDate.getTime()) ||
      Number.isNaN(checkOutDate.getTime()) ||
      checkOutDate <= checkInDate
    ) {
      return NextResponse.json(
        { error: "Please select a valid check-in and check-out date." },
        { status: 400 },
      );
    }
    const conflictingBooking = await Booking.exists({
      propertyId,
      status: "CONFIRMED",
      paymentStatus: "PAID",
      checkIn: { $lt: checkOutDate },
      checkOut: { $gt: checkInDate },
    });
    if (conflictingBooking) {
      return NextResponse.json(
        {
          error:
            "This property is already booked for some or all of the selected dates. Please choose different dates.",
        },
        { status: 409 },
      );
    }
    const booking = await Booking.create({
      userId: (session.user as any).id,
      propertyId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalAmount: parseFloat(totalAmount),
      serviceTax: parseFloat(serviceTax || 0),
      cleaningFee: parseFloat(cleaningFee || 0),
    });
    const populated = await booking.populate("propertyId");
    return NextResponse.json(
      {
        booking: {
          ...populated.toObject(),
          property: populated.propertyId,
          id: populated._id.toString(),
        },
      },
      { status: 201 },
    );
  } catch (err: any) {
    console.error("Create booking error:", err);
    return NextResponse.json(
      { error: err?.message || "Unable to create this booking." },
      { status: 500 },
    );
  }
}
