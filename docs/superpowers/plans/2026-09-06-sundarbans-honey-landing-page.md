# Sundarbans Honey Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Bangla-first documentary landing page and thank-you page for Sundarbans Natural Honey that converts mobile ad traffic into cash-on-delivery orders without changing the existing product-page layout.

**Architecture:** Add two isolated wouter routes backed by the existing public catalog and inventory clients. Keep campaign copy, location lookup, checkout calculations, confirmation storage, and tracking policy in focused feature modules. Reuse both existing order handlers, extending their shared contract with `trackingMode: "google_only"` so campaign orders skip Meta while normal orders remain unchanged.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, wouter, TanStack Query v5, shadcn Command/Popover, lucide-react, Node test runner, Express, Vercel functions, existing GTM and GA4.

## Global constraints

- Routes: `/step/sundarbans-natural-honey/` and `/step/sundarbans-natural-honey/thank-you`.
- Accept the landing route with or without its trailing slash.
- Leave `/product/sundarbans-natural-honey` visually and behaviorally unchanged except for live price data.
- Product, prices, variants, stock, and product images remain authoritative in Merchant-Suite. Never hardcode production price or stock here.
- Authoritative prices become 500g at `৳800` and 1kg at `৳1,600`.
- Use Bangla-first copy, minimal English, wouter, lucide-react, and `৳`.
- Use `01301636461` for phone and WhatsApp.
- Delivery is flat `৳100`; payment is cash on delivery only.
- Show prices only in the embedded checkout.
- Reuse existing GTM and GA4. Install no new analytics tags.
- Emit no Meta Pixel/CAPI events for `/step/*` or campaign-originated orders. Preserve Meta elsewhere.
- Mark `/step/*` `noindex`; never add it to the sitemap.
- Fabricated origin evidence, endorsements, credentials, reviews, and scarcity are forbidden.
- Use versioned campaign-media filenames because Vercel image caching is immutable.
- Never create a real order without user approval and cleanup.
- Approved design: `docs/superpowers/specs/2026-09-06-sundarbans-honey-landing-page-design.md`.

## File map

**Create:**

- `client/src/lib/campaign-routes.ts` and `.test.ts`: Google-only route policy.
- `client/src/features/sundarbans-honey/content.ts`: approved copy and non-commerce constants.
- `client/src/features/sundarbans-honey/location-data.ts` and `.test.ts`: local bilingual district/upazila data.
- `client/src/features/sundarbans-honey/order.ts` and `.test.ts`: pure pack, total, address, payload, and confirmation helpers.
- `client/src/features/sundarbans-honey/tracking.ts` and `.test.ts`: campaign event wrapper and purchase dedupe.
- `client/src/features/sundarbans-honey/location-combobox.tsx`: accessible searchable selector.
- `client/src/features/sundarbans-honey/campaign-layout.tsx`: minimal header/footer.
- `client/src/features/sundarbans-honey/documentary-sections.tsx`: approved content flow.
- `client/src/features/sundarbans-honey/honey-checkout.tsx`: embedded checkout.
- `client/src/features/sundarbans-honey/mobile-order-bar.tsx`: mobile sticky actions.
- `client/src/pages/sundarbans-honey.tsx` and `.test.ts`: landing orchestration and source-level tests.
- `client/src/pages/sundarbans-honey-thank-you.tsx` and `.test.ts`: confirmation page.
- `client/src/pages/sundarbans-honey-routing.test.ts`: route and robots checks.
- `client/public/step/sundarbans-natural-honey/`: optimized campaign media and `ATTRIBUTION.md`.

**Modify:**

- `client/src/App.tsx`: campaign routes and Meta suppression.
- `client/src/index.css`, `client/index.html`: scoped campaign palette and Hind Siliguri.
- `client/src/lib/google-analytics.ts` and `.test.ts`: typed campaign interactions.
- `server/order-service.ts` and `.test.ts`, `server/routes.ts`: local campaign order behavior.
- `api/orders.ts` and `.test.ts`: matching Vercel behavior.
- `server/static.ts`, `vercel.json`: `/step/*` robots header.
- `client/src/lib/generated-storefront-products.ts`: production-build refresh only.

---

### Task 1: Update authoritative prices through Merchant-Suite

**Files:** No storefront source edits. Verify `client/src/lib/generated-storefront-products.ts` only after the final production build.

**Interfaces:**
- Consumes: authenticated Merchant-Suite Products UI.
- Produces: product `4d3a76b0-89e7-4601-96e5-86a3b971791c` at base/500g `800` and 1kg `1600`.

- [ ] **Step 1: Record the current public values**

```bash
curl -fsS 'https://admin.mangolover.com.bd/api/public/v1/storefronts/3cd26e57-85ef-4970-94a4-cd99c0f1b554/products/sundarbans-natural-honey' \
  | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const p=JSON.parse(s).product;console.log(JSON.stringify({price:p.price,variants:p.variants.map(v=>({id:v.id,size:v.attributes.size,price:v.price}))},null,2))})'
```

