# Google Analytics and GTM Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install Google Tag Manager, direct GA4, and Mango Lover BD ecommerce events on the storefront.

**Architecture:** Keep third-party snippets in `client/index.html`. Put reusable ecommerce payload shaping in one client helper, then call it from product view, add-to-cart, checkout start, and successful checkout paths.

**Tech Stack:** React 19, Vite, TypeScript, wouter, node:test source/unit tests.

## Global Constraints

- Use GTM container `GTM-5KKTRHFD`.
- Use direct GA4 measurement ID `G-Q7J7KV6ZVC` because GA4 is not installed inside GTM.
- Do not expose server secrets or customer PII to analytics events.
- Currency code in analytics payloads is `BDT`; visible UI currency remains `৳`.
- Fire `purchase` only after the Suite-backed checkout request succeeds.

---

### Task 1: HTML snippets

**Files:**
- Modify: `client/index.html`
- Test: `client/src/pages/analytics-snippets.test.ts`

**Interfaces:**
- Consumes: GTM ID `GTM-5KKTRHFD`, GA4 ID `G-Q7J7KV6ZVC`.
- Produces: `window.dataLayer` and `window.gtag` for client event helpers.

- [ ] Write a source-text test that asserts GTM script, GTM noscript, and direct GA4 script are present.
- [ ] Run the test and confirm it fails because snippets are missing.
- [ ] Add the GTM script high in `<head>`, GA4 direct script after it, and the GTM noscript immediately after `<body>`.
- [ ] Re-run the test and confirm it passes.

### Task 2: Ecommerce event helper

**Files:**
- Create: `client/src/lib/google-analytics.ts`
- Test: `client/src/lib/google-analytics.test.ts`

**Interfaces:**
- Consumes: product/order data from React components.
- Produces: `trackGoogleEcommerceEvent(eventName, payload)` and `toGoogleAnalyticsItem(input)`.

- [ ] Write tests for flat dataLayer payloads matching the merchant team's requested shape: `event`, page metadata, `currency`, `value`, and `items`.
- [ ] Run the tests and confirm they fail because the helper does not exist.
- [ ] Implement the minimal helper that pushes a clean object to `window.dataLayer` and sends the same event through direct `gtag('event', ...)` when available.
- [ ] Re-run the helper tests and confirm they pass.

### Task 3: Wire storefront events

**Files:**
- Modify: `client/src/pages/product.tsx`
- Modify: `client/src/contexts/cart-context.tsx`
- Modify: `client/src/components/cart-drawer.tsx`
- Modify: `client/src/components/order-dialog.tsx`

**Interfaces:**
- Consumes: helper from Task 2.
- Produces: `view_item`, `add_to_cart`, `begin_checkout`, and `purchase` ecommerce events.

- [ ] Call `view_item` once per product slug after product data is available.
- [ ] Call `add_to_cart` after the cart item is accepted.
- [ ] Pass item-level analytics metadata into `OrderDialog` for direct product checkout and cart checkout.
- [ ] Call `begin_checkout` when `OrderDialog` opens.
- [ ] Call `purchase` only after `/api/orders` succeeds, using the returned order reference as `transaction_id`.
- [ ] Run `npm run check`, `node --test client/src/lib/google-analytics.test.ts`, `node --test client/src/pages/analytics-snippets.test.ts`, and the existing source tests.

## Self-review

- Spec coverage: GTM, direct GA4, and all four requested ecommerce events are covered.
- Placeholder scan: no TBD/TODO placeholders.
- Type consistency: `OrderDialogBundle.analyticsItems` is the bridge between product/cart callers and checkout events.
