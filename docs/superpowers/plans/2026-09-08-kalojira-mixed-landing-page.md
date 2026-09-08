# Kalojira Mixed Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and locally preview `/step/kalojira-mixed` as a dedicated Bengali Kalojira Mixed campaign page with live Merchant Suite pricing/inventory and the existing custom-order checkout flow.

**Architecture:** Add a self-contained `kalojira-mixed` feature directory modeled on the existing Sundarbans campaign. Keep campaign copy, state keys, analytics campaign name, confirmation page, and visual tokens separate, while sharing stable catalog helpers and the existing server-side order submission contract.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, wouter, TanStack Query v5, Framer Motion, lucide-react, Node `node:test` source assertions, Express/Vercel checkout endpoints.

## Global Constraints

- Use `/step/kalojira-mixed` and preserve `/step/sundarbans-natural-honey` unchanged.
- Product slug is `kalojira-mixed`; prices, stock, variants, and product identity come from the Merchant Suite public API.
- Do not hardcode prices, stock, or variant IDs; use `fetchStorefrontProduct`, `fetchStorefrontProductInventory`, `mergeInventory`, and the existing orderability rules.
- Use wouter for routing and lucide-react for icons in this repository.
- Use `৳` for currency and Bengali copy with light conversion-focused rewriting from the supplied PDF.
- Use supplied images as-is visually; optimize and rename only for web delivery.
- Omit product video and process/packing sections until assets exist.
- Demo reviews must visibly say `ডেমো রিভিউ — প্রকৃত গ্রাহক মতামত নয়`; never present invented testimonials as verified customer feedback.
- Never add Supabase access or secrets to the storefront; commerce data stays behind the Merchant Suite API.
- Run `npm run check`, relevant `node --test` files, and `npm run build` before completion.

---

## File map

### Create

- `client/src/pages/kalojira-mixed.tsx` — page data loading, campaign shell, checkout anchor, and sticky CTA.
- `client/src/pages/kalojira-mixed-thank-you.tsx` — campaign-specific confirmation page.
- `client/src/features/kalojira-mixed/content.ts` — Bengali copy and typed content arrays.
- `client/src/features/kalojira-mixed/campaign-layout.tsx` — campaign header/footer.
- `client/src/features/kalojira-mixed/documentary-sections.tsx` — hero, narrative, ingredient, expert, review, serving, FAQ, and order sections.
- `client/src/features/kalojira-mixed/kalojira-checkout.tsx` — live variant selection, customer form, validation, and order submission.
- `client/src/features/kalojira-mixed/order.ts` — pack extraction, totals, payload, and session confirmation under Kalojira-specific keys.
- `client/src/features/kalojira-mixed/checkout-state.ts` — unavailable/loading/error state resolution and field focus helpers.
- `client/src/features/kalojira-mixed/tracking.ts` — `kalojira_mixed` interaction and purchase markers.
- `client/src/features/kalojira-mixed/*.test.ts` — focused unit/source tests.
- `client/public/step/kalojira-mixed/*` — optimized copies of the seven supplied images.
- `client/src/features/kalojira-mixed/campaign.css` — campaign-only tokens and sticky bar styles, imported by `client/src/index.css` or the feature entrypoint.

### Modify

- `client/src/App.tsx` — import and register landing and thank-you routes before generic product routes; add page metadata titles.
- `client/src/index.css` — include only shared campaign font/sticky-bar selectors if feature CSS cannot be imported locally.
- `script/build.ts` — include `kalojira-mixed` in fallback slugs so a temporary catalog failure does not remove the page’s product fallback at build time.

---

## Task 1: Prepare campaign assets and failing asset/route tests

**Files:**
- Create: `client/public/step/kalojira-mixed/*.webp`
- Create: `client/src/pages/kalojira-mixed.test.ts`
- Create: `client/src/pages/kalojira-mixed-routing.test.ts`

**Interfaces:**
- Produces stable `/step/kalojira-mixed/` asset URLs consumed by the section components.

- [ ] **Step 1: Inspect and optimize each supplied image**

Use `cwebp` on the seven files from `/Users/noorkarimmehedi/Downloads/untitled folder 6`, preserving their appearance. Name the outputs:

