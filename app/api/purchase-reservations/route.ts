import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/lib/models/Property";
import { Booking } from "@/lib/models/Booking";

const RESERVATION_DAYS = 7;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Please sign in to book this property." },
        { status: 401 },
      );
    }

    await connectDB();
    const { propertyId } = await req.json();
    const property = await Property.findOne({
      _id: propertyId,
      listingPurpose: "BUY",
      saleStatus: "AVAILABLE",
    });
    if (!property) {
      return NextResponse.json(
        { error: "This property is no longer available." },
        { status: 409 },
      );
    }

    const deadline = new Date(
      Date.now() + RESERVATION_DAYS * 24 * 60 * 60 * 1000,
    );
    const booking = await Booking.create({
      userId: (session.user as any).id,
      propertyId,
      checkIn: new Date(),
      checkOut: deadline,
      totalAmount: property.bookingPrice,
      serviceTax: 0,
      cleaningFee: 0,
      bookingType: "PURCHASE_RESERVATION",
      reservationDeadline: deadline,
    });

    return NextResponse.json(
      {
        bookingId: booking._id.toString(),
        bookingPrice: property.bookingPrice,
        reservationDeadline: deadline,
        days: RESERVATION_DAYS,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to create a purchase reservation." },
      { status: 500 },
    );
  }
}
