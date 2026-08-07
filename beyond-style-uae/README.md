# Beyond Style UAE

Bilingual (EN/AR) UAE fashion-accessories storefront — gold-tone and silver-tone
stainless-steel bracelets, gift-ready, WhatsApp ordering.

**Stack:** React 19 · TypeScript · Vite · Tailwind · Framer Motion · Hono · Drizzle ORM · MySQL

## Quick start

```bash
npm install
cp .env.example .env        # fill in DATABASE_URL, Cloudinary, analytics, WhatsApp
npm run db:push             # sync the Drizzle schema to MySQL
npm run server              # Hono API on :8787
npm run dev                 # Vite dev server on :5173 (proxies /api -> :8787)
```

The storefront runs against sample data if the API/DB is offline, so `npm run dev`
works standalone.

## Scripts

| Script | Purpose |
| --- | --- |
| `dev` | Vite dev server |
| `server` | Hono API (tsx watch) |
| `build` | Typecheck + production build |
| `test` | Vitest unit tests |
| `db:push` / `db:generate` / `db:studio` | Drizzle Kit |

## Deploy to Vercel (full stack)

The frontend (Vite SPA) and the API (Hono) deploy to the **same Vercel project**.
`api/[[...route]].ts` mounts the Hono app as a Node.js serverless function, so
`/api/*` is served on the same origin as the site.

1. **Point Vercel at the subfolder.** Project → Settings → Build & Deployment →
   **Root Directory** = `beyond-style-uae`. Vercel auto-detects Vite and reads
   `vercel.json` (output `dist`, SPA rewrite that excludes `/api/`).
2. **Provision a publicly reachable MySQL** (PlanetScale, Railway, Aiven, etc.)
   with SSL.
3. **Set Environment Variables** in Vercel (Production + Preview):

   | Variable | Notes |
   | --- | --- |
   | `DATABASE_URL` | `mysql://user:pass@host:3306/db?ssl={"rejectUnauthorized":true}` |
   | `VITE_CLOUDINARY_CLOUD_NAME` | image CDN |
   | `VITE_GA4_MEASUREMENT_ID`, `VITE_META_PIXEL_ID` | analytics |
   | `VITE_FREE_SHIPPING_THRESHOLD` | defaults to 200 |
   | `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `OPS_WHATSAPP_TO` | COD verification (server-only) |
   | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | card payments (server-only) |
   | `PUBLIC_BASE_URL` | Stripe success/cancel redirect base (e.g. `https://beyondstyle.ae`) |
   | `ADMIN_TOKEN` | shared secret for the `/admin` UI + `/api/admin/*` |

   `VITE_*` vars are inlined into the client bundle at build time; the rest are
   read by the serverless function at runtime.
4. **Push the schema + seed** (run locally against the same `DATABASE_URL`):
   ```bash
   npm run db:push
   npm run db:seed
   ```
5. **Redeploy.** `/api/health` should return `{"ok":true}` and the storefront
   renders the seeded catalogue.

