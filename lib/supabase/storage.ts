import { createClient } from "./client";

export const TRADE_SCREENS_BUCKET = "trade_screens";

/**
 * Upload a screenshot to Supabase Storage.
 * Convention: <userId>/<tradeId>/<timestamp>_<filename>
 */
export async function uploadTradeScreenshot(opts: {
  userId: string;
  tradeId: number;
  file: File;
}) {
  const supabase = createClient();
  const safeName = opts.file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${opts.userId}/${opts.tradeId}/${Date.now()}_${safeName}`;

  const { error } = await supabase.storage
    .from(TRADE_SCREENS_BUCKET)
    .upload(path, opts.file, {
      cacheControl: "3600",
      upsert: false,
      contentType: opts.file.type || "image/png",
    });

  if (error) throw error;

  return { path };
}