Expected before change: `750` for base/0.5KG and `1400` for 1KG.

- [ ] **Step 2: Edit through the dashboard write path**

In Merchant-Suite Products, save:

```text
Base selling price: 800
Variant 0.5KG: 800
Variant 1KG: 1600
```

Do not edit Supabase or the generated storefront snapshot from this repo. If no authenticated dashboard session is available, stop and ask the user to sign in.

- [ ] **Step 3: Verify the public result**

Repeat Step 1. Require:

```json
{"price":800,"variants":[{"id":"0bf1a8d5-ba53-4ad0-b336-7d32541c7582","size":"0.5KG","price":800},{"id":"801cde55-42ff-4a9e-aeee-eb02b23a8f8d","size":"1KG","price":1600}]}
```

- [ ] **Step 4: Verify the existing product page**

Open `/product/sundarbans-natural-honey`, wait for live revalidation, and confirm both prices. Do not create an order or change its layout.

---

### Task 2: Add campaign routing and robots policy

**Files:**
- Create: `client/src/lib/campaign-routes.ts`
- Create: `client/src/lib/campaign-routes.test.ts`
- Create: `client/src/pages/sundarbans-honey.tsx`
- Create: `client/src/pages/sundarbans-honey-thank-you.tsx`
- Create: `client/src/pages/sundarbans-honey-routing.test.ts`
- Modify: `client/src/App.tsx`
- Modify: `server/static.ts`
- Modify: `vercel.json`

**Interfaces:**
- Consumes: wouter location and existing Meta helpers.
- Produces: `isGoogleOnlyCampaignPath(pathname: string): boolean`, both routes, and `/step/*` noindex headers.

- [ ] **Step 1: Write failing route-policy tests**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { isGoogleOnlyCampaignPath } from "./campaign-routes.ts";

test("recognizes campaign paths", () => {
  assert.equal(isGoogleOnlyCampaignPath("/step/sundarbans-natural-honey"), true);
  assert.equal(isGoogleOnlyCampaignPath("/step/sundarbans-natural-honey/"), true);
  assert.equal(isGoogleOnlyCampaignPath("/step/sundarbans-natural-honey/thank-you"), true);
});