```text
kalojira-mixed-hero-white-v1.webp
kalojira-mixed-ingredients-infographic-v1.webp
kalojira-mixed-hero-studio-v1.webp
kalojira-mixed-hero-plants-v1.webp
kalojira-mixed-product-in-hand-v1.webp
kalojira-mixed-ingredients-table-v1.webp
kalojira-mixed-expert-murad-parvez-v1.webp
```

- [ ] **Step 2: Write failing source assertions**

Assert that the page source contains the slug, product query, inventory query, merge call, and checkout anchor. Assert that the section source contains every asset filename, the demo-review disclosure, and no video/process section marker.

```ts
assert.match(pageSource, /const slug = "kalojira-mixed"/);
assert.match(pageSource, /fetchStorefrontProduct\(slug\)/);
assert.match(pageSource, /fetchStorefrontProductInventory\(slug\)/);
assert.match(pageSource, /id="kalojira-checkout"/);
```

- [ ] **Step 3: Run the focused tests and verify they fail**

Run: `node --test client/src/pages/kalojira-mixed.test.ts client/src/pages/kalojira-mixed-routing.test.ts`

Expected: FAIL because the new page and route do not exist yet.

- [ ] **Step 4: Commit the asset and test scaffolding**

```bash
git add client/public/step/kalojira-mixed client/src/pages/kalojira-mixed.test.ts client/src/pages/kalojira-mixed-routing.test.ts
git commit -m "feat: add Kalojira campaign assets and test scaffolding"
```

---

## Task 2: Add campaign content, order state, and tracking contracts

**Files:**
- Create: `client/src/features/kalojira-mixed/content.ts`
- Create: `client/src/features/kalojira-mixed/order.ts`
- Create: `client/src/features/kalojira-mixed/checkout-state.ts`
- Create: `client/src/features/kalojira-mixed/tracking.ts`
- Create: `client/src/features/kalojira-mixed/order.test.ts`
- Create: `client/src/features/kalojira-mixed/checkout-state.test.ts`
- Create: `client/src/features/kalojira-mixed/tracking.test.ts`

**Interfaces:**
- `getKalojiraPackOptions(product): KalojiraPackOption[]`
- `calculateKalojiraOrder(unitPrice, quantity): KalojiraOrderTotals`
- `buildKalojiraOrderPayload(input): KalojiraOrderPayload`
- `buildKalojiraOrderConfirmation(orderRef, payload): KalojiraOrderConfirmation`
- `writeKalojiraOrderConfirmation(storage, confirmation)` / `read...` / `clear...`
- `resolveKalojiraCheckoutStatus(input): KalojiraCheckoutStatus`
- `trackKalojiraCampaignEvent(event, parameters, target?)`
- `markKalojiraPurchaseTracked(storage, orderRef)`

- [ ] **Step 1: Write failing order tests**

Cover live variant conversion, exclusion of unavailable/zero-stock/malformed variants, quantity totals, ৳100 delivery behavior matching the existing campaign, valid payload fields, invalid customer input, and campaign-specific confirmation storage.

```ts
const product = {
  name: "কালোজিরা মিক্সড",
  slug: "kalojira-mixed",
  available: true,
  variants: [
    { id: "v500", attributes: { size: "৫০০ গ্রাম" }, price: 990, stock_quantity: 100 },
    { id: "v1kg", attributes: { size: "১ কেজি" }, price: 1600, stock_quantity: 100 },
  ],
};

assert.deepEqual(getKalojiraPackOptions(product), [
  { variantId: "v500", label: "৫০০ গ্রাম", unitPrice: 990 },
  { variantId: "v1kg", label: "১ কেজি", unitPrice: 1600 },
]);
assert.deepEqual(calculateKalojiraOrder(1600, 1), {
  unitPrice: 1600, quantity: 1, subtotal: 1600, deliveryCharge: 100, total: 1700,
});
```

- [ ] **Step 2: Run the tests and verify they fail**

Run: `node --test client/src/features/kalojira-mixed/order.test.ts client/src/features/kalojira-mixed/checkout-state.test.ts client/src/features/kalojira-mixed/tracking.test.ts`

