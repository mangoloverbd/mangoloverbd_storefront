# ম্যাংগো লাভার — Mango Lover BD Storefront

The public storefront for **Mango Lover BD**. React + Vite + Express, deployed on Vercel,
connected to the Merchant Suite dashboard (a separate repo) for catalog data and order submission.

- **Repo:** `github.com/mangoloverbd/mangoloverbd_storefront`
- **Live:** https://mangoloverbd.vercel.app (Vercel project `mangoloverbd`)
- **Dashboard repo:** Merchant Suite / commerceos — separate repository, separate Vercel project

> **Read `CLAUDE.md` before making changes.** It explains the two-repo boundary and what does
> and does not belong in this codebase.

---

## Quick start

```bash
npm install
cp .env.example .env      # then fill in the real values (see "Environment" below)
npm run dev               # http://localhost:5003
```

`npm run dev` starts Express, which serves both the API routes and the Vite dev server with HMR.
There is no separate frontend process. `npm run dev:client` runs Vite alone on port 5000 if you
ever need it, but the checkout API will not work in that mode.

The dev script loads `.env` via Node's `--env-file-if-exists` flag. There is intentionally no
`dotenv` dependency. The `-if-exists` variant matters: on Vercel there is no `.env` file (env vars
are injected), so the strict `--env-file` flag would break production builds.

Other commands:

| Command | What it does |
|---|---|
| `npm run dev` | Express + Vite dev server on **port 5003** |
| `npm run build` | Prefetches the catalog, builds the client to `dist/public`, bundles the server |
| `npm run start` | Runs the production bundle (`dist/index.cjs`) |
| `npm run check` | `tsc` type-check, no emit |
| `node --test client/src/pages/home.test.ts` | Source-text tests (see "Testing") |

---

## Environment

Six variables, in `.env` locally and in Vercel project settings for deploys. `.env` is gitignored —
never commit it. `.env.example` is the committed template.

| Variable | Scope | Purpose |
|---|---|---|
| `VITE_MERCHANT_SUITE_URL` | client (browser) | Base URL of the Merchant Suite. Catalog/inventory reads. **Baked into the bundle at build time.** |
| `VITE_STOREFRONT_ID` | client (browser) | The fixed Mango Lover BD workspace id: `3cd26e57-85ef-4970-94a4-cd99c0f1b554` |
| `MERCHANT_SUITE_URL` | server | Same URL as above, for the server-side checkout POST |
| `CUSTOM_ORDERS_API_KEY` | server, **secret** | Authenticates the order webhook. Must match `<orgId>:custom_store_api_key` in the Suite's `app_settings`. Never expose this via a `VITE_` variable. |
| `META_PIXEL_ID` | server, optional | Meta Conversions API — server-side event dedup |
| `META_ACCESS_TOKEN` | server, **secret**, optional | Meta Conversions API token |

Anything prefixed `VITE_` is compiled into the public JavaScript bundle and is readable by
anyone. Only put non-secret values there.

### Local development

Point both URLs at your locally running Merchant Suite:

```
VITE_MERCHANT_SUITE_URL=http://localhost:5002
MERCHANT_SUITE_URL=http://localhost:5002
```

Start the Suite first (`npm run dev` in the commerceos repo, port 5002), then this storefront on 5003.

### Production (Vercel)

The Vercel project `mangoloverbd` already has all four required variables set on production,
preview, and development targets. `CUSTOM_ORDERS_API_KEY` and `MERCHANT_SUITE_URL` are encrypted;
the two `VITE_` ones are plaintext by nature.

**While the Suite runs on localhost, an ngrok tunnel bridges Vercel to it.** Vercel's serverless
checkout handler posts from Vercel's own infrastructure, so a `localhost` URL there always fails —
even though browser-side catalog reads appear to work when you are testing from your own machine.
Free ngrok URLs change on every restart, so after restarting the tunnel you must update **both**
Vercel env vars and redeploy (the client bundle bakes `VITE_MERCHANT_SUITE_URL` in at build time).
The durable fix is deploying the Suite to a real public URL.

---

## How the storefront connects to the dashboard

Two directions, two different mechanisms:

**Catalog reads — browser → Suite, unauthenticated public API.**
`client/src/lib/storefront-products.ts` builds every URL from
`${VITE_MERCHANT_SUITE_URL}/api/public/v1/storefronts/${VITE_STOREFRONT_ID}`:

| Call | Endpoint |
|---|---|
| `fetchStorefrontProducts()` | `GET .../products` |
| `fetchStorefrontProduct(slug)` | `GET .../products/:slug` |
| `fetchStorefrontProductInventory(slug)` | `GET .../products/:slug/inventory` |

`STOREFRONT_POLL_INTERVAL_MS` (8s) is how often the storefront re-checks stock, prices, and images.
`mergeInventory()` overlays live stock truth onto a cached catalog product. This is why **publishing
a product or editing stock in the dashboard shows up on the storefront within seconds and does not
require a redeploy.**

