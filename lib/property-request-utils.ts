import { Types } from "mongoose";
import { Property } from "@/lib/models/Property";

export const REQUEST_STATUSES = [
  "NEW",
  "REVIEWING",
  "CONTACTED",
  "MATCH_FOUND",
  "CLOSED",
] as const;
export const REQUEST_TYPES = [
  "ANY",
  "FLAT",
  "HOUSE",
  "STUDIO",
  "CONDO",
  "TOWNHOUSE",
  "VILLA",
] as const;

export function validatePropertyRequest(body: any) {
  const purpose =
    body?.purpose === "BUY" ? "BUY" : body?.purpose === "RENT" ? "RENT" : null;
  const propertyType = REQUEST_TYPES.includes(body?.propertyType)
    ? body.propertyType
    : null;
  const location = String(body?.preferredLocation || "").trim();
  const requirements = String(body?.requirements || "").trim();
  const minBudget =
    body?.minBudget === "" || body?.minBudget === undefined
      ? undefined
      : Number(body.minBudget);
  const maxBudget = Number(body?.maxBudget);
  const bedrooms = Number(body?.bedrooms);
  const bathrooms = Number(body?.bathrooms);
  const moveInDate = body?.moveInDate ? new Date(body.moveInDate) : undefined;

  if (!purpose || !propertyType || !location || !requirements)
    return { error: "Please complete all required request details." };
  if (
    !Number.isFinite(maxBudget) ||
    maxBudget <= 0 ||
    (minBudget !== undefined &&
      (!Number.isFinite(minBudget) || minBudget < 0 || minBudget > maxBudget))
  )
    return { error: "Enter a valid budget range." };
  if (
    !Number.isInteger(bedrooms) ||
    bedrooms < 0 ||
    !Number.isInteger(bathrooms) ||
    bathrooms < 0
  )
    return { error: "Bedrooms and bathrooms must be valid whole numbers." };
  if (purpose === "RENT" && (!moveInDate || Number.isNaN(moveInDate.getTime())))
    return { error: "A valid move-in date is required for rent requests." };
  if (requirements.length > 3000)
    return { error: "Requirements can be up to 3,000 characters." };

  return {
    value: {
      purpose,
      propertyType,
      preferredLocation: location,
      requirements,
      minBudget,
      maxBudget,
      bedrooms,
      bathrooms,
      moveInDate: purpose === "RENT" ? moveInDate : undefined,
    },
  };
}

export async function findMatchingProperties(request: any) {
  const priceField = request.purpose === "BUY" ? "finalPrice" : "pricePerMonth";
  const query: any = {
    isAvailable: { $ne: false },
    isVerified: true,
    listingPurpose: request.purpose,
    listingStatus: { $in: ["APPROVED", null] },
    $or: [
      { city: { $regex: request.preferredLocation, $options: "i" } },
      { neighborhood: { $regex: request.preferredLocation, $options: "i" } },
      { address: { $regex: request.preferredLocation, $options: "i" } },
    ],
    bedrooms: { $gte: request.bedrooms },
    bathrooms: { $gte: request.bathrooms },
    [priceField]: { $gte: request.minBudget || 0, $lte: request.maxBudget },
  };
  if (request.propertyType && request.propertyType !== "ANY")
    query.type = request.propertyType;
  if (request.purpose === "BUY") query.saleStatus = { $ne: "SOLD" };

  return Property.find(query)
    .select(
      "title city neighborhood type bedrooms bathrooms images listingPurpose pricePerMonth finalPrice isVerified",
    )
    .sort({ rating: -1, createdAt: -1 })
    .limit(12)
    .lean();
}

export function validPropertyIds(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (id): id is string => typeof id === "string" && Types.ObjectId.isValid(id),
  );
}
