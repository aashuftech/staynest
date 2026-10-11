// import { NextRequest, NextResponse } from 'next/server'
// import { connectDB } from '@/lib/mongodb'
// import { Booking } from '@/lib/models/Booking'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'
// export async function POST(req: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions)
//     if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//     const { bookingId } = await req.json()
//     await connectDB()
//     const booking = await Booking.findById(bookingId).populate('propertyId')
//     if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
//     if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('your')) {
//       const Stripe = (await import('stripe')).default
//       const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' as any })
//       const intent = await stripe.paymentIntents.create({ amount: Math.round(booking.totalAmount * 100), currency: 'usd', metadata: { bookingId } })
//       return NextResponse.json({ clientSecret: intent.client_secret, paymentIntentId: intent.id })
//     }
//     return NextResponse.json({ clientSecret: 'demo_mode', paymentIntentId: 'demo_' + Date.now() })
//   } catch (err) { console.error(err); return NextResponse.json({ clientSecret: 'demo_mode', paymentIntentId: 'demo_' + Date.now() }) }
// }

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Booking } from "@/lib/models/Booking";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { bookingId } = await req.json();
    await connectDB();
    const booking = await Booking.findById(bookingId).populate("propertyId");
    if (!booking)
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    const isAdmin = (session.user as any).role === "ADMIN";
    if (!isAdmin && booking.userId !== (session.user as any).id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    if (booking.status === "CANCELLED")
      return NextResponse.json(
        { error: "This booking has been cancelled" },
        { status: 400 },
      );
    if (booking.paymentStatus === "PAID")
      return NextResponse.json(
        { error: "This booking is already paid" },
        { status: 400 },
      );
    if (
      !process.env.STRIPE_SECRET_KEY ||
      process.env.STRIPE_SECRET_KEY.includes("your")
    ) {
      return NextResponse.json(
        {
          error:
            "Stripe is not configured yet. Add STRIPE_SECRET_KEY to .env.local.",
        },
        { status: 503 },
      );
    }

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16" as any,
    });
    const origin = req.headers.get("origin") || req.nextUrl.origin;
    const sessionId = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: session.user.email || undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `StayNest booking: ${(booking.propertyId as any)?.title || "Apartment"}`,
            },
            unit_amount: Math.round(booking.totalAmount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: { bookingId: booking._id.toString(), userId: booking.userId },
      success_url: `${origin}/payment?bookingId=${booking._id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment?bookingId=${booking._id}&cancelled=1`,
    });
    if (!sessionId.url)
      return NextResponse.json(
        { error: "Unable to start Stripe Checkout." },
        { status: 500 },
      );
    return NextResponse.json({ checkoutUrl: sessionId.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Unable to start secure checkout." },
      { status: 500 },
    );
  }
}
