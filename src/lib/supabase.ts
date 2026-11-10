import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Alleen gebruiken in server-code (API-routes). De geheime sleutel mag nooit
// in de browser terechtkomen, daarom heeft hij géén NEXT_PUBLIC_-prefix.
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is niet ingesteld: zet NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SECRET_KEY in .env.local (en bij je hosting).",
    );
  }

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
