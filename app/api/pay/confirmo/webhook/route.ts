import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminSupabase } from "@/lib/supabase/admin";

function sha256hex(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

export async function POST(req: Request) {
  const callbackPassword = process.env.CONFIRMO_CALLBACK_PASSWORD;
  const apiKey = process.env.CONFIRMO_API_KEY;
  if (!callbackPassword || !apiKey) {
    return NextResponse.json({ error: "Confirmo webhook not configured" }, { status: 400 });
  }

  const raw = await req.text();
  const sig = req.headers.get("bp-signature") || "";
  const expected = sha256hex(raw + callbackPassword);

  if (!sig || sig.toLowerCase() !== expected.toLowerCase()) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const invoiceId = String(payload?.id ?? "");
  const status = String(payload?.status ?? "");
  const referenceStr = String(payload?.reference ?? "");
  let reference: any = null;
  try {
    reference = referenceStr ? JSON.parse(referenceStr) : null;
  } catch {
    reference = null;
  }

  // Recommended: verify final status via GET invoice endpoint
  // (Confirmo docs recommend not relying exclusively on webhooks)
  const verifyResp = await fetch(`https://confirmo.net/api/v3/invoices/${invoiceId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const verified = await verifyResp.json().catch(() => ({}));
  const verifiedStatus = String(verified?.status ?? status);

  const isPaid = ["paid", "completed", "confirmed"].includes(verifiedStatus);
  const userId = String(reference?.userId ?? "");
  const plan = String(reference?.plan ?? "");

  if (!userId || (plan !== "premium" && plan !== "pro")) {
    // Still acknowledge to stop retries.
    return NextResponse.json({ ok: true });
  }

  try {
    const admin = createAdminSupabase();

    // Update payments row
    await admin
      .from("payments")
      .update({ status: isPaid ? "paid" : verifiedStatus || "pending" })
      .eq("provider", "confirmo")
      .eq("external_id", invoiceId);

    if (isPaid) {
      // Upgrade user plan
      await admin.from("profiles").upsert({ id: userId, plan }, { onConflict: "id" });
    }
  } catch {
    // If service role isn't set, we can't auto-upgrade.
  }

  return NextResponse.json({ ok: true });
}