test("keeps normal routes outside the policy", () => {
  assert.equal(isGoogleOnlyCampaignPath("/product/sundarbans-natural-honey"), false);
  assert.equal(isGoogleOnlyCampaignPath("/products"), false);
});
```

In `sundarbans-honey-routing.test.ts`, read `App.tsx`, `server/static.ts`, and `vercel.json`. Assert both route strings exist, neither campaign page is wrapped in `Layout`, and both hosts set `X-Robots-Tag` on `/step/*`.

- [ ] **Step 2: Verify red**

```bash
node --test client/src/lib/campaign-routes.test.ts client/src/pages/sundarbans-honey-routing.test.ts
```

Expected: FAIL because the files and routes are absent.

- [ ] **Step 3: Implement campaign detection and route shells**

```ts
const CAMPAIGN_PREFIX = "/step/";
export function isGoogleOnlyCampaignPath(pathname: string) {
  return pathname === "/step" || pathname.startsWith(CAMPAIGN_PREFIX);
}
```

In `App.tsx`, derive `googleOnlyCampaign` from `location`. Call `initMetaPixel` and `trackMetaEvent(PageView)` only when false. Put the thank-you route before the landing route:

```tsx
<Route path="/step/sundarbans-natural-honey/thank-you">
  <PageTransition><SundarbansHoneyThankYouPage /></PageTransition>
</Route>
<Route path="/step/sundarbans-natural-honey">
  <PageTransition><SundarbansHoneyPage /></PageTransition>
</Route>
```

Each shell renders its own `<main>` without importing the full storefront `Layout`.

- [ ] **Step 4: Add noindex headers and SPA metadata cleanup**

Add this first Vercel header rule:

```json
{"source":"/step/(.*)","headers":[{"key":"X-Robots-Tag","value":"noindex, nofollow"}]}
```

In `server/static.ts`, set the same header for `req.path === "/step" || req.path.startsWith("/step/")`. Each page effect saves the old title/robots content, sets its Bangla title and `noindex, nofollow`, then restores old values on unmount.

- [ ] **Step 5: Verify and commit**

```bash
node --test client/src/lib/campaign-routes.test.ts client/src/pages/sundarbans-honey-routing.test.ts
npm run check
git add client/src/App.tsx client/src/lib/campaign-routes.ts client/src/lib/campaign-routes.test.ts \
  client/src/pages/sundarbans-honey.tsx client/src/pages/sundarbans-honey-thank-you.tsx \
  client/src/pages/sundarbans-honey-routing.test.ts server/static.ts vercel.json
git commit -m "feat: add Sundarbans honey campaign routes"
```

---

### Task 3: Add local Bangladesh location search

**Files:**
- Create: `client/src/features/sundarbans-honey/location-data.ts`
- Create: `client/src/features/sundarbans-honey/location-data.test.ts`
- Create: `client/src/features/sundarbans-honey/location-combobox.tsx`

**Interfaces:**
- Consumes: `nuhil/bangladesh-geocode` MIT district/upazila data; existing shadcn Command and Popover.
- Produces: `LocationOption`, `DISTRICTS`, `getUpazilas`, `searchLocations`, and `LocationCombobox`.

- [ ] **Step 1: Write failing data/component tests**

```ts
assert.equal(DISTRICTS.length, 64);
assert.ok(getUpazilas("47").some((item) => item.nameBn === "সাভার"));
assert.ok(searchLocations(DISTRICTS, "ঢাকা").some((item) => item.nameEn === "Dhaka"));
assert.ok(searchLocations(DISTRICTS, "dhaka").some((item) => item.nameBn === "ঢাকা"));
assert.deepEqual(getUpazilas("missing"), []);
```

Also read the component source and require visible label text, `CommandInput`, `CommandEmpty`, `CommandItem`, disabled state, `aria-invalid`, and `aria-describedby`.

- [ ] **Step 2: Verify red**

```bash
node --test client/src/features/sundarbans-honey/location-data.test.ts
```

- [ ] **Step 3: Vendor the minimal bilingual data**

Source:

```text
https://github.com/nuhil/bangladesh-geocode
districts/districts.json and upazilas/upazilas.json
MIT, Copyright (c) 2014 Nuhil Mehdy
```

Store only `id`, `district_id`, `bn_name`, and `name`, with trimmed names. Include all 64 districts and every listed upazila, grouped by district. Keep attribution in the source comment. Do not include coordinates, URLs, unions, or postcodes.

```ts
export type LocationOption = { id: string; nameBn: string; nameEn: string };
export const DISTRICTS: LocationOption[] = [
  { id: "47", nameBn: "ঢাকা", nameEn: "Dhaka" },
];
const UPAZILAS_BY_DISTRICT: Record<string, LocationOption[]> = {
  "47": [
    { id: "365", nameBn: "সাভার", nameEn: "Savar" },
    { id: "366", nameBn: "ধামরাই", nameEn: "Dhamrai" },
    { id: "367", nameBn: "কেরাণীগঞ্জ", nameEn: "Keraniganj" },
    { id: "368", nameBn: "নবাবগঞ্জ", nameEn: "Nawabganj" },
    { id: "369", nameBn: "দোহার", nameEn: "Dohar" },
  ],
};
```

The shown arrays demonstrate the exact normalized shape; complete them from the cited files rather than using runtime network calls.

- [ ] **Step 4: Implement lookup, search, and combobox**

Search normalized Bangla and English names. Unknown district returns `[]`. Component contract:

```ts
type LocationComboboxProps = {
  id: string;
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  emptyLabel: string;
  options: LocationOption[];
  value: string;
  disabled?: boolean;
  error?: string;
  onChange: (id: string) => void;
};
```

Render each option as `বাংলা নাম · English name`, use a 44px minimum trigger, and connect errors accessibly.

- [ ] **Step 5: Verify and commit**

```bash
node --test client/src/features/sundarbans-honey/location-data.test.ts
npm run check
git add client/src/features/sundarbans-honey/location-data.ts \
  client/src/features/sundarbans-honey/location-data.test.ts \
  client/src/features/sundarbans-honey/location-combobox.tsx
git commit -m "feat: add Bangladesh location search"
```

---

### Task 4: Add the campaign order domain and Google-only server contract

**Files:**
- Create: `client/src/features/sundarbans-honey/order.ts`
- Create: `client/src/features/sundarbans-honey/order.test.ts`
- Modify: `server/order-service.ts`
- Modify: `server/order-service.test.ts`
- Modify: `server/routes.ts`
- Modify: `api/orders.ts`
- Modify: `api/orders.test.ts`

**Interfaces:**
- Consumes: `StorefrontProduct`, live variants, both existing order handlers.
- Produces: `HoneyPackOption`, `HoneyOrderTotals`, `HoneyOrderPayload`, `HoneyOrderConfirmation`, and `trackingMode: "default" | "google_only"` in both server contracts.

- [ ] **Step 1: Write failing pure order tests**

Use this fixture only in tests:

```ts
const product = {
  id: "honey-id",
  slug: "sundarbans-natural-honey",
  name: "সুন্দরবনের চাকের মধু",
  price: 800,
  variants: [
    { id: "half", attributes: { size: "0.5KG" }, price: 800, available: true },
    { id: "one", attributes: { size: "1KG" }, price: 1600, available: true },
  ],
};
```

Require:

```ts
assert.deepEqual(getHoneyPackOptions(product).map(({ label, unitPrice }) => ({ label, unitPrice })), [
  { label: "0.5KG", unitPrice: 800 },
  { label: "1KG", unitPrice: 1600 },
]);
assert.deepEqual(calculateHoneyOrder(1600, 2), {
  unitPrice: 1600,
  quantity: 2,
  subtotal: 3200,
  deliveryCharge: 100,
  total: 3300,
});
assert.equal(buildHoneyAddress("বাড়ি ১২, রোড ৩", "ঢাকা", "সাভার"), "বাড়ি ১২, রোড ৩, সাভার, ঢাকা");
```

Also test unavailable/out-of-stock filtering, quantity below 1 rejection, `trackingMode: "google_only"` in the payload, malformed confirmation JSON returning `null`, and serialized confirmation excluding customer name, phone, and address.

- [ ] **Step 2: Write failing local/Vercel parity tests**

In both server suites require:

- `google_only` is accepted and preserved;
- omitted mode defaults to `default`;
- unknown mode is rejected;
- Google-only orders skip Purchase CAPI;
- Merchant-Suite non-2xx/network failure rejects Google-only orders instead of creating a false order number;
- default orders retain existing fallback behavior.

Export a pure decision helper from each server entry point:

```ts
export function shouldSendMetaPurchase(order: Pick<OrderRequest, "trackingMode">) {
  return order.trackingMode !== "google_only";
}
```

- [ ] **Step 3: Verify red**

```bash
node --test client/src/features/sundarbans-honey/order.test.ts \
  server/order-service.test.ts api/orders.test.ts
```

- [ ] **Step 4: Implement client order helpers**

```ts
export const HONEY_DELIVERY_CHARGE = 100;
export const HONEY_CONFIRMATION_KEY = "sundarbans-honey-order-confirmation-v1";

export type HoneyPackOption = {
  variantId: string;
  label: string;
  unitPrice: number;
};

export type HoneyOrderConfirmation = {
  orderRef: string;
  productName: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  deliveryCharge: 100;
  total: number;
};
```

Production prices come only from `StorefrontVariant.price`. Test fixtures may contain the approved values. Add functions for pack extraction, totals, combined address, order payload creation, confirmation write/read, and confirmation clearing.

- [ ] **Step 5: Extend both order validators**

Local schema:

```ts
trackingMode: z.enum(["default", "google_only"]).default("default")
```

Mirror explicit validation in `api/orders.ts`. While aligning the validators, require `/^\d{11}$/` for phone and at least three address words in Vercel just as local Express already does. Do not forward tracking mode to Merchant-Suite as order content.

- [ ] **Step 6: Suppress Meta and false confirmation for campaign orders**

Guard both Purchase CAPI calls with `shouldSendMetaPurchase`. In both forwarding implementations, rethrow Merchant-Suite failure for `google_only`; never generate a fallback reference for the campaign. Preserve default-order fallback semantics to avoid unrelated checkout changes.

- [ ] **Step 7: Verify and commit**

```bash
node --test client/src/features/sundarbans-honey/order.test.ts \
  server/order-service.test.ts api/orders.test.ts
npm run check
git add client/src/features/sundarbans-honey/order.ts \
  client/src/features/sundarbans-honey/order.test.ts \
  server/order-service.ts server/order-service.test.ts server/routes.ts \
  api/orders.ts api/orders.test.ts
git commit -m "feat: add Google-only campaign order flow"
```

---

### Task 5: Add typed GTM and GA4 campaign analytics

**Files:**
- Modify: `client/src/lib/google-analytics.ts`
- Modify: `client/src/lib/google-analytics.test.ts`
- Create: `client/src/features/sundarbans-honey/tracking.ts`
- Create: `client/src/features/sundarbans-honey/tracking.test.ts`

**Interfaces:**
- Consumes: existing `window.dataLayer`, `window.gtag`, and GA4 item helpers.
- Produces: `trackGoogleInteractionEvent`, `trackHoneyCampaignEvent`, and `markPurchaseTracked`.

- [ ] **Step 1: Write failing analytics tests**

Test this call:

```ts
trackGoogleInteractionEvent("landing_cta_click", {
  campaign: "sundarbans_natural_honey",
  placement: "hero",
}, target);
```

Require both data-layer and direct `gtag("event", ...)` output:

```ts
{
  event: "landing_cta_click",
  campaign: "sundarbans_natural_honey",
  placement: "hero",
}
```

Custom interaction names are `campaign_view`, `landing_cta_click`, `whatsapp_click`, `phone_click`, and `checkout_error`. Add `select_item` to `GoogleEcommerceEventName` and test pack selection through `trackGoogleEcommerceEvent("select_item", ...)` with the selected live variant, unit price, and quantity. Test dedupe:

```ts
assert.equal(markPurchaseTracked(storage, "MLB-123"), true);
assert.equal(markPurchaseTracked(storage, "MLB-123"), false);
assert.equal(markPurchaseTracked(storage, "MLB-124"), true);
```

- [ ] **Step 2: Verify red**

```bash
node --test client/src/lib/google-analytics.test.ts client/src/features/sundarbans-honey/tracking.test.ts
```

- [ ] **Step 3: Implement the generic interaction helper**

```ts
export type GoogleInteractionEventName =
  | "campaign_view"
  | "landing_cta_click"
  | "whatsapp_click"
  | "phone_click"
  | "checkout_error";

export function trackGoogleInteractionEvent(
  event: GoogleInteractionEventName,
  parameters: Record<string, string | number | boolean>,
  target?: GoogleAnalyticsWindow,
) {
  const browserTarget = getBrowserTarget(target);
  if (!browserTarget) return null;
  const payload = { event, ...parameters };
  browserTarget.dataLayer = browserTarget.dataLayer || [];
  browserTarget.dataLayer.push(payload);
  browserTarget.gtag?.("event", event, parameters);
  return payload;
}
```

- [ ] **Step 4: Add campaign wrapper and dedupe**

`trackHoneyCampaignEvent` always attaches `campaign: "sundarbans_natural_honey"`. `markPurchaseTracked` stores a versioned order-ref marker in session storage and returns false after the first mark. Pack changes use the GA4-recommended `select_item` event rather than a custom event. No event may include customer name, phone, street address, district, or upazila.

- [ ] **Step 5: Verify and commit**

```bash
node --test client/src/lib/google-analytics.test.ts client/src/features/sundarbans-honey/tracking.test.ts
npm run check
git add client/src/lib/google-analytics.ts client/src/lib/google-analytics.test.ts \
  client/src/features/sundarbans-honey/tracking.ts client/src/features/sundarbans-honey/tracking.test.ts
git commit -m "feat: add honey campaign analytics"
```

---

### Task 6: Build the embedded cash-on-delivery checkout

**Files:**
- Create: `client/src/features/sundarbans-honey/honey-checkout.tsx`
- Create: `client/src/pages/sundarbans-honey.test.ts`
- Modify: `client/src/pages/sundarbans-honey.tsx`

**Interfaces:**
- Consumes: storefront product/inventory clients, order helpers, location picker, `apiRequest`, wouter navigation, and campaign analytics.
- Produces: `HoneyCheckout` and a stored `HoneyOrderConfirmation` after success.

- [ ] **Step 1: Write failing checkout source tests**

Assert the page uses the fixed slug with `fetchStorefrontProduct`, `fetchStorefrontProductInventory`, `mergeInventory`, and `STOREFRONT_POLL_INTERVAL_MS`. Assert it does not contain production `unitPrice: 800` or `unitPrice: 1600` literals.

Assert `honey-checkout.tsx` contains quantity/size controls, both `LocationCombobox` fields, 11-digit English phone validation, `HONEY_DELIVERY_CHARGE`, `trackingMode: "google_only"`, `apiRequest("POST", "/api/orders", payload)`, a disabled pending submit, Bangla errors, cash-on-delivery copy, and no Dialog import.

- [ ] **Step 2: Verify red**

```bash
node --test client/src/pages/sundarbans-honey.test.ts
```

- [ ] **Step 3: Add product and inventory orchestration**

```tsx
const slug = "sundarbans-natural-honey";
const productQuery = useQuery({
  queryKey: ["merchant-suite-product", slug],
  queryFn: () => fetchStorefrontProduct(slug),
  refetchInterval: STOREFRONT_POLL_INTERVAL_MS,
});
const inventoryQuery = useQuery({
  queryKey: ["merchant-suite-inventory", slug],
  queryFn: () => fetchStorefrontProductInventory(slug),
  refetchInterval: STOREFRONT_POLL_INTERVAL_MS,
});
const product = mergeInventory(productQuery.data, inventoryQuery.data?.inventory);
```

Use the generated snapshot only through the same existing first-paint fallback pattern. Live data remains authoritative.

Render a compact skeleton while neither live nor generated product data is available. If the live product request fails and no safe fallback exists, show a Bangla retry action plus phone and WhatsApp ordering; do not render an orderable form with invented data. Once a product is available, emit one `view_item` event for the selected initial pack.

- [ ] **Step 4: Implement controlled fields and validation**

Start with the first orderable live pack and quantity 1. Changing district clears upazila. Emit `select_item` when the customer changes pack, and emit `begin_checkout` once on the first meaningful checkout interaction. Validate name at 2+ trimmed characters, phone as exactly 11 English digits, address at 3+ words, required district/upazila membership, positive whole quantity, and a currently orderable pack. Connect field errors with `aria-describedby` and add an `aria-live="polite"` summary.

- [ ] **Step 5: Revalidate availability before POST**

Await both query refetches, merge inventory, and find the selected variant ID again. If missing, unavailable, or stock `<= 0`, preserve input and show:

```text
এই প্যাকটি এখন অর্ডারের জন্য পাওয়া যাচ্ছে না। অন্য প্যাক বেছে নিন বা আমাদের কল করুন।
```

- [ ] **Step 6: Submit and handle failure**

Send combined address, aggregate subtotal as `bundlePrice`, quantity, delivery `100`, COD, and Google-only mode. Disable duplicate submissions while pending. On error, keep all input, track only `validation`, `availability`, or `network`, and offer retry, phone, and WhatsApp.

- [ ] **Step 7: Store safe confirmation and navigate**

After HTTP 201, store only `HoneyOrderConfirmation`, then:

```ts
setLocation("/step/sundarbans-natural-honey/thank-you");
```

Do not send `purchase` here; the thank-you page owns it.

- [ ] **Step 8: Verify and commit**

```bash
node --test client/src/features/sundarbans-honey/order.test.ts \
  client/src/features/sundarbans-honey/location-data.test.ts \
  client/src/pages/sundarbans-honey.test.ts
npm run check
git add client/src/features/sundarbans-honey/honey-checkout.tsx \
  client/src/pages/sundarbans-honey.tsx client/src/pages/sundarbans-honey.test.ts
git commit -m "feat: add embedded honey checkout"
```

---

### Task 7: Implement the thank-you page and one-time purchase event

**Files:**
- Modify: `client/src/pages/sundarbans-honey-thank-you.tsx`
- Create: `client/src/pages/sundarbans-honey-thank-you.test.ts`

**Interfaces:**
- Consumes: confirmation read/clear helpers, `markPurchaseTracked`, `trackGoogleEcommerceEvent`, and `toGoogleAnalyticsItem`.
- Produces: honest confirmation UI and one GA4 purchase per order reference.

- [ ] **Step 1: Write failing thank-you tests**

Require source that reads only versioned session confirmation; displays order ref, pack, quantity, subtotal, delivery, and total; never displays customer PII; calls `markPurchaseTracked` before `trackGoogleEcommerceEvent("purchase", ...)`; includes transaction ID, `shipping: 100`, unit price and quantity; links direct visitors back to the landing page; includes phone/WhatsApp support; and restores metadata on unmount.

- [ ] **Step 2: Verify red**

```bash
node --test client/src/pages/sundarbans-honey-thank-you.test.ts
```

- [ ] **Step 3: Render safe direct-visit and confirmed states**

Direct visit copy:

```text
কোনো সাম্প্রতিক অর্ডারের তথ্য পাওয়া যায়নি।
```

Confirmed copy:

```text
আপনার অর্ডারটি গ্রহণ করা হয়েছে
অর্ডার নম্বর: {orderRef}
অর্ডার নিশ্চিত করতে আমাদের টিম আপনাকে ফোন করতে পারে।
```

Display only the non-sensitive summary. Never synthesize an order number.

- [ ] **Step 4: Track purchase once**

Only when `markPurchaseTracked(sessionStorage, orderRef)` returns true, emit `purchase` with `pageType: "thank_you"`, `transactionId`, `value: total`, `shipping: deliveryCharge`, and one GA4 item containing unit price and quantity.

- [ ] **Step 5: Verify and commit**

```bash
node --test client/src/pages/sundarbans-honey-thank-you.test.ts \
  client/src/features/sundarbans-honey/tracking.test.ts
npm run check
git add client/src/pages/sundarbans-honey-thank-you.tsx \
  client/src/pages/sundarbans-honey-thank-you.test.ts
git commit -m "feat: add honey order thank-you page"
```

---

### Task 8: Build the documentary page and add approved media

**Files:**
- Create: `client/src/features/sundarbans-honey/content.ts`
- Create: `client/src/features/sundarbans-honey/campaign-layout.tsx`
- Create: `client/src/features/sundarbans-honey/documentary-sections.tsx`
- Create: `client/src/features/sundarbans-honey/mobile-order-bar.tsx`
- Modify: `client/src/pages/sundarbans-honey.tsx`
- Modify: `client/src/pages/sundarbans-honey.test.ts`
- Modify: `client/src/index.css`
- Modify: `client/index.html`
- Add: `client/public/step/sundarbans-natural-honey/`

**Interfaces:**
- Consumes: live product image, `onOrderClick(placement)`, `HoneyCheckout`, supplied authentic media, and existing logo.
- Produces: approved narrative, minimal chrome, manual video, and mobile sticky actions.

- [ ] **Step 1: Request the needed originals from the user**

Ask for:

```text
1. Sundarbans river/forest hero original, at least 2400px wide
2. Real natural hive photo
3. Real honey collection photo
4. Real collection video, highest-quality original
5. Murad Parvez portrait plus permission for statement/credentials
6. Three or four genuine reviews plus display permission
7. Four lifestyle and four serving images if image-led cards are desired
```

Do not generate proof-like substitutes. Semantic layout can proceed while waiting, but the page is not shippable without authentic proof assets.

- [ ] **Step 2: Write failing content/structure assertions**

Require these strings:

```text
সুন্দরবনের গভীর থেকে সংগ্রহ করা প্রকৃতির অনন্য উপহার
কেন সুন্দরবনের চাকের মধু বিশেষ?
পরিবারের কারা খেতে পারেন?
যেভাবে খেতে পারেন
সুন্দরবন থেকে আপনার ঘরে
পুষ্টিবিদের বক্তব্য
কেন ম্যাংগো লাভার?
গুরুত্বপূর্ণ তথ্য
সুন্দরবনের প্রাকৃতিক চাকের মধু অর্ডার করুন
এক বছরের কম বয়সী শিশুকে মধু দেওয়া যাবে না।
```

Also require no visible price outside `HoneyCheckout`, no autoplay, lazy below-fold images, `preload="none"` video, tel/WhatsApp header links, and three accessible sticky actions.

- [ ] **Step 3: Verify red**

```bash
node --test client/src/pages/sundarbans-honey.test.ts
```

- [ ] **Step 4: Add approved Bangla content as typed data**

```ts
export const heroPoints = [
  "প্রাকৃতিক মৌচাক থেকে সংগ্রহ",
  "সুন্দরবনের নানা বুনো ফুলের নেকটার",
  "স্বতন্ত্র স্বাদ, ঘ্রাণ ও প্রাকৃতিক রং",
  "পরিচ্ছন্নভাবে সংগ্রহ ও বোতলজাত",
  "সারা বাংলাদেশে হোম ডেলিভারি",
];

export const importantNotes = [
  { tone: "warning", text: "এক বছরের কম বয়সী শিশুকে মধু দেওয়া যাবে না।" },
  { tone: "warning", text: "ডায়াবেটিস বা রক্তে শর্করার সমস্যা থাকলে চিকিৎসক বা পুষ্টিবিদের পরামর্শ নিন।" },
  { tone: "info", text: "সরাসরি রোদ থেকে দূরে, স্বাভাবিক তাপমাত্রায় রাখুন।" },
  { tone: "info", text: "ফুল ও ঋতুভেদে প্রাকৃতিক মধুর রং, স্বাদ ও ঘনত্ব কিছুটা বদলাতে পারে।" },
  { tone: "info", text: "মধু দানাদার বা জমাট বাঁধা একটি স্বাভাবিক প্রাকৃতিক প্রক্রিয়া হতে পারে।" },
];
```

Use this approved nutritionist statement:

```text
মধু কোনো রোগের ওষুধ নয়। তবে সুষম খাদ্যাভ্যাসের অংশ হিসেবে পরিমিত মধু প্রাকৃতিক শক্তির একটি সহজ উৎস হতে পারে। এতে বিভিন্ন প্রাকৃতিক অ্যান্টিঅক্সিডেন্ট যৌগও পাওয়া যায়। শিশু, কর্মজীবী মানুষ ও বয়স্ক ব্যক্তি সবাই বয়স ও শারীরিক অবস্থা অনুযায়ী পরিমিত পরিমাণে মধু গ্রহণ করতে পারেন। পণ্য বিক্রির পাশাপাশি গ্রাহককে সঠিক তথ্য জানানোও আমাদের দায়িত্ব।
```

List Murad Parvez's supplied credentials exactly. Do not infer honorifics or medical qualifications.

- [ ] **Step 5: Build minimal layout and editorial sections**

Use `@assets/mango-lover-logo.avif`. Header URLs:

```tsx
<a href="tel:+8801301636461" aria-label="ফোনে অর্ডার করুন">...</a>
<a href="https://wa.me/8801301636461?..." aria-label="WhatsApp-এ অর্ডার করুন">...</a>
```

Do not import full `Layout`, cart, search, menu, countdown, or storefront bottom nav. Use semantic sections in the approved order. Emit `campaign_view` once on page mount. Every CTA calls `onOrderClick` with a stable placement and emits `landing_cta_click`; phone and WhatsApp links emit their corresponding custom events. Scroll with reduced-motion awareness and focus a `tabIndex={-1}` checkout heading after scrolling.

- [ ] **Step 6: Process and document authentic media**

Versioned outputs:

```text
sundarbans-river-hero-v1.webp
sundarbans-hive-v1.webp
sundarbans-collection-v1.webp
sundarbans-collection-poster-v1.webp
sundarbans-collection-v1.mp4
sundarbans-collection-v1.webm
nutritionist-murad-parvez-v1.webp
review-01-v1.webp through review-04-v1.webp
```

Commands:

```bash
cwebp -q 86 -metadata none input.jpg -o output-v1.webp
ffmpeg -i input.mov -vf "scale='min(1280,iw)':-2" -c:v libx264 -crf 24 -preset slow -movflags +faststart -an sundarbans-collection-v1.mp4
ffmpeg -i input.mov -vf "scale='min(1280,iw)':-2" -c:v libvpx-vp9 -crf 34 -b:v 0 -an sundarbans-collection-v1.webm
ffmpeg -ss 00:00:01 -i input.mov -frames:v 1 -vf "scale='min(960,iw)':-2" poster.png
cwebp -q 82 -metadata none poster.png -o sundarbans-collection-poster-v1.webp
```

Record source, permission, edits, and generation status in `ATTRIBUTION.md`. Never commit private/unredacted review material. Transcribe the approved review text into accessible HTML beside each screenshot, preserving the customer's meaning and redacting private data. Use the live Supabase product image instead of duplicating a catalog photo in `client/public`.

- [ ] **Step 7: Wire fast, accessible media**

Use `<picture>` for mobile/desktop hero crops when supplied. All below-fold images need dimensions, `loading="lazy"`, and `decoding="async"`. Video:

```tsx
<video controls playsInline preload="none" poster="/step/sundarbans-natural-honey/sundarbans-collection-poster-v1.webp">
  <source src="/step/sundarbans-natural-honey/sundarbans-collection-v1.webm" type="video/webm" />
  <source src="/step/sundarbans-natural-honey/sundarbans-collection-v1.mp4" type="video/mp4" />
</video>
```

- [ ] **Step 8: Add scoped typography and responsive polish**

Append Hind Siliguri to the existing Google Fonts request and apply it only under `.sundarbans-honey-page`. Add scoped forest, honey, brown, and cream variables without changing global tokens. Build mobile first. The sticky bar uses `env(safe-area-inset-bottom)` and hides while the checkout submit area is visible.

- [ ] **Step 9: Verify and commit**

```bash
node --test client/src/pages/sundarbans-honey.test.ts
find client/public/step/sundarbans-natural-honey -maxdepth 1 -type f -print0 | xargs -0 ls -lh
npm run check
git add client/src/features/sundarbans-honey/content.ts \
  client/src/features/sundarbans-honey/campaign-layout.tsx \
  client/src/features/sundarbans-honey/documentary-sections.tsx \
  client/src/features/sundarbans-honey/mobile-order-bar.tsx \
  client/src/pages/sundarbans-honey.tsx client/src/pages/sundarbans-honey.test.ts \
  client/src/index.css client/index.html client/public/step/sundarbans-natural-honey
git commit -m "feat: build Sundarbans honey documentary page"
```

---

### Task 9: Run regression checks, browser QA, and snapshot refresh

**Files:**
- Modify if generated: `client/src/lib/generated-storefront-products.ts`
- Test: all focused new and existing tests.

**Interfaces:**
- Consumes: all prior tasks and live Merchant-Suite catalog.
- Produces: verified production build and updated first-paint snapshot.

- [ ] **Step 1: Run focused automated tests**

```bash
node --test \
  client/src/lib/campaign-routes.test.ts \
  client/src/lib/google-analytics.test.ts \
  client/src/features/sundarbans-honey/location-data.test.ts \
  client/src/features/sundarbans-honey/order.test.ts \
  client/src/features/sundarbans-honey/tracking.test.ts \
  client/src/pages/sundarbans-honey-routing.test.ts \
  client/src/pages/sundarbans-honey.test.ts \
  client/src/pages/sundarbans-honey-thank-you.test.ts \
  client/src/pages/product.test.ts \
  client/src/pages/google-analytics-wiring.test.ts \
  server/order-service.test.ts \
  api/orders.test.ts
```

- [ ] **Step 2: Run type checking and production build**

```bash
npm run check
NODE_ENV=production npm run build
```

Expected: both pass; build refreshes the generated product snapshot from the live API.

- [ ] **Step 3: Inspect generated data before staging**

```bash
git diff -- client/src/lib/generated-storefront-products.ts
```

Require honey base/0.5KG `800` and 1KG `1600`. If unrelated catalog changes appear, inspect the live API and ask before committing. Never hand-edit generated data.

- [ ] **Step 4: Verify routes and robots output**

```bash
curl -I http://127.0.0.1:5003/step/sundarbans-natural-honey/
curl -I http://127.0.0.1:5003/step/sundarbans-natural-honey/thank-you
grep -F '/step/' dist/public/sitemap.xml && exit 1 || true
```

Both pages must resolve with `X-Robots-Tag: noindex, nofollow`; neither belongs in the sitemap.

- [ ] **Step 5: Run browser QA without submitting**

At small mobile, tablet, and desktop widths verify minimal header, documentary hierarchy, contrast, CTA scroll/focus, sticky safety, correct contact URLs, bilingual location search, district-dependent upazilas, live pack totals, unavailable state, form validation/state preservation, direct thank-you fallback, no Meta events/network calls, PII-free Google events, and a clean console.

- [ ] **Step 6: Test one real order only after explicit approval**

If approved, create one clearly marked test order, verify Merchant-Suite receipt and one GA4 purchase, refresh to prove no duplicate, then delete/cancel the test order.

- [ ] **Step 7: Run required reviews**

Invoke `design-review`, `review`, and `verification-before-completion`. Fix findings and rerun affected checks.

- [ ] **Step 8: Commit generated/final changes**

```bash
git add client/src/lib/generated-storefront-products.ts
git add -u
git commit -m "chore: refresh honey campaign catalog snapshot"
```

Skip an empty commit. Report exact checks, browser widths, whether a real order was created, remaining asset approvals, and final `git status --short`.
