import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Booking } from "@/lib/models/Booking";
import { Property } from "@/lib/models/Property";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { bookingId, checkoutSessionId } = await req.json();
    await connectDB();
    const booking = await Booking.findById(bookingId);
    if (!booking)
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    const isAdmin = (session.user as any).role === "ADMIN";
    if (!isAdmin && booking.userId !== (session.user as any).id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    if (!checkoutSessionId || !process.env.STRIPE_SECRET_KEY)
      return NextResponse.json(
        { error: "Stripe payment verification is required." },
        { status: 400 },
      );

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16" as any,
    });
    const checkoutSession =
      await stripe.checkout.sessions.retrieve(checkoutSessionId);
    if (
      checkoutSession.payment_status !== "paid" ||
      checkoutSession.metadata?.bookingId !== bookingId
    ) {
      return NextResponse.json(
        { error: "Stripe could not verify this payment." },
        { status: 400 },
      );
    }
    booking.paymentStatus = "PAID";
    booking.status = "CONFIRMED";
    booking.paymentMethod = Array.isArray(checkoutSession.payment_method_types)
      ? checkoutSession.payment_method_types.join(", ")
      : "stripe";
    booking.stripePaymentId =
      checkoutSession.payment_intent?.toString() || checkoutSession.id;
    await booking.save();
    if (booking.bookingType === "PURCHASE_RESERVATION") {
      await Property.findByIdAndUpdate(booking.propertyId, {
        saleStatus: "SOLD",
        reservationDeadline: booking.reservationDeadline,
        isAvailable: false,
      });
    }
    await booking.populate("propertyId");
    return NextResponse.json({
      booking: {
        ...booking?.toObject(),
        property: booking?.propertyId,
        id: booking?._id?.toString(),
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