> Serverless + MySQL: connections open lazily and the pool is reused across warm
> invocations. Under heavy cold-start churn consider a serverless-friendly driver
> (e.g. PlanetScale's HTTP driver) to avoid exhausting connection limits.

### Card payments (Stripe)

Card orders create a **hosted Stripe Checkout Session** (no card data touches our
servers). Flow: `POST /api/orders` with `paymentMethod: "card"` → order saved as
`pending_payment` → client redirects to the returned `checkoutUrl` → on success
Stripe redirects to `/thank-you`, and the webhook confirms the order.

Register the webhook in the Stripe Dashboard pointing at
`https://<your-domain>/api/stripe/webhook` for the `checkout.session.completed`
event, then put its signing secret in `STRIPE_WEBHOOK_SECRET`. Currency is AED.
Without `STRIPE_SECRET_KEY`, card checkout returns `503` and the UI falls back to COD.

### Admin

Visit `/admin`, enter a token. Auth accepts a single `ADMIN_TOKEN` (actor
"admin") and/or `ADMIN_TOKENS="name:token,…"` so a team each get their own token;
every mutation is recorded in the `admin_audit` table with the actor's name.

- **Products** — create (same Zod compliance rules: "Real Gold"/"18k" rejected),
  activate/deactivate.
- **Orders** — search (name/phone/id), filter by status, expand for line items,
  export CSV, and advance fulfilment:
  COD `pending_verification → confirmed → dispatched → delivered` (or `cancelled`,
  which restocks inventory). Card orders sit at `pending_payment` until the Stripe
  webhook confirms them.

Endpoints live under `/api/admin/*` behind the `x-admin-token` header. Inventory
is decremented atomically at checkout; an oversell returns `409 out_of_stock`.

> Schema changed (added `admin_audit`, order `pending_payment` + `stripeSessionId`)
> — rerun `npm run db:push` after pulling.

### Stripe smoke test

Verify card checkout against Stripe **test mode** without touching the DB:

```bash
STRIPE_SECRET_KEY=sk_test_... npm run stripe:smoke
```

It calls the real `createCheckoutSession`, refuses non-`sk_test_` keys, and prints a
Checkout URL you can open and pay with test card `4242 4242 4242 4242`.

## Architecture

```
src/
├── api/            Hono server + COD/payment logic
│   ├── server.ts   Routes: products, orders, abandoned-cart
│   └── payment.ts  createOrder → COD forced to pending_verification + WhatsApp ping
├── components/     Header, ShippingBanner, ProductCard, JewelryCareBadge,
│                   Reviews, StickyAddToCart, JsonLd, motion helpers
├── context/        CartContext (200 AED free-shipping threshold)
├── db/             Drizzle schema + connection (MySQL)
├── hooks/          useAbandonedCart (20-min timer)
├── lib/            cloudinary (f_auto,q_auto), analytics (GA4+Pixel), i18n, shipping, api
├── pages/          Home, ProductDetail, Cart, Checkout, ThankYou (all React.lazy)
└── schemas/        product.ts — Zod compliance (.refine forbids "Real Gold"/"18k")
```

## Conversion & compliance highlights

- **Free shipping** — `lib/shipping.ts` + `ShippingBanner` show *"Add AED X to unlock Free Delivery"*.
- **COD trust** — `api/payment.ts` forces COD orders to `pending_verification` and fires a WhatsApp confirmation (logs as fallback without creds).
- **Abandoned cart** — `useAbandonedCart` starts a 20-minute recovery timer after each add.
- **Compliance** — Zod `.refine()` blocks "Real Gold", "18k", etc. and requires "Gold-tone plated".
- **Trust** — `JewelryCareBadge` + `Reviews` on every PDP; sticky mobile Add-to-Cart.
- **Performance** — Cloudinary `f_auto,q_auto`, font preload + `display=swap`, route code-splitting.
- **SEO** — JSON-LD `Product` / `Organization` / `WebSite` / `OnlineStore`; per-route
  `<title>`, canonical, `hreflang` (ar/en/x-default), Open Graph + Twitter via `components/Seo.tsx`;
  build-time `public/sitemap.xml` (`scripts/gen-sitemap.ts`, runs on `prebuild`); `robots.txt`.
- **AIO (AI answer engines)** — `public/llms.txt` catalogue summary; `robots.txt` explicitly
  allows GPTBot / OAI-SearchBot / PerplexityBot / ClaudeBot / Google-Extended.
- **Installable app (PWA, mobile-first)** — `manifest.webmanifest` + gem app icons,
  offline service worker (`public/sw.js`, registered in `main.tsx`), and an in-app
  install prompt (`components/InstallPrompt.tsx`) — Android "Add to Home Screen" and iOS hint.
- **Brand** — distinctive faceted-gem house mark (`components/BrandLogo.tsx`, `public/icon.svg`).
- **Analytics** — GA4 + Meta Pixel initialized in `main.tsx`.
```

## Deploy as a standalone site (GitHub + Vercel)

Project name: **`beyond-style-boutique`** (npm package name / Vercel project name) — kept
deliberately distinct from the root console package (`beyond-style-uae`) so the two never
collide on npm or Vercel. The customer-facing brand shown in the UI is still "Beyond Style UAE".

This storefront is self-contained under `beyond-style-uae/` and deploys as its **own**
Vercel project, independent of the repo's Next.js console at the root:

1. Import the repository in Vercel and set **Root Directory = `beyond-style-uae`**.
2. Framework preset **Vite** (already declared in `vercel.json`); build `npm run build`,
   output `dist`. The Hono API is served from `api/[[...route]].ts` as a serverless function.
3. Set the canonical origin via the **`SITE_URL`** (sitemap) and **`VITE_SITE_URL`** (meta)
   env vars, plus `DATABASE_URL`, Stripe, and analytics keys from `.env.example`.

Because it lives in a subdirectory with its own `package.json` and `vercel.json`, it can be
split into a separate GitHub repository at any time without touching the console app.
