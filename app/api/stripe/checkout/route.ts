import Stripe from "stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const plan = String(body.plan ?? "");
  const userId = String(body.userId ?? "");
  const email = String(body.email ?? "");

  const secret = process.env.STRIPE_SECRET_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (!secret) {
    return NextResponse.json(
      { error: "Stripe is not configured. Set STRIPE_SECRET_KEY and price IDs in .env.local" },
      { status: 400 }
    );
  }

  const premiumPrice = process.env.STRIPE_PRICE_PREMIUM;
  const proPrice = process.env.STRIPE_PRICE_PRO;

  const priceId = plan === "premium" ? premiumPrice : plan === "pro" ? proPrice : null;
  if (!priceId) {
    return NextResponse.json(
      { error: "Invalid plan or missing Stripe price ID." },
      { status: 400 }
    );
  }

  const stripe = new Stripe(secret, { apiVersion: "2024-04-10" as any });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}/pricing?success=1`,
    cancel_url: `${siteUrl}/pricing?canceled=1`,
    customer_email: email || undefined,
    metadata: {
      user_id: userId,
      plan,
    },
  });

  return NextResponse.json({ url: session.url });
}
