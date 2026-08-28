# CLAUDE.md — Mango Lover BD Storefront Agent Guide

Authoritative guide for AI agents working in this repository. Read it fully before changing anything.
The **Hard Rules** are non-negotiable.

`AGENTS.md` is a symlink to this file, so Codex/OpenCode/Cursor read the same instructions.

---

## 1. What this repo is

The **public storefront for Mango Lover BD** (`ম্যাংগো লাভার`) — the site customers shop on.
React 19 + Vite + Tailwind + wouter, with a small Express server for local dev and a Vercel
serverless function for checkout.

- Live: https://mangoloverbd.vercel.app (Vercel project `mangoloverbd`)
- Deploys automatically from `main`

This is **not** the dashboard. The Merchant Suite / commerceos dashboard is a separate repository
and a separate Vercel project. They share one Supabase project, but this repo has **no Supabase
client and no database access** — it talks to the dashboard's public HTTP API only.

### The two-repo boundary (the single most important thing to understand)

| Concern | Owner |
|---|---|
| Storefront components, layout, CSS, copy, animations, fixed code assets | **This repo** → GitHub → Vercel |
| Products, prices, variants, stock, product images, orders, customers, shipping config | **Supabase, via the dashboard** |

Consequences:

- A design change here needs a commit and a Vercel deploy.
- A product/price/stock/image change does **not** touch this repo and does **not** need a redeploy —
  the storefront polls the Suite every 8 seconds and picks it up live.
- If a task is "add a product", "change a price", "fix the stock count", or "upload a product photo",
  it belongs in the dashboard. Say so; do not add hardcoded product data here.

---

## 2. Environment

Six variables. `.env` locally (gitignored), Vercel project settings for deploys. `.env.example` is
the committed template.

| Variable | Scope | Purpose |
|---|---|---|
| `VITE_MERCHANT_SUITE_URL` | client | Suite base URL for catalog reads. **Baked into the bundle at build time.** |
| `VITE_STOREFRONT_ID` | client | Fixed workspace id `3cd26e57-85ef-4970-94a4-cd99c0f1b554` |
| `MERCHANT_SUITE_URL` | server | Same URL, for the checkout POST |
| `CUSTOM_ORDERS_API_KEY` | server, **secret** | Order webhook auth; matches `<orgId>:custom_store_api_key` in the Suite's `app_settings` |
| `META_PIXEL_ID` | server, optional | Meta Conversions API |
| `META_ACCESS_TOKEN` | server, **secret**, optional | Meta Conversions API |

`VITE_`-prefixed values are compiled into public JavaScript and readable by anyone. Never move a
secret behind a `VITE_` prefix, and never read `CUSTOM_ORDERS_API_KEY` from client code.

