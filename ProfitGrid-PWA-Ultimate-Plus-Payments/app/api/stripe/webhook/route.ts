import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook not configured" }, { status: 400 });
  }

  const stripe = new Stripe(secret, { apiVersion: "2024-06-20" });

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // NOTE: For production, update your Supabase profile plan here.
  // Because this template can't safely access your Supabase service role key,
  // we only validate the event and return 200.

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;
    const plan = session.metadata?.plan;

    if (userId && (plan === "premium" || plan === "pro")) {
      try {
        const admin = createAdminSupabase();
        await admin.from("profiles").upsert({ id: userId, plan }, { onConflict: "id" });
        await admin.from("payments").insert({
          user_id: userId,
          provider: "stripe",
          plan,
          status: "paid",
          external_id: session.id,
          checkout_url: session.url ?? null,
        });
      } catch {
        // If service role key isn't configured, skip auto-upgrade.
      }
    }
  }

  return NextResponse.json({ received: true });
}