Expected: FAIL because the modules and exports do not exist.

- [ ] **Step 3: Implement the contracts by adapting the tested Sundarbans primitives**

Keep the validation bounds and payload shape aligned with `sundarbans-honey/order.ts`, but use `KALOJIRA_*` constants and a `kalojira-mixed-order-confirmation-v1` storage key. Keep the tracking campaign value `kalojira_mixed` and a distinct purchase marker prefix.

- [ ] **Step 4: Run the tests and verify they pass**

Run the same focused command from Step 2. Expected: PASS.

- [ ] **Step 5: Commit the contracts**

```bash
git add client/src/features/kalojira-mixed
git commit -m "feat: add Kalojira campaign contracts"
```

---

## Task 3: Build the narrative sections and campaign styling

**Files:**
- Create: `client/src/features/kalojira-mixed/campaign-layout.tsx`
- Create: `client/src/features/kalojira-mixed/documentary-sections.tsx`
- Create: `client/src/features/kalojira-mixed/campaign.css`

**Interfaces:**
- `CampaignHeader` and `CampaignFooter` render campaign framing without normal storefront navigation.
- `DocumentarySections({ onOrderClick })` renders the complete narrative before checkout.

- [ ] **Step 1: Write failing section assertions**

Add source assertions for the required Bengali headings, all eight ingredient names, the expert name/credentials, the demo-review disclosure, FAQ ARIA behavior, CTA placement tracking, and the omission of video/process components.

- [ ] **Step 2: Run the new source test and verify it fails**

Run: `node --test client/src/pages/kalojira-mixed.test.ts`

Expected: FAIL on missing feature source.

- [ ] **Step 3: Implement the visual system**

Use the blueprint palette:

```css
--kalojira-orange: #E5672E;
--kalojira-cream: #FFF8EE;
--kalojira-brown: #3D211A;
--kalojira-green: #5B793E;
--kalojira-peach: #F0C5A5;
```

Implement the 55/45 hero, ingredient transparency section, alternating editorial sections, expert image crop, review cards with a disclosure banner, serving guidance, FAQ accordion, and CTA buttons. Use supplied assets with descriptive Bengali `alt` values, `loading="lazy"` below the hero, and reduced-motion handling.

- [ ] **Step 4: Run the section assertions and verify they pass**

Run: `node --test client/src/pages/kalojira-mixed.test.ts`

Expected: PASS for copy, assets, disclosure, and omitted sections.

- [ ] **Step 5: Commit the narrative UI**

```bash
git add client/src/features/kalojira-mixed client/src/pages/kalojira-mixed.test.ts
git commit -m "feat: build Kalojira campaign narrative"
```

---

## Task 4: Implement the live checkout and mobile order bar

**Files:**
- Create: `client/src/features/kalojira-mixed/kalojira-checkout.tsx`
- Create: `client/src/features/kalojira-mixed/mobile-order-bar.tsx`
- Create: `client/src/features/kalojira-mixed/kalojira-checkout.test.ts`

**Interfaces:**
- `KalojiraCheckout({ product, status, productQuery, inventoryQuery, onRetry })`
- `MobileOrderBar({ selectedPack, onOrderClick })`

- [ ] **Step 1: Write failing checkout source tests**

Assert that checkout renders live pack labels/prices, posts the existing payload through `apiRequest`, validates Bengali name/phone/address fields, supports quantity, exposes retry/support actions, writes a Kalojira confirmation, tracks campaign-specific events, and navigates to `/step/kalojira-mixed/thank-you` on success.

- [ ] **Step 2: Run the checkout test and verify it fails**

Run: `node --test client/src/features/kalojira-mixed/kalojira-checkout.test.ts`

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement checkout by preserving the existing order contract**

Use `apiRequest("POST", "/api/orders", payload)` exactly as the existing campaign does. Build payloads only from the selected live variant and validated form values. Use Bengali UI copy and the existing support phone/WhatsApp destination, but change the WhatsApp message to reference Kalojira Mixed.

- [ ] **Step 4: Add the sticky mobile bar**

