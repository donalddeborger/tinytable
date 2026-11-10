import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Gebruikt in de API-routes. De publieke (publishable) sleutel volstaat:
// lezen mag iedereen, en schrijven kan alleen via de databasefuncties
// add_place en update_place, die de invoer controleren (zie supabase/schema.sql).
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is niet ingesteld: zet NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