Local dev points both URLs at `http://localhost:5002` (the Suite's dev port). The dev script loads
`.env` with Node's `--env-file-if-exists`; there is deliberately no `dotenv` dependency, and the
`-if-exists` variant is required because Vercel has no `.env` file and the strict flag would break
production builds.

**Vercel + localhost:** while the Suite runs locally, an ngrok tunnel bridges them, because Vercel's
serverless checkout posts from Vercel's infrastructure and cannot reach `localhost`. Free ngrok URLs
rotate on restart — update both Vercel env vars **and redeploy** (the client bundle bakes the URL in
at build time). Browser-side catalog reads can appear to work while checkout is silently broken, so
verify checkout specifically. See README "Verifying the connection" for the two curl commands.

---

## 3. How the connection works

**Catalog — browser → Suite, public and unauthenticated.**
`client/src/lib/storefront-products.ts` is the only place that talks to the catalog API. Base:
`${VITE_MERCHANT_SUITE_URL}/api/public/v1/storefronts/${VITE_STOREFRONT_ID}`.

- `fetchStorefrontProducts()` → `GET .../products`
- `fetchStorefrontProduct(slug)` → `GET .../products/:slug`
- `fetchStorefrontProductInventory(slug)` → `GET .../products/:slug/inventory`
- `STOREFRONT_POLL_INTERVAL_MS = 8000` — the live-sync interval
- `mergeInventory()` — overlays authoritative stock onto a cached product
- `isProductOrderable()` — the single sold-out check; use it, don't reimplement it

Add new Suite calls to this module. Do not scatter `fetch` calls to the Suite through components.
Requests send `ngrok-skip-browser-warning: true` so tunnels return JSON, not HTML.

**Checkout — storefront server → Suite, authenticated.**
`api/orders.ts` (Vercel) and `server/order-service.ts` (local Express) both POST to
`${MERCHANT_SUITE_URL}/api/custom-orders/webhook` with `x-api-key`. The Suite resolves the workspace
from the key and returns the canonical `order_id`; the order lands in the dashboard as
`source: custom_store`. Both paths must stay behaviourally identical — if you change the payload in
one, change it in the other.

**The storefront never sends a workspace/org id it was given by a visitor.** The workspace comes from
build-time config or from the API key, never from user input.

---

## 4. Layout and conventions

```
client/index.html                    title + OG/Twitter meta
client/public/                       static assets served at /
client/src/App.tsx                   routes (wouter)
client/src/pages/                    home.tsx  products.tsx  product.tsx  booking.tsx  not-found.tsx
client/src/components/layout.tsx     nav + footer (site chrome)
client/src/components/ui/            shadcn/ui
client/src/contexts/cart-context.tsx cart state
client/src/lib/storefront-products.ts   ← Suite API client
api/orders.ts                        Vercel serverless checkout
server/                              local Express
script/build.ts                      catalog prefetch → vite → esbuild
attached_assets/                     imported via @assets
```

Aliases: `@` → `client/src`, `@shared` → `shared`, `@assets` → `attached_assets`.

| Concern | This repo uses |
|---|---|
| Routing | **wouter** (`<Link href>`) — *not* React Router |
| Server state | TanStack Query v5 |
| Icons | **lucide-react** — *not* Phosphor |
| Animation | Framer Motion |
| Styling | Tailwind v4 + shadcn/ui |
| Currency | always `৳` |

The dashboard repo mandates React Router and Phosphor icons. Those rules **do not apply here**. Match
what this codebase already does.

---

## 5. Branding

| Asset | File | Wired into |
|---|---|---|
| Nav logo | `attached_assets/mango-lover-logo.avif` | `client/src/components/layout.tsx` |
| Hero poster | `client/public/hero-mango-lover.webp` | `client/src/pages/home.tsx` (~line 289) |
| Brand yellow | `#FBBB14` | hero background |
| Brand ink | `#163B33` | hero CTA |
| Wordmark | `ম্যাংগো লাভার - Mango Lover` | `layout.tsx` footer, `client/index.html` |

**The homepage hero is inline in `client/src/pages/home.tsx`.**
`client/src/components/hero.tsx` is **dead code** — nothing imports it. Editing it changes nothing on
the site. This has already caused one wasted round of work. Before editing any component, confirm
something imports it: `grep -rn "components/<name>" client/src`.

The hero poster is portrait with baked-in Bangla type, so it uses `object-contain` and no hover
scale — `object-cover` or a scale transform crops the lettering.

New images: optimize before committing. `cwebp -q 90` cut the hero from 2.1 MB to 231 KB with the
Bangla type still crisp. (`sips -s format webp` silently no-ops on this machine; use `cwebp`.)

Unfinished, safe to pick up: `client/index.html` still carries Stepprs meta descriptions,
`twitter:site` `@stepprs`, an `og:image` pointing at `/favicon.png`, and a `preconnect` to an
unrelated Supabase project. No loaded webfont has Bengali glyphs, so the Bangla wordmark falls back
to a system font — Hind Siliguri or Anek Bangla would fix it. `client/public/` also holds several MB
of orphaned hero images from the previous brand.

---

## 6. Verification

```bash
npm run check                                    # tsc, no emit
node --test client/src/pages/home.test.ts
node --test client/src/lib/storefront-products.test.ts
npm run build
```

Tests are `node:test` files asserting against **source text** — no vitest, no DOM. Any className or
copy change in `home.tsx` breaks the matching assertion. When that happens, **update the assertion to
describe the new markup**; do not revert the intended change to make a stale test pass. If a test was
already failing before your change, say so explicitly rather than quietly folding it into your work.

**Build-artifact hazard:** `script/build.ts` overwrites
`client/src/lib/generated-storefront-products.ts` with the live catalog. While the dashboard has no
published products, every build silently rewrites it to an empty array. Always `git status` after
building; `git checkout -- client/src/lib/generated-storefront-products.ts` if clobbered. Never commit
the emptied version.

No headless browser is installed (Playwright is present but has no browsers downloaded), so visual
changes cannot be screenshot-verified without installing Chromium first. Do not claim visual
confirmation you did not obtain. HMR log lines in the dev server output are useful evidence that the
file you edited is actually the one being rendered.

---

## 7. Hard Rules

1. **Never commit `.env`** or any file containing a secret. `.env` is gitignored — keep it that way.
2. **Never expose `CUSTOM_ORDERS_API_KEY`, `META_ACCESS_TOKEN`, or any Supabase service-role key to
   the client**, and never move one behind a `VITE_` prefix.
3. **No Supabase client and no direct database access in this repo.** Commerce data flows through the
   Suite's `/api/public/v1/...` endpoints. (A read-only publishable-key revision subscription is the
   only exception in the approved architecture — it does not exist here yet, and if it is added it is
   notification-only, never writes.)
4. **Never hardcode product, price, or stock data.** Those live in Supabase and are edited in the
   dashboard. Hardcoding them creates a second source of truth that will silently go stale.
5. **All Suite catalog calls go through `client/src/lib/storefront-products.ts`.**
6. **Never accept a workspace/org id from a visitor or URL.** It comes from build-time config or the
   API key.
7. **Use wouter for routing and lucide-react for icons.** Do not import React Router or Phosphor.
8. **Confirm a component is actually imported before editing it** (`hero.tsx` is dead code).
9. **Keep `api/orders.ts` and `server/order-service.ts` in sync** — Vercel and local dev use
   different checkout paths.
10. **Run `npm run check` and the `node --test` files before claiming done**, and check `git status`
    for a clobbered `generated-storefront-products.ts`.
11. **Do not create real orders in the dashboard for testing** without saying so and cleaning up after.
12. **Currency is `৳`**, never "BDT" or "Tk".

---

## 8. Working style

- State assumptions; ask when a request has two plausible readings.
- Smallest change that solves the problem. No speculative abstraction or configurability.
- Touch only what the task requires. Match the surrounding style even if you'd write it differently.
- Remove imports/variables your own change orphaned; leave pre-existing dead code alone but mention
  it (`hero.tsx` is a standing example).
- Every task gets a verifiable success criterion and a `→ verify:` step, not "make it work".
- Report outcomes faithfully: if a test fails, show the output; if you skipped a step, say so.