Show the selected pack and live price, hide it on desktop, scroll to `#kalojira-checkout`, focus the checkout heading, and respect reduced motion.

- [ ] **Step 5: Run checkout tests and verify they pass**

Run the same focused command from Step 2. Expected: PASS.

- [ ] **Step 6: Commit checkout**

```bash
git add client/src/features/kalojira-mixed
git commit -m "feat: add Kalojira live checkout"
```

---

## Task 5: Wire routes, metadata, and thank-you flow

**Files:**
- Create: `client/src/pages/kalojira-mixed.tsx`
- Create: `client/src/pages/kalojira-mixed-thank-you.tsx`
- Modify: `client/src/App.tsx`
- Modify: `script/build.ts`
- Modify: `client/src/pages/kalojira-mixed-routing.test.ts`

**Interfaces:**
- `KalojiraMixedPage` loads the live product/inventory and composes the page.
- `KalojiraMixedThankYouPage` reads and clears only Kalojira confirmation storage.

- [ ] **Step 1: Write failing route assertions**

Assert thank-you route appears before landing route, landing route appears before generic product matching, page metadata contains both Kalojira paths, and `kalojira-mixed` is in the build fallback list.

- [ ] **Step 2: Run route tests and verify they fail**

Run: `node --test client/src/pages/kalojira-mixed-routing.test.ts`

Expected: FAIL because imports/routes are missing.

- [ ] **Step 3: Implement page composition**

Use the existing page query pattern:

```ts
const slug = "kalojira-mixed";
const productQuery = useQuery({
  queryKey: ["merchant-suite-product", slug],
  queryFn: () => fetchStorefrontProduct(slug),
  initialData: findGeneratedStorefrontProduct(generatedStorefrontProducts, slug) ?? undefined,
  refetchInterval: STOREFRONT_POLL_INTERVAL_MS,
});
```

Add the inventory query, `mergeInventory`, checkout status, campaign view tracking, and the campaign-specific thank-you route. Add Bengali metadata title strings in `App.tsx`.

- [ ] **Step 4: Add the build fallback slug**

Append `"kalojira-mixed"` to `fallbackSlugs` without changing existing fallback behavior.

- [ ] **Step 5: Run route tests and verify they pass**

Run the same focused command from Step 2. Expected: PASS.

- [ ] **Step 6: Commit route wiring**

```bash
git add client/src/pages/kalojira-mixed.tsx client/src/pages/kalojira-mixed-thank-you.tsx client/src/App.tsx script/build.ts client/src/pages/kalojira-mixed-routing.test.ts
git commit -m "feat: wire Kalojira campaign routes"
```

---

## Task 6: Run project checks and start the local preview

**Files:**
- Modify: only files required by failing checks or intended generated catalog refresh.

- [ ] **Step 1: Run focused tests**

Run:

```bash
node --test client/src/pages/kalojira-mixed.test.ts client/src/pages/kalojira-mixed-routing.test.ts client/src/features/kalojira-mixed/*.test.ts
```

Expected: all Kalojira tests pass.

- [ ] **Step 2: Run type checking and existing regression tests**

Run:

```bash
npm run check
node --test client/src/pages/sundarbans-honey.test.ts client/src/pages/sundarbans-honey-routing.test.ts
```

Expected: type check and existing Sundarbans tests pass.

- [ ] **Step 3: Build and inspect generated changes**

Run: `npm run build`

Expected: production build succeeds. Inspect `git status --short` and keep only the expected generated catalog/asset changes.

- [ ] **Step 4: Start the local storefront**

Run: `npm run dev`

Expected: local server starts using the repository’s configured port. Preview at `http://localhost:5002/step/kalojira-mixed` unless the command reports another port.

- [ ] **Step 5: Verify the page through the local response**

Check the route returns HTML and the dev server compiles the page without errors:

```bash
curl -I http://localhost:5002/step/kalojira-mixed
```

If browser tooling is connected, inspect the route at desktop and mobile widths and check the browser console. Do not create a real order while testing checkout.

- [ ] **Step 6: Report preview URL and verification results**

Include the local URL, exact commands run, and any browser limitation or API availability issue without claiming visual verification that was not performed.
