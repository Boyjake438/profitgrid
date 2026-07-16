import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminSupabase } from "@/lib/supabase/admin";

function hmacSHA256Hex(payload: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(payload, "utf8").digest("hex");
}

export async function POST(req: Request) {
  const webhookSecret = process.env.COINBASE_COMMERCE_WEBHOOK_SECRET;
  const apiKey = process.env.COINBASE_COMMERCE_API_KEY;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Coinbase webhook not configured" }, { status: 400 });
  }

  const raw = await req.text();
  const sig = req.headers.get("x-cc-webhook-signature") || "";
  const expected = hmacSHA256Hex(raw, webhookSecret);

  if (!sig || sig.toLowerCase() !== expected.toLowerCase()) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = String(event?.type ?? "");
  const charge = event?.data;
  const chargeId = String(charge?.id ?? "");
  const metadata = charge?.metadata ?? {};
  const userId = String(metadata?.userId ?? "");
  const plan = String(metadata?.plan ?? "");

  if (!chargeId) return NextResponse.json({ ok: true });

  // Verify status from API (recommended): check if charge is confirmed.
  let isPaid = false;
  let statusStr = "";

  try {
    if (apiKey) {
      const verifyResp = await fetch(`https://api.commerce.coinbase.com/charges/${chargeId}`, {
        headers: { "X-CC-Version": "2018-03-22", "X-CC-Api-Key": apiKey },
      });
      const verified = await verifyResp.json().catch(() => ({}));
      const timeline = verified?.data?.timeline ?? [];
      // Coinbase timeline statuses: NEW, PENDING, COMPLETED, EXPIRED, CANCELED, etc.
      // We'll treat COMPLETED as paid.
      statusStr = String(verified?.data?.timeline?.[timeline.length - 1]?.status ?? "");
      isPaid = statusStr === "COMPLETED";
    } else {
      // fallback to webhook event
      statusStr = eventType;
      isPaid = eventType.toLowerCase().includes("charge:confirmed") || eventType.toLowerCase().includes("charge:resolved");
    }
  } catch {
    // ignore
  }

  // Update DB if possible
  if (userId && (plan === "premium" || plan === "pro")) {
    try {
      const admin = createAdminSupabase();

      await admin
        .from("payments")
        .update({ status: isPaid ? "paid" : statusStr || "pending" })
        .eq("provider", "coinbase")
        .eq("external_id", chargeId);

      if (isPaid) {
        await admin.from("profiles").upsert({ id: userId, plan }, { onConflict: "id" });
      }
    } catch {
      // service role missing
    }
  }

  return NextResponse.json({ ok: true });
}