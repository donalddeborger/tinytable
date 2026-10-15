import { NextResponse } from "next/server";
import { ANTWERP_BOUNDS } from "@/lib/antwerp";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json([]);
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("q", q);
  url.searchParams.set("countrycodes", "be");
  url.searchParams.set("limit", "8");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set(
    "viewbox",
    `${ANTWERP_BOUNDS.west},${ANTWERP_BOUNDS.north},${ANTWERP_BOUNDS.east},${ANTWERP_BOUNDS.south}`,
  );
  url.searchParams.set("bounded", "1");

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Tinytable/0.1 (kindvriendelijke horeca)",
      Accept: "application/json",
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    return NextResponse.json([], { status: 502 });
  }

  const results = (await response.json()) as {
    display_name: string;
    lat: string;
    lon: string;
    name?: string;
    type?: string;
    address?: { road?: string; house_number?: string; city?: string; town?: string };
  }[];

  return NextResponse.json(
    results.map((item) => ({
      name: item.name || item.display_name.split(",")[0],
      address: item.display_name,
      lat: Number(item.lat),
      lng: Number(item.lon),
      type: item.type,
    })),
  );
}
