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

  const apiKey = process.env.COINBASE_COMMERCE_API_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  if (!apiKey) {
    return NextResponse.json(
      { error: "Coinbase Commerce not configured. Set COINBASE_COMMERCE_API_KEY" },
      { status: 400 }
    );
  }

  // Price mapping (USD). Adjust any time.
  const amount = plan === "premium" ? "12" : "24";

  const reference = { userId, plan, ts: Date.now() };
  const chargePayload: any = {
    name: `ProfitGrid ${plan.toUpperCase()}`,
    description: `ProfitGrid subscription (${plan})`,
    pricing_type: "fixed_price",
    local_price: { amount, currency: "USD" },
    metadata: reference,
    redirect_url: `${siteUrl}/pricing?success=1&provider=coinbase&plan=${plan}`,
    cancel_url: `${siteUrl}/pricing?canceled=1&provider=coinbase&plan=${plan}`,
  };
  // Coinbase Commerce doesn't use customer email for charges directly (optional via metadata)
  if (email) chargePayload.metadata.email = email;

  const resp = await fetch("https://api.commerce.coinbase.com/charges", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CC-Version": "2018-03-22",
      "X-CC-Api-Key": apiKey,
      "Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify(chargePayload),
  });

  const json = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    return NextResponse.json(
      { error: json?.error?.message ?? "Coinbase charge create failed", details: json },
      { status: 400 }
    );
  }

  const chargeId = String(json?.data?.id ?? "");
  const hostedUrl = String(json?.data?.hosted_url ?? "");

  try {
    const admin = createAdminSupabase();
    await admin.from("payments").insert({
      user_id: userId,
      provider: "coinbase",
      plan,
      status: "pending",
      external_id: chargeId || null,
      checkout_url: hostedUrl || null,
    });
  } catch {
    // service role not configured -> still return hosted URL
  }

  return NextResponse.json({ url: hostedUrl, chargeId });
}