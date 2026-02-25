import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminSupabase } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const plan = String(body.plan ?? "");
  const userId = String(body.userId ?? "");
  const email = String(body.email ?? "");

  if (!userId || (plan !== "premium" && plan !== "pro")) {
    return NextResponse.json({ error: "Invalid userId or plan" }, { status: 400 });
  }

  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  if (!apiKey) {
    return NextResponse.json(
      { error: "NOWPayments not configured. Set NOWPAYMENTS_API_KEY" },
      { status: 400 }
    );
  }

  const price_amount = plan === "premium" ? 12 : 24;
  const price_currency = "usd";
  // We'll let user pick crypto on NOWPayments hosted invoice (pay_currency can be omitted).
  const order_id = crypto.randomUUID();
  const order_description = `ProfitGrid ${plan.toUpperCase()} subscription`;

  const payload: any = {
    price_amount,
    price_currency,
    order_id,
    order_description,
    ipn_callback_url: `${siteUrl}/api/pay/nowpayments/webhook`,
    success_url: `${siteUrl}/pricing?success=1&provider=nowpayments&plan=${plan}`,
    cancel_url: `${siteUrl}/pricing?canceled=1&provider=nowpayments&plan=${plan}`,
    // We'll store our metadata in "order_description" + also send extra fields where supported.
    // NOWPayments allows "case" fields; safest: use custom "is_fixed_rate" and "is_fee_paid_by_user".
    is_fixed_rate: true,
    is_fee_paid_by_user: true,
  };

  // Create invoice (hosted payment page)
  const resp = await fetch("https://api.nowpayments.io/v1/invoice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "Idempotency-Key": order_id,
    },
    body: JSON.stringify(payload),
  });

  const json = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    return NextResponse.json(
      { error: json?.message ?? "NOWPayments invoice create failed", details: json },
      { status: 400 }
    );
  }

  const invoiceId = String(json?.id ?? "");
  const invoiceUrl = String(json?.invoice_url ?? json?.invoiceUrl ?? "");

  // Save mapping in DB (we store metadata in payments row)
  try {
    const admin = createAdminSupabase();
    await admin.from("payments").insert({
      user_id: userId,
      provider: "nowpayments",
      plan,
      status: "pending",
      external_id: invoiceId || order_id,
      checkout_url: invoiceUrl || null,
    });
  } catch {}

  // Also return order_id for later mapping if needed
  return NextResponse.json({ url: invoiceUrl, invoiceId, order_id });
}