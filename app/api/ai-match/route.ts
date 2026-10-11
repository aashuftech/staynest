import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/lib/models/Property";
import { AiActivity } from "@/lib/models/AiActivity";
import { groqChat } from "@/lib/groq";
import { resolveAiActor } from "@/lib/ai-activity";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      city,
      propertyType,
      minBudget,
      maxBudget,
      bedrooms,
      preferences,
      listingPurpose,
    } = body;
    const actor = await resolveAiActor(body?.visitorId);
    const purpose = listingPurpose === "BUY" ? "BUY" : "RENT";
    const searchInput = `City: ${city || "Any"}; Type: ${propertyType || "Any"}; Budget: ${minBudget || "Any"}-${maxBudget || "Any"}; Bedrooms: ${bedrooms || "Any"}; Preferences: ${preferences || "None"}`;

    /*
     * MongoDB is the source of truth.
     * Gemini/Gemma is NEVER used to create properties.
     */
    const query: any = {
      isAvailable: { $ne: false },
    };

    if (purpose === "BUY") {
      query.listingPurpose = "BUY";
      query.saleStatus = { $ne: "SOLD" };
    } else {
      query.$and = [
        {
          $or: [
            { listingPurpose: "RENT" },
            { listingPurpose: { $exists: false } },
          ],
        },
      ];
    }

    if (city) {
      query.$or = [
        {
          city: {
            $regex: city,
            $options: "i",
          },
        },
        {
          neighborhood: {
            $regex: city,
            $options: "i",
          },
        },
      ];
    }

    if (propertyType) {
      query.type = propertyType.toUpperCase();
    }

    const budgetLimit = maxBudget || minBudget;

    if (budgetLimit) {
      query[purpose === "BUY" ? "finalPrice" : "pricePerMonth"] = {
        $lte: parseFloat(budgetLimit),
      };
    }

    if (bedrooms && parseInt(bedrooms) >= 0) {
      query.bedrooms = parseInt(bedrooms);
    }

    /*
     * ACTUAL properties only.
     */
    const properties = await Property.find(query)
      .sort({
        isVerified: -1,
        rating: -1,
      })
      .limit(9)
      .lean();

    /*
     * No property = no AI-generated property.
     */
    if (properties.length === 0) {
      const suggestion = `I couldn't find an available property matching your requirements${
        city ? ` in ${city}` : ""
      }. Try widening your budget, changing the location, or relaxing another preference.`;
      try {
        await AiActivity.create({
          userId: actor.userId,
          visitorId: actor.visitorId,
          role: actor.role,
          kind: "PROPERTY_SEARCH",
          input: searchInput,
          output: suggestion,
          listingPurpose: purpose,
          matchedPropertyIds: [],
        });
      } catch (saveError) {
        console.error("Unable to save AI match activity:", saveError);
      }
      return NextResponse.json({
        properties: [],
        suggestion,
        total: 0,
      });
    }

    const top = properties[0] as any;

    let suggestion =
      `We found ${properties.length} matching propert${
        properties.length === 1 ? "y" : "ies"
      }${city ? ` in ${city}` : ""}. ` +
      `Our top match is "${top.title}" at $${purpose === "BUY" ? top.finalPrice : top.pricePerMonth}${purpose === "BUY" ? " final price." : "/month."}`;

    /*
     * Send ONLY real MongoDB properties to Gemma.
     */
    try {
      const propertyContext = properties.map((property: any) => ({
        id: String(property._id),
        title: property.title,
        description: property.description,
        type: property.type,
        city: property.city,
        neighborhood: property.neighborhood,
        address: property.address,
        pricePerMonth: property.pricePerMonth,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        maxGuests: property.maxGuests,
        amenities: property.amenities,
        rating: property.rating,
        isVerified: property.isVerified,
      }));

      const aiReply = await groqChat(
        [
          {
            role: "system",
            content: `
You are StayNest's property recommendation assistant.

MongoDB is the ONLY source of truth.

The properties provided by the user are real StayNest listings.

You may ONLY recommend properties from that list.

NEVER create a property.

NEVER invent a property.

NEVER invent a price, address, amenity, rating, bedroom count,
bathroom count, availability, or verification status.

Write a short, natural recommendation of 2-3 sentences.

Mention the real property title when recommending it.

If several properties match, explain which one looks like the strongest match.
            `.trim(),
          },
          {
            role: "user",
            content: `
User requirements:

Property type: ${propertyType || "Any"}
City: ${city || "Any"}
Minimum budget: ${minBudget || "Not specified"}
Maximum budget: ${maxBudget || "Not specified"}
Bedrooms: ${bedrooms || "Any"}
Preferences: ${preferences || "None"}

REAL DATABASE PROPERTIES:

${JSON.stringify(propertyContext, null, 2)}
            `.trim(),
          },
        ],
        {
          temperature: 0.45,
          maxTokens: 220,
        },
      );

      if (aiReply.trim()) {
        suggestion = aiReply.trim();
      }
    } catch (error) {
      console.error("Groq recommendation error:", error);
    }

    try {
      await AiActivity.create({
        userId: actor.userId,
        visitorId: actor.visitorId,
        role: actor.role,
        kind: "PROPERTY_SEARCH",
        input: searchInput,
        output: suggestion,
        listingPurpose: purpose,
        matchedPropertyIds: properties.map((property: any) => property._id),
      });
    } catch (saveError) {
      console.error("Unable to save AI match activity:", saveError);
    }

    return NextResponse.json({
      properties,
      suggestion,
      total: properties.length,
    });
  } catch (error) {
    console.error("AI match error:", error);

    return NextResponse.json(
      {
        properties: [],
        suggestion:
          "I could not complete the property search right now. Please try again.",
        total: 0,
      },
      { status: 500 },
    );
  }
}
