import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/lib/models/Property";
import { ListingRequest } from "@/lib/models/Property";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const isReregistration = body.reregister === true;
    const listingPurpose = body.listingPurpose === "BUY" ? "BUY" : "RENT";
    const contactNo = body.contactNo?.trim();
    if (
      !body.title ||
      !body.description ||
      !body.city ||
      !body.address ||
      !contactNo
    ) {
      return NextResponse.json(
        {
          error:
            "Please fill in all required property details, including your contact number.",
        },
        { status: 400 },
      );
    }

    const updates: any = {
      title: body.title,
      description: body.description,
      type: body.type,
      city: body.city,
      neighborhood: body.neighborhood,
      address: body.address,
      bedrooms: Number(body.bedrooms) || 1,
      bathrooms: Number(body.bathrooms) || 1,
      area: body.area || undefined,
      images: body.images || [],
      listingPurpose,
      ownerContact: contactNo,
      maxGuests: listingPurpose === "RENT" ? Number(body.maxGuests) || 2 : 0,
    };

    if (listingPurpose === "RENT") {
      const pricePerMonth = Number(body.pricePerMonth);
      const securityDeposit = Number(body.securityDeposit || 0);
      if (
        !Number.isFinite(pricePerMonth) ||
        pricePerMonth <= 0 ||
        securityDeposit < 0
      ) {
        return NextResponse.json(
          { error: "Enter a valid monthly rent and security deposit." },
          { status: 400 },
        );
      }
      Object.assign(updates, {
        pricePerMonth,
        securityDeposit,
        finalPrice: undefined,
        bookingPrice: undefined,
      });
    } else {
      const finalPrice = Number(body.finalPrice);
      const bookingPrice = Number(body.bookingPrice);
      if (
        !Number.isFinite(finalPrice) ||
        finalPrice <= 0 ||
        !Number.isFinite(bookingPrice) ||
        bookingPrice <= 0
      ) {
        return NextResponse.json(
          { error: "Enter valid final and booking prices." },
          { status: 400 },
        );
      }
      Object.assign(updates, {
        finalPrice,
        bookingPrice,
        pricePerMonth: undefined,
        securityDeposit: undefined,
      });
    }

    await connectDB();
    const property = await Property.findOneAndUpdate(
      { _id: params.id, ownerId: userId },
      updates,
      { new: true },
    );
    if (property) return NextResponse.json({ property });
    const requestStatus = isReregistration ? "DECLINED" : "PENDING";
    const request = await ListingRequest.findOneAndUpdate(
      { _id: params.id, ownerId: userId, listingStatus: requestStatus },
      {
        $set: {
          ...updates,
          ...(isReregistration ? { listingStatus: "PENDING" } : {}),
        },
        ...(isReregistration ? { $unset: { declineReason: 1 } } : {}),
      },
      { new: true },
    );
    if (!request)
      return NextResponse.json(
        { error: "Listing not found or can no longer be edited." },
        { status: 404 },
      );
    return NextResponse.json({ request });
  } catch {
    return NextResponse.json(
      { error: "Unable to update your listing." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const result = await ListingRequest.deleteOne({
      _id: params.id,
      ownerId: userId,
      listingStatus: "DECLINED",
    });
    if (result.deletedCount !== 1) {
      return NextResponse.json(
        { error: "Only your declined listing requests can be deleted." },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to delete this listing request." },
      { status: 500 },
    );
  }
}
