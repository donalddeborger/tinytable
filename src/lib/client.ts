import { createHash } from "crypto";

// Geanonimiseerde bezoekers-ID voor de limieten: een hash van het IP-adres
// (nooit het IP zelf), gezouten met het servertoken.
export function clientId(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "onbekend";
  const salt = process.env.TINYTABLE_API_TOKEN ?? "";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

// Verborgen veld dat mensen niet zien maar bots wel invullen.
export function isBot(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const trap = (body as Record<string, unknown>).website;
  return typeof trap === "string" && trap.trim() !== "";
}
