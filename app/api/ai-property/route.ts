import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/lib/models/Property";
import { AiActivity } from "@/lib/models/AiActivity";
import { groqChat } from "@/lib/groq";
import { fallbackAiMessage } from "@/lib/staynest-ai";
import { resolveAiActor } from "@/lib/ai-activity";

type ListingPurpose = "RENT" | "BUY";

type SearchCriteria = {
  city: string | null;
  propertyType: string | null;
  minBudget: number | null;
  maxBudget: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  keywords: string[];
  clarification: string | null;
};

const PROPERTY_TYPES = [
  "FLAT",
  "HOUSE",
  "STUDIO",
  "CONDO",
  "TOWNHOUSE",
  "VILLA",
];

function extractJson(text: string) {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("Invalid AI search response.");
  return JSON.parse(cleaned.slice(start, end + 1));
}

function validNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function normaliseType(value: unknown) {
  if (typeof value !== "string") return null;
  const type = value.trim().toUpperCase();
  return PROPERTY_TYPES.includes(type) ? type : null;
}

function normaliseCriteria(value: any): SearchCriteria {
  return {
    city:
      typeof value?.city === "string" && value.city.trim()
        ? value.city.trim()
        : null,
    propertyType: normaliseType(value?.propertyType),
    minBudget: validNumber(value?.minBudget),
    maxBudget: validNumber(value?.maxBudget),
    bedrooms: validNumber(value?.bedrooms),
    bathrooms: validNumber(value?.bathrooms),
    keywords: Array.isArray(value?.keywords)
      ? value.keywords
          .filter((item: unknown) => typeof item === "string" && item.trim())
          .map((item: string) => item.trim().slice(0, 40))
          .slice(0, 5)
      : [],
    clarification:
      typeof value?.clarification === "string" && value.clarification.trim()
        ? value.clarification.trim()
        : null,
  };
}

function queryForCriteria(
  criteria: SearchCriteria,
  listingPurpose: ListingPurpose,
) {
  const query: any = {
    isAvailable: { $ne: false },
    listingStatus: { $in: ["APPROVED", null] },
  };

  if (listingPurpose === "BUY") {
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

  if (criteria.city) {
    query.$or = [
      { city: { $regex: criteria.city, $options: "i" } },
      { neighborhood: { $regex: criteria.city, $options: "i" } },
      { address: { $regex: criteria.city, $options: "i" } },
    ];
  }
  if (criteria.propertyType) query.type = criteria.propertyType;
  if (criteria.bedrooms !== null) query.bedrooms = { $gte: criteria.bedrooms };
  if (criteria.bathrooms !== null)
    query.bathrooms = { $gte: criteria.bathrooms };

  const budgetField = listingPurpose === "BUY" ? "finalPrice" : "pricePerMonth";
  if (criteria.minBudget !== null || criteria.maxBudget !== null) {
    query[budgetField] = {};
    if (criteria.minBudget !== null)
      query[budgetField].$gte = criteria.minBudget;
    if (criteria.maxBudget !== null)
      query[budgetField].$lte = criteria.maxBudget;
  }
  if (criteria.keywords.length) {
    const keywordQuery = criteria.keywords.map((keyword) => ({
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { amenities: { $regex: keyword, $options: "i" } },
      ],
    }));
    query.$and = [...(query.$and || []), ...keywordQuery];
  }
  return query;
}

function localSuggestion(
  prompt: string,
  count: number,
  purpose: ListingPurpose,
) {
  const hindi = /[\u0900-\u097f]/.test(prompt);
  const hinglish = /\b(mujhe|chahiye|wala|wali|ka|ki|aur|mein|hai)\b/i.test(
    prompt,
  );
  const type = purpose === "BUY" ? "buy" : "rent";
  if (hindi)
    return `${count} वास्तविक ${type} listings मिली हैं। परिणाम देखकर अपनी पसंद की property खोलें।`;
  if (hinglish)
    return `${count} real ${type} listings mili hain. Results dekhkar jo pasand aaye uski details open karein.`;
  return `I found ${count} real ${type} listing${count === 1 ? "" : "s"} matching your request.`;
}

