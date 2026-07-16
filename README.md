# ProfitGrid (PWA-first)

Premium P&L calendar + trade journal (Forex, Crypto, Indices, Stocks, Metals, Futures) with cloud sync via Supabase.

## What’s inside
- **Daily totals** (cloud synced)
- **Monthly calendar heatmap** (click-to-edit)
- **Trade journal** (multi-market)
- **Analytics** (equity curve + drawdown, expectancy + RR distribution gated by plan)
- **Weekly review workflow** (Premium+)
- **Investor-grade PDF export** (Premium+)
- **Pricing** page with Free/Premium/Pro tiers (dev plan switching)
- **PWA** (install prompt + manifest + service worker via `next-pwa`)

## 1) Install & run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## 2) Supabase setup

Create a Supabase project and add a `.env.local` in the repo root:

```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Then run the SQL in **`supabase.sql`** in Supabase → SQL Editor.

### Auth
Enable Email provider in Supabase Auth.
For fastest dev testing, you can disable “confirm email”.

## 3) PWA install

- Desktop Chrome/Edge: you’ll see an **Install** button (top-right).
- iPhone: open in Safari → Share → **Add to Home Screen**.

## 4) Screenshots (Supabase Storage)

ProfitGrid supports uploading trade screenshots (Premium+).

1. In Supabase → **Storage** create a bucket named **`trade_screens`**
2. Set it to **Private**
3. Add storage policies so users can only access their own folder. Recommended conditions:
   - Read: `bucket_id = 'trade_screens' AND auth.uid()::text = (storage.foldername(name))[1]`
   - Insert: same condition

Trades will upload to: `userId/tradeId/<timestamp>_filename.png`

## 5) Paid plans (Stripe + dev mode)

Pricing supports real Stripe checkout **if configured**, otherwise it falls back to a dev plan switch.

Add these env vars (example):

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_PREMIUM=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Webhook handling is scaffolded in `app/api/stripe/webhook/route.ts`.
For production, you should update the user's `profiles.plan` using a Supabase service-role key.

## 6) Crypto payments (Confirmo)

ProfitGrid supports crypto checkout via Confirmo invoices.

Add to `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
CONFIRMO_API_KEY=your_confirmo_api_key
CONFIRMO_CALLBACK_PASSWORD=your_confirmo_callback_password
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Create an HTTPS webhook endpoint in Confirmo:
`https://your-domain.com/api/pay/confirmo/webhook`

Confirmo webhooks include a `bp-signature` header derived from SHA256(payload + callbackPassword). The handler also verifies final status via Confirmo's GET invoice endpoint.

## Notes
- Broker auto-import (e.g., MT5 statement import) is planned for Pro.
- Screenshot uploads require Supabase Storage.


## Deployment targets (Vercel / Netlify / VPS)

### Vercel (recommended)
1. Push this project to GitHub.
2. In Vercel: New Project → Import your repo.
3. Add Environment Variables from `.env.example` in Vercel Project Settings.
4. Deploy.

**Webhooks** (must use your production domain):
- Stripe: `/api/stripe/webhook`
- Confirmo: `/api/pay/confirmo/webhook`
- Coinbase Commerce: `/api/pay/coinbase/webhook`
- NOWPayments: `/api/pay/nowpayments/webhook`

For local testing of webhooks, use a tunnel (ngrok / Cloudflare Tunnel) and set `NEXT_PUBLIC_SITE_URL` to the tunnel URL.

### Netlify
Netlify supports Next.js, but webhooks + server routes require Netlify's Next runtime.
- Use Netlify's Next.js plugin.
- Set the same environment variables.
- Ensure you are on a plan/runtime that supports serverless functions.

### VPS / self-host
1. Install Node.js LTS.
2. `npm install` then `npm run build`.
3. Run with `npm run start` behind a reverse proxy (Nginx) with HTTPS.
4. Set env vars in your process manager (PM2/systemd).

**Important**: Webhook providers require HTTPS and a public domain.