Requests carry an `ngrok-skip-browser-warning: true` header so free-tier tunnels return JSON
instead of their HTML interstitial. Harmless once the Suite is on a real domain.

**Checkout — storefront server → Suite, authenticated webhook.**
`api/orders.ts` (Vercel serverless) and `server/order-service.ts` (local Express) both POST to
`${MERCHANT_SUITE_URL}/api/custom-orders/webhook` with an `x-api-key: ${CUSTOM_ORDERS_API_KEY}`
header. The Suite matches that key against `app_settings` to resolve the workspace and returns the
canonical `order_id`. The order then appears in the dashboard with `source: custom_store`.

This never happens from the browser — the API key must stay server-side.

### Verifying the connection

```bash
# Catalog reachable?
curl -s "$MERCHANT_SUITE_URL/api/public/v1/storefronts/3cd26e57-85ef-4970-94a4-cd99c0f1b554/products" | head -c 300

# Checkout wired up? (creates a REAL order in the dashboard — delete it afterwards)
curl -s -X POST "$MERCHANT_SUITE_URL/api/custom-orders/webhook" \
  -H "Content-Type: application/json" -H "x-api-key: $CUSTOM_ORDERS_API_KEY" \
  -d '{"customer_name":"Test","phone":"01700000000","address":"Test address, Dhaka","product":"Test","quantity":1,"price":100,"delivery_rate":60}'
```

A 201 with an `order_id` means the link is live. An empty `products` array means nothing is
published in the dashboard yet — that is a dashboard-side task, not a storefront bug.

---

## Layout

```
client/
  index.html                        page title + OG/Twitter meta
  public/                           static assets served at /
  src/
    App.tsx                         routes (wouter)
    pages/       home.tsx  products.tsx  product.tsx  booking.tsx  not-found.tsx
    components/  layout.tsx (nav + footer)  cart-drawer.tsx  product-grid.tsx  ui/ (shadcn)
    contexts/    cart-context.tsx
    lib/
      storefront-products.ts        ← the Suite API client
      generated-storefront-products.ts  ← BUILD ARTIFACT, see warning below
api/orders.ts                       Vercel serverless checkout
server/                             local Express (dev + self-hosted prod)
script/build.ts                     build: catalog prefetch → vite → esbuild
attached_assets/                    imported via the @assets alias
```

Path aliases (`vite.config.ts`): `@` → `client/src`, `@shared` → `shared`, `@assets` → `attached_assets`.

Routing uses **wouter**, not React Router. That is the opposite of the dashboard repo's rule —
do not carry that convention across.

### Build-artifact hazard

`script/build.ts` fetches the live catalog and **overwrites**
`client/src/lib/generated-storefront-products.ts`. While no products are published in the dashboard,
every `npm run build` silently rewrites that file to an empty array, which shows up as a large
unintended diff. Check `git status` after building and `git checkout -- client/src/lib/generated-storefront-products.ts`
if it was clobbered. Never commit that emptied version.

---

## Branding

Current brand assets and where they are wired:

| Asset | File | Used in |
|---|---|---|
| Nav logo | `attached_assets/mango-lover-logo.avif` | `client/src/components/layout.tsx` |
| Hero poster | `client/public/hero-mango-lover.webp` | `client/src/pages/home.tsx` (inline, ~line 289) |
| Brand yellow | `#FBBB14` | hero background |
| Brand ink | `#163B33` | hero CTA |
| Wordmark | `ম্যাংগো লাভার - Mango Lover` | `layout.tsx` footer, `client/index.html` titles |

**The homepage hero is inline in `client/src/pages/home.tsx`.** `client/src/components/hero.tsx`
exists but is dead code — nothing imports it. Editing it has no visible effect.

Currency is always `৳`, never "BDT" or "Tk".

### Known branding gaps

Not yet cleaned up in `client/index.html`: both meta descriptions still mention "Stepprs",
`twitter:site` is `@stepprs`, `og:image` points at `/favicon.png`, and there is a `preconnect` to an
unrelated Supabase project. Also, no loaded webfont contains Bengali glyphs — the Bangla wordmark
falls back to a system font. Adding Hind Siliguri or Anek Bangla would fix that.

---

## Testing

There is no vitest here. Tests are `node:test` files that assert against **source text**:

```bash
node --test client/src/pages/home.test.ts
node --test client/src/lib/storefront-products.test.ts
```

Because they match on markup strings, any className or copy change in `home.tsx` will break the
corresponding assertion. Update the assertion to describe the new markup rather than reverting the
change. Run `npm run check` too — `tsc` catches what source-text tests cannot.

---

## Deploying

Vercel auto-deploys on push to `main`. `vercel.json` sets `outputDirectory: dist/public`, SPA
rewrites, and immutable cache headers on hashed assets.

Before pushing: `npm run check`, run the tests, and confirm `git status` has no clobbered
`generated-storefront-products.ts`.
