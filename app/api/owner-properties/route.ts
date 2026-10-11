import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { ListingRequest } from "@/lib/models/Property";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id)
      return NextResponse.json(
        { error: "Please sign in to list your property." },
        { status: 401 },
      );
    const body = await req.json();
    const listingPurpose = body.listingPurpose === "BUY" ? "BUY" : "RENT";
    const pricePerMonth = Number(body.pricePerMonth);
    const finalPrice = Number(body.finalPrice);
    const bookingPrice = Number(body.bookingPrice);
    const securityDeposit = Number(body.securityDeposit || 0);
    if (
      !body.title ||
      !body.description ||
      !body.city ||
      !body.address ||
      !body.contactNo?.trim()
    )
      return NextResponse.json(
        {
          error:
            "Please fill in all required property details, including your contact number.",
        },
        { status: 400 },
      );
    if (
      listingPurpose === "RENT" &&
      (!Number.isFinite(pricePerMonth) ||
        pricePerMonth <= 0 ||
        securityDeposit < 0)
    )
      return NextResponse.json(
        { error: "Enter a valid monthly rent and security deposit." },
        { status: 400 },
      );
    if (
      listingPurpose === "BUY" &&
      (!Number.isFinite(finalPrice) ||
        finalPrice <= 0 ||
        !Number.isFinite(bookingPrice) ||
        bookingPrice <= 0)
    )
      return NextResponse.json(
        { error: "Enter valid final and booking prices." },
        { status: 400 },
      );
    await connectDB();
    const request = await ListingRequest.create({
      title: body.title,
      description: body.description,
      type: body.type,
      city: body.city,
      neighborhood: body.neighborhood,
      address: body.address,
      latitude: body.latitude || undefined,
      longitude: body.longitude || undefined,
      bedrooms: Number(body.bedrooms) || 1,
      bathrooms: Number(body.bathrooms) || 1,
      area: body.area || undefined,
      maxGuests: listingPurpose === "RENT" ? Number(body.maxGuests) || 2 : 0,
      images: body.images || [],
      amenities: body.amenities || [],
      listingPurpose,
      pricePerMonth: listingPurpose === "RENT" ? pricePerMonth : undefined,
      securityDeposit: listingPurpose === "RENT" ? securityDeposit : undefined,
      finalPrice: listingPurpose === "BUY" ? finalPrice : undefined,
      bookingPrice: listingPurpose === "BUY" ? bookingPrice : undefined,
      listingStatus: "PENDING",
      ownerId: (session.user as any).id,
      ownerContact: body.contactNo.trim(),
    });
    return NextResponse.json({ request }, { status: 201 });
  } catch (error) {
    console.error("Owner property creation failed:", error);
    return NextResponse.json(
      { error: "Unable to save your listing." },
      { status: 500 },
    );
  }
}
