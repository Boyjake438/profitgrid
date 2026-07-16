import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminSupabase } from "@/lib/supabase/admin";

function hmacSHA512Hex(payload: string, secret: string) {
  return crypto.createHmac("sha512", secret).update(payload, "utf8").digest("hex");
}

export async function POST(req: Request) {
  const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!ipnSecret) {
    return NextResponse.json({ error: "NOWPayments webhook not configured" }, { status: 400 });
  }

  const raw = await req.text();
  const sig = req.headers.get("x-nowpayments-sig") || "";
  const expected = hmacSHA512Hex(raw, ipnSecret);

  if (!sig || sig.toLowerCase() !== expected.toLowerCase()) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // NOWPayments IPN typically includes payment_id, invoice_id, payment_status
  const invoiceId = String(payload?.invoice_id ?? payload?.invoiceId ?? "");
  const paymentId = String(payload?.payment_id ?? payload?.paymentId ?? "");
  const status = String(payload?.payment_status ?? payload?.status ?? "");

  // Determine paid states
  const paidStates = ["finished", "confirmed", "paid"];
  let isPaid = paidStates.includes(status);

  // Optional verification via API
  try {
    if (apiKey && paymentId) {
      const verifyResp = await fetch(`https://api.nowpayments.io/v1/payment/${paymentId}`, {
        headers: { "x-api-key": apiKey },
      });
      const verified = await verifyResp.json().catch(() => ({}));
      const verifiedStatus = String(verified?.payment_status ?? status);
      isPaid = paidStates.includes(verifiedStatus);
    }
  } catch {}

  // Find corresponding payments row by external_id (invoiceId) first
  try {
    const admin = createAdminSupabase();

    // Fetch payment record to know user/plan
    const { data } = await admin
      .from("payments")
      .select("user_id,plan")
      .eq("provider", "nowpayments")
      .eq("external_id", invoiceId || paymentId)
      .maybeSingle();

    const userId = String((data as any)?.user_id ?? "");
    const plan = String((data as any)?.plan ?? "");

    await admin
      .from("payments")
      .update({ status: isPaid ? "paid" : status || "pending" })
      .eq("provider", "nowpayments")
      .eq("external_id", invoiceId || paymentId);

    if (isPaid && userId && (plan === "premium" || plan === "pro")) {
      await admin.from("profiles").upsert({ id: userId, plan }, { onConflict: "id" });
    }
  } catch {
    // If service role missing, can't auto-upgrade
  }

  return NextResponse.json({ ok: true });
}