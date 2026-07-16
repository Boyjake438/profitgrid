import { createClient } from "@supabase/supabase-js";

export function createAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "dummy_service_key";

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
