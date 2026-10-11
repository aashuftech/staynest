import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Property } from "@/lib/models/Property";

export async function GET(req: NextRequest) {
  const query = new URL(req.url).searchParams.get("q")?.trim();
  if (!query) return NextResponse.json({ locations: [] });

  const aliases: Record<string, string> = { badaut: "Baraut", hissar: "Hisar" };
  const searchTerm = aliases[query.toLowerCase()] || query;
  let savedLocations: string[] = [];

  try {
    await connectDB();
    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    const locations = await Property.aggregate([
      {
        $match: {
          isAvailable: { $ne: false },
          $or: [{ city: regex }, { neighborhood: regex }, { address: regex }],
        },
      },
      { $group: { _id: "$city" } },
      { $limit: 25 },
    ]);
    savedLocations = locations.map(({ _id }) => _id).filter(Boolean);
  } catch (error) {
    // A database outage must not prevent worldwide location suggestions.
    console.error("Saved location search error:", error);
  }

  try {
    const [openMeteoResponse, photonResponse] = await Promise.all([
      fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchTerm)}&count=100&language=en&format=json`,
        { next: { revalidate: 86400 } },
      ),
      fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(searchTerm)}&limit=100&lang=en`,
        { next: { revalidate: 86400 } },
      ),
    ]);
    const openMeteoData = openMeteoResponse.ok
      ? await openMeteoResponse.json()
      : { results: [] };
    const photonData = photonResponse.ok
      ? await photonResponse.json()
      : { features: [] };
    const openMeteoLocations = (openMeteoData.results || []).map(
      (place: { name: string; admin1?: string; country?: string }) =>
        [place.name, place.admin1, place.country].filter(Boolean).join(", "),
    );
    const photonLocations = (photonData.features || [])
      .map(
        (feature: {
          properties?: {
            name?: string;
            district?: string;
            state?: string;
            country?: string;
          };
        }) => {
          const place = feature.properties || {};
          return [place.name, place.district || place.state, place.country]
            .filter(Boolean)
            .join(", ");
        },
      )
      .filter(Boolean);
    const allLocations = Array.from(
      new Set([...savedLocations, ...openMeteoLocations, ...photonLocations]),
    );
    const lowerQuery = searchTerm.toLowerCase();
    allLocations.sort(
      (a, b) =>
        Number(!a.toLowerCase().startsWith(lowerQuery)) -
        Number(!b.toLowerCase().startsWith(lowerQuery)),
    );
    return NextResponse.json({ locations: allLocations.slice(0, 25) });
  } catch (error) {
    console.error("Global location search error:", error);
    return NextResponse.json({ locations: savedLocations });
  }
}
