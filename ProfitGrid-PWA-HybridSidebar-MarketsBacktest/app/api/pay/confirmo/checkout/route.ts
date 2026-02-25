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

  const apiKey = process.env.CONFIRMO_API_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  if (!apiKey) {
    return NextResponse.json(
      { error: "Confirmo not configured. Set CONFIRMO_API_KEY" },
      { status: 400 }
    );
  }

  // Price mapping (USD). You can adjust.
  const amount = plan === "premium" ? "12" : "24";
  const currency = "USD";

  const reference = JSON.stringify({ userId, plan, ts: Date.now() });

  const payload: any = {
    invoice: { amount, currency },
    reference,
    returnUrl: `${siteUrl}/pricing?success=1&provider=confirmo&plan=${plan}`,
    notifyUrl: `${siteUrl}/api/pay/confirmo/webhook`,
  };
  if (email) payload.customerEmail = email;

  // Create invoice
  const resp = await fetch("https://confirmo.net/api/v3/invoices", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify(payload),
  });

  const json = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    return NextResponse.json(
      { error: json?.message ?? "Confirmo invoice create failed", details: json },
      { status: 400 }
    );
  }

  const invoiceId = String(json?.id ?? "");
  const checkoutUrl = String(json?.url ?? "");

  // Store payment session (server-side) for audit / reconciliation
  try {
    const admin = createAdminSupabase();
    await admin.from("payments").insert({
      user_id: userId,
      provider: "confirmo",
      plan,
      status: "pending",
      external_id: invoiceId || null,
      checkout_url: checkoutUrl || null,
    });
  } catch {
    // If service role not configured yet, we still return the checkout URL.
  }

  return NextResponse.json({ url: checkoutUrl, invoiceId });
}