export async function POST(req: NextRequest) {
  let prompt = "";
  try {
    const body = await req.json();
    prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    const listingPurpose: ListingPurpose =
      body?.listingPurpose === "BUY" ? "BUY" : "RENT";

    if (!prompt)
      return NextResponse.json({
        properties: [],
        total: 0,
        suggestion: "Please describe the home you are looking for.",
      });
    if (prompt.length > 1000)
      return NextResponse.json(
        { error: "Please keep your request under 1,000 characters." },
        { status: 400 },
      );

    const rawCriteria = await groqChat(
      [
        {
          role: "system",
          content: `Extract property-search filters from the user request. The selected StayNest tab is ${listingPurpose}; it is authoritative. ${listingPurpose === "RENT" ? "All budgets are monthly rent." : "All budgets are final purchase prices."}
Return ONLY valid JSON with exactly this shape:
{"city":null,"propertyType":null,"minBudget":null,"maxBudget":null,"bedrooms":null,"bathrooms":null,"keywords":[],"clarification":null}
Allowed propertyType values: FLAT, HOUSE, STUDIO, CONDO, TOWNHOUSE, VILLA. Do not infer a property type from generic words like home/property/place. Understand Hindi, English, and Hinglish. Extract only explicit facts; do not invent any value. Use clarification only for a short question in the user's language when no useful search detail was provided.`,
        },
        { role: "user", content: prompt },
      ],
      { temperature: 0, maxTokens: 350 },
    );

    const criteria = normaliseCriteria(extractJson(rawCriteria));
    await connectDB();
    const actor = await resolveAiActor(body?.visitorId);
    const properties = await Property.find(
      queryForCriteria(criteria, listingPurpose),
    )
      .select("-ownerContact -ownerId")
      .sort({ isVerified: -1, rating: -1, createdAt: -1 })
      .limit(12)
      .lean();

    if (!properties.length) {
      const noMatch = /[\u0900-\u097f]/.test(prompt)
        ? "कोई वास्तविक listing इस खोज से match नहीं हुई। Budget, location या preferences को थोड़ा broad करके फिर try करें।"
        : /\b(mujhe|chahiye|wala|wali|ka|ki|aur|mein|hai)\b/i.test(prompt)
          ? "Is search se koi real listing match nahi hui. Budget, location ya preferences ko thoda broad karke try karein."
          : "No real listing matches that search yet. Try a wider budget, location, or fewer preferences.";
      try {
        await AiActivity.create({
          userId: actor.userId,
          visitorId: actor.visitorId,
          role: actor.role,
          kind: "PROPERTY_SEARCH",
          input: prompt,
          output: noMatch,
          listingPurpose,
          criteria,
          matchedPropertyIds: [],
        });
      } catch (saveError) {
        console.error("Unable to save AI search activity:", saveError);
      }
      return NextResponse.json({
        properties: [],
        total: 0,
        suggestion: noMatch,
        criteria,
      });
    }

    let suggestion = localSuggestion(prompt, properties.length, listingPurpose);
    try {
      const compactProperties = properties.slice(0, 5).map((property: any) => ({
        title: property.title,
        type: property.type,
        city: property.city,
        price:
          listingPurpose === "BUY"
            ? property.finalPrice
            : property.pricePerMonth,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        amenities: property.amenities,
        verified: property.isVerified,
      }));
      suggestion = await groqChat(
        [
          {
            role: "system",
            content: `You are a helpful StayNest property concierge. Reply in the same language/style as the user's request. Give a warm, concise 1-2 sentence search summary. You may mention ONLY facts in REAL LISTINGS. The user is browsing ${listingPurpose === "BUY" ? "homes for purchase; price means final price" : "rental homes; price means monthly rent"}. Do not invent facts, availability, or a property.`,
          },
          {
            role: "user",
            content: `Request: ${prompt}\nREAL LISTINGS: ${JSON.stringify(compactProperties)}`,
          },
        ],
        { temperature: 0.45, maxTokens: 220 },
      );
    } catch {
      // Database results remain useful if the optional natural-language summary fails.
    }

    try {
      await AiActivity.create({
        userId: actor.userId,
        visitorId: actor.visitorId,
        role: actor.role,
        kind: "PROPERTY_SEARCH",
        input: prompt,
        output: suggestion,
        listingPurpose,
        criteria,
        matchedPropertyIds: properties.map((property: any) => property._id),
      });
    } catch (saveError) {
      console.error("Unable to save AI search activity:", saveError);
    }

    return NextResponse.json({
      properties,
      total: properties.length,
      suggestion,
      criteria,
    });
  } catch (error) {
    console.error("AI property search error:", error);
    return NextResponse.json(
      { properties: [], total: 0, suggestion: fallbackAiMessage(prompt) },
      { status: 500 },
    );
  }
}
