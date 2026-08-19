import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// This app has no individual user accounts (see src/lib/pin.ts for the
// shared-PIN access model), so there's no per-request auth session to sync
// via cookies. We just talk to Postgres directly using the *service role*
// key, which bypasses Row Level Security. This key must only ever be used
// here, on the server -- never in a "use client" file or exposed to the
// browser.
export function createClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
