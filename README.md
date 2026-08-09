# Storefront Template

Multi-tenant React storefront for [Merchant-Suite](https://merchant-suite.online). Each merchant gets a handle-based storefront that fetches products, branding, and shipping zones from the Merchant-Suite public API.

Orders are submitted directly to `POST /api/public/v1/:handle/orders` — no server proxy needed.

## Quick Start

```bash
npm install
cp .env.example .env
# Edit .env — set VITE_STOREFRONT_HANDLE to your merchant handle
npm run dev
```

Open `http://localhost:5000?handle=your-store` to see your storefront.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_STOREFRONT_HANDLE` | Yes | Your merchant handle (claimed via Merchant-Suite dashboard) |
| `VITE_API_URL` | No | API base URL (defaults to `https://merchant-suite.online`) |
| `VITE_META_PIXEL_ID` | No | Meta Pixel ID for client-side tracking |
| `VITE_BKASH_NUMBER` | No | bKash number — enables bKash payment option in checkout |
| `META_PIXEL_ID` | No | Server-side Meta Pixel ID (for CAPI events) |
| `META_CAPI_ACCESS_TOKEN` | No | Meta CAPI access token |
| `PORT` | No | Dev server port (default: 5000) |

## Local Development

The storefront handle can be set in three ways (in priority order):

1. **Query parameter** — `?handle=your-store` (highest priority, for local dev)
2. **Environment variable** — `VITE_STOREFRONT_HANDLE=your-store`
3. **Error** — if neither is set, the app shows a configuration error

This means you can develop locally without setting env vars:
```
http://localhost:5000?handle=stepprs
```

## Architecture

- **Config** — `client/src/lib/config.ts` resolves handle + API base URL
- **StorefrontProvider** — `client/src/contexts/storefront-context.tsx` fetches config and provides branding data to all components
- **API layer** — `client/src/lib/storefront-products.ts` handles all public API calls
- **Cart** — `client/src/contexts/cart-context.tsx` manages cart state with handle-scoped localStorage

### Public API Endpoints Used

| Endpoint | Purpose |
|---|---|
| `GET /api/public/v1/:handle/config` | Store branding, colors, shipping zones |
| `GET /api/public/v1/:handle/products` | Product catalog |
| `GET /api/public/v1/:handle/products/:slug` | Single product detail |
| `GET /api/public/v1/:handle/inventory` | Stock levels |
| `POST /api/public/v1/:handle/orders` | Order submission (COD) |

## Deployment

Deploy on Vercel. Set `VITE_STOREFRONT_HANDLE` and `VITE_API_URL` as environment variables in the Vercel dashboard.

```bash
npm run build
```

The build produces a static SPA (client) + serverless functions (Meta CAPI proxy).
