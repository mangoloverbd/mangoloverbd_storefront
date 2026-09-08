# Honey Nut Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an isolated `/step/honey-nut` Bengali campaign page with supplied Honey Nut imagery, live Merchant Suite variants/inventory, and the existing Kalojira-style COD conversion flow.

**Architecture:** Create a self-contained `honey-nut` feature directory modeled on `kalojira-mixed`; keep Honey Nut copy, storage keys, tracking campaign, checkout, thank-you state, and visual tokens isolated. Reuse stable storefront catalog helpers, the existing testimonials presentation, and the existing Murad Parvez portrait without modifying Kalojira behavior.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, wouter, TanStack Query v5, Framer Motion, lucide-react, Embla Carousel, Node `node:test` source assertions, Express/Vercel checkout endpoint.

## Global Constraints

- Use `/step/honey-nut`; preserve `/step/kalojira-mixed` and `/step/sundarbans-natural-honey` unchanged.
- Product slug is `honey-nut`; prices, stock, variants, and product identity come from the Merchant Suite public API.
- Do not hardcode stock or variant IDs; use `fetchStorefrontProduct`, `fetchStorefrontProductInventory`, `mergeInventory`, and existing orderability rules.
- Use the existing storefront routing conventions (`wouter`) and icon library (`lucide-react`).
- Use `৳` for all customer-facing currency and the Honey Nut Bengali copy from the approved guide.
- Use a fixed ৳100 home-delivery charge in the Honey Nut order calculation.
- Reuse the existing Murad Parvez portrait and `TestimonialsSection`/approved Kalojira review presentation; do not invent additional reviews or medical claims.
- Keep commerce access behind the existing Merchant Suite API; add no Supabase client or secret.
- Use descriptive, versioned WebP asset names under `client/public/step/honey-nut/`.
- Run focused Node tests, `npm run check`, and `npm run build` before completion.

---

## File map

### Create

- `client/src/pages/honey-nut.tsx` — live product queries, page composition, checkout anchor, CTA scrolling, and campaign view tracking.
- `client/src/pages/honey-nut-thank-you.tsx` — Honey Nut confirmation page and purchase tracking.
- `client/src/pages/honey-nut.test.ts` — page/section/asset source assertions.
- `client/src/pages/honey-nut-routing.test.ts` — route ordering, metadata, and build fallback assertions.
- `client/src/features/honey-nut/content.ts` — Bengali copy, nine ingredients, nutrition cards, FAQ, routine, quality, and campaign contact constants.
- `client/src/features/honey-nut/campaign-layout.tsx` — Honey Nut header/footer.
- `client/src/features/honey-nut/documentary-sections.tsx` — hero, nutrition, ingredients, trust, gallery, routine, quality, reviews, FAQ, and CTA sections.
- `client/src/features/honey-nut/campaign.css` — Honey Nut scoped tokens and campaign-only rules.
- `client/src/features/honey-nut/honey-nut-checkout.tsx` — live variant selection, validation, totals, COD submission, and support recovery.
- `client/src/features/honey-nut/honey-nut-checkout.test.ts` — checkout source assertions.
- `client/src/features/honey-nut/order.ts` — live pack extraction, ৳100 totals, payload, and Honey Nut confirmation storage.
- `client/src/features/honey-nut/order.test.ts` — order calculation and storage tests.
- `client/src/features/honey-nut/checkout-state.ts` — checkout status and focus helpers.
- `client/src/features/honey-nut/checkout-state.test.ts` — state and focus tests.
- `client/src/features/honey-nut/tracking.ts` — `honey_nut` campaign events and purchase marker.
- `client/src/features/honey-nut/tracking.test.ts` — campaign tracking tests.
- `client/src/features/honey-nut/mobile-order-bar.tsx` — mobile sticky order CTA.
- `client/public/step/honey-nut/*.webp` — optimized copies of the supplied Honey Nut photos.

### Modify

- `client/src/App.tsx` — import Honey Nut pages, add metadata titles, and register thank-you before landing route.
- `script/build.ts` — add `honey-nut` to fallback slugs.

---

## Task 1: Prepare Honey Nut assets and failing page/route tests

**Files:**
- Create: `client/public/step/honey-nut/*.webp`
- Create: `client/src/pages/honey-nut.test.ts`
- Create: `client/src/pages/honey-nut-routing.test.ts`

**Interfaces:** Produces stable `/step/honey-nut/` asset URLs and source-test expectations before page implementation.

- [ ] **Step 1: Inspect and convert the supplied photos**

Review the 19 JPEGs in `/Users/noorkarimmehedi/Downloads/untitled folder 7`, then convert the selected files with `cwebp -q 86`. Use these exact destination names:

```text
honey-nut-hero-v1.webp
honey-nut-nutrition-flatlay-v1.webp
honey-nut-ingredient-honey-v1.webp
honey-nut-ingredient-almond-v1.webp
honey-nut-ingredient-cashew-v1.webp
honey-nut-ingredient-walnut-v1.webp
honey-nut-ingredient-pistachio-v1.webp
honey-nut-ingredient-thai-almond-v1.webp
honey-nut-ingredient-sunflower-seed-v1.webp
honey-nut-ingredient-black-raisin-v1.webp
honey-nut-ingredient-white-sesame-v1.webp
honey-nut-gallery-open-jar-v1.webp
honey-nut-gallery-spoon-v1.webp
honey-nut-gallery-mix-v1.webp
honey-nut-routine-v1.webp
honey-nut-quality-packaging-v1.webp
```

If a supplied photo has no exact role, use it only as a close-up/gallery image rather than inventing a lifestyle or packaging scene. Keep original aspect ratio and do not overwrite an existing immutable asset.

- [ ] **Step 2: Write failing page assertions**

Create `honey-nut.test.ts` with `node:assert/strict`, `node:fs`, and `node:test`. Assert the future page source contains the exact slug, product/inventory queries, `mergeInventory`, `id="honey-nut-checkout"`, and all 16 destination filenames. Assert `content.ts` contains all nine ingredient labels and `মুরাদ পারভেজ`.

```ts
assert.match(pageSource, /const slug = "honey-nut"/);
assert.match(pageSource, /fetchStorefrontProduct\(slug\)/);
assert.match(pageSource, /fetchStorefrontProductInventory\(slug\)/);
assert.match(pageSource, /id="honey-nut-checkout"/);
for (const asset of requiredAssets) assert.match(sectionsSource, new RegExp(asset.replaceAll(".", "\\.")));
for (const ingredient of ingredients) assert.ok(contentSource.includes(ingredient), `missing ingredient: ${ingredient}`);
```

- [ ] **Step 3: Write failing route assertions**

Assert that `/step/honey-nut/thank-you` appears before `/step/honey-nut`, both precede generic product matching, both metadata titles exist, and `"honey-nut"` appears in `script/build.ts`.

- [ ] **Step 4: Run the new tests and verify they fail**

```bash
node --test client/src/pages/honey-nut.test.ts client/src/pages/honey-nut-routing.test.ts
```

Expected: FAIL because the Honey Nut page, feature files, and routes do not yet exist.

- [ ] **Step 5: Commit the assets and test scaffolding**

```bash
git add client/public/step/honey-nut client/src/pages/honey-nut.test.ts client/src/pages/honey-nut-routing.test.ts
git commit -m "feat: add Honey Nut campaign assets and test scaffolding"
```

---

## Task 2: Add Honey Nut content, order contracts, state, and tracking

**Files:**
- Create: `client/src/features/honey-nut/content.ts`, `order.ts`, `checkout-state.ts`, `tracking.ts`
- Create: `client/src/features/honey-nut/order.test.ts`, `checkout-state.test.ts`, `tracking.test.ts`

**Interfaces:**
- `getHoneyNutPackOptions(product): HoneyNutPackOption[]`
- `calculateHoneyNutOrder(unitPrice, quantity): HoneyNutOrderTotals`
- `buildHoneyNutOrderPayload(input): HoneyNutOrderPayload`
- `buildHoneyNutOrderConfirmation(orderRef, payload): HoneyNutOrderConfirmation`
- `writeHoneyNutOrderConfirmation(storage, confirmation)`, `readHoneyNutOrderConfirmation`, and `clearHoneyNutOrderConfirmation`
- `resolveHoneyNutCheckoutStatus(input): HoneyNutCheckoutStatus`
- `trackHoneyNutCampaignEvent(event, parameters, target?)`
- `markHoneyNutPurchaseTracked(storage, orderRef)`

- [ ] **Step 1: Write failing order and state tests**

Use a fixture with `honey-nut`, `v500` at ৳650, and `v1kg` at ৳1,200. Test extraction, rejection of unavailable/zero-stock/malformed variants, valid COD payload fields, invalid customer input, storage key isolation, state transitions, first-invalid-field order, and tracking without customer data.

```ts
assert.deepEqual(calculateHoneyNutOrder(1200, 1), {
  unitPrice: 1200,
  quantity: 1,
  subtotal: 1200,
  deliveryCharge: 100,
  total: 1300,
});
```

- [ ] **Step 2: Run the focused tests and verify they fail**

```bash
node --test client/src/features/honey-nut/order.test.ts client/src/features/honey-nut/checkout-state.test.ts client/src/features/honey-nut/tracking.test.ts
```

Expected: FAIL because the Honey Nut modules and exports do not exist.

- [ ] **Step 3: Implement the order contract**

Adapt the existing Kalojira order contract with these constants:

```ts
export const HONEY_NUT_DELIVERY_CHARGE = 100;
export const HONEY_NUT_CONFIRMATION_KEY = "honey-nut-order-confirmation-v1";
```

Preserve safe integer bounds, 1–100 quantity limits, product/variant/name/phone/address validation, `paymentMethod: "cash_on_delivery"`, and `trackingMode: "google_only"`. Validate the confirmation before writing it to storage.

- [ ] **Step 4: Implement state, content, and tracking**

Export typed arrays for the nine ingredients, four nutrition cards, eight ingredient-story entries, four routine cards, quality checklist, FAQ, allergy/storage notes, and footer details. Use the guide’s responsible framing: Honey Nut is a food combination, not medicine or treatment. Use Honey Nut field IDs and campaign value `honey_nut` in state/tracking.

- [ ] **Step 5: Run the focused tests and verify they pass**

Run the Step 2 command. Expected: PASS.

- [ ] **Step 6: Commit the contracts**

```bash
git add client/src/features/honey-nut
git commit -m "feat: add Honey Nut campaign contracts"
```

---

## Task 3: Build the Honey Nut narrative sections and styling

**Files:**
- Create: `client/src/features/honey-nut/campaign-layout.tsx`, `documentary-sections.tsx`, `campaign.css`
- Modify: `client/src/pages/honey-nut.test.ts`

**Interfaces:** `CampaignHeader`, `CampaignFooter`, `DocumentarySections({ onOrderClick })`, and `ProductGallery()`.

- [ ] **Step 1: Extend failing source assertions**

Assert the source contains the approved Bengali hero headline, nutrition headings, all nine ingredient names, `মুরাদ পারভেজ`, the existing portrait filename, `TestimonialsSection`, the supplied FAQ answers, `aria-expanded`, `aria-controls`, and `prefers-reduced-motion`.

- [ ] **Step 2: Run the section test and verify it fails**

```bash
node --test client/src/pages/honey-nut.test.ts
```

Expected: FAIL on missing feature source and content.

- [ ] **Step 3: Implement the visual sections**

Build the approved order: hero, nutrition highlights, ingredient grid, ingredient nutrition story, nutritionist trust, product gallery, daily routine, quality/packaging, reviews, FAQ, and final CTA. Use the existing `SectionIntro`, mobile rails, `AnimatePresence` FAQ panels, Embla gallery controls, CTA scroll targets, existing Murad portrait, and `TestimonialsSection` patterns. Use this palette:

```css
--honey-gold: #d99a2b;
--honey-cream: #fff8ee;
--honey-brown: #3d211a;
--honey-green: #5b793e;
--honey-peach: #f0d2a0;
```

Render circular ingredient photos in a 3×3 desktop/2-column mobile grid; use `fetchPriority="high"` only for hero and `loading="lazy"` below it. Reuse the existing approved Kalojira review data only through the existing testimonials presentation; add no new customer names.

- [ ] **Step 4: Implement accessible interactions**

Give FAQ buttons `aria-expanded` and `aria-controls`, make gallery controls keyboard focusable with active state, preserve semantic heading order, and use `window.matchMedia("(prefers-reduced-motion: reduce)")` for smooth scrolling and carousel behavior.

- [ ] **Step 5: Run section tests and verify they pass**

```bash
node --test client/src/pages/honey-nut.test.ts
```

Expected: PASS for copy, assets, section order, portrait/testimonial reuse, accessibility markers, and honest claims.

- [ ] **Step 6: Commit the narrative UI**

```bash
git add client/src/features/honey-nut client/src/pages/honey-nut.test.ts
git commit -m "feat: build Honey Nut campaign narrative"
```
---

## Task 4: Implement live Honey Nut checkout and mobile order bar

**Files:**
- Create: `client/src/features/honey-nut/honey-nut-checkout.tsx`, `mobile-order-bar.tsx`, `honey-nut-checkout.test.ts`

**Interfaces:** `HoneyNutCheckout({ product, status, productQuery, inventoryQuery, onRetry })` and `MobileOrderBar({ onOrderClick })`.

- [ ] **Step 1: Write failing checkout source assertions**

Assert live pack labels/prices, radio variants, quantity controls, Bengali name/phone/address fields, `apiRequest("POST", "/api/orders", payload)`, both query refetches before submit, Honey Nut confirmation storage, error tracking, and navigation to `/step/honey-nut/thank-you`.

- [ ] **Step 2: Run the checkout test and verify it fails**

```bash
node --test client/src/features/honey-nut/honey-nut-checkout.test.ts
```

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement the checkout form**

Adapt the existing Kalojira checkout with Honey Nut IDs/imports. Show selected live pack, quantity, subtotal, `হোম ডেলিভারি ৳১০০`, and total. Before creating an order, refetch product and inventory, merge them, confirm selected variant availability and positive stock, build the validated COD payload with `deliveryCharge: 100`, and submit only through the existing API route.

- [ ] **Step 4: Implement validation and recovery**

Keep focus management and live announcements for invalid fields, availability changes, and network errors. Preserve entered customer data after a failed request. Reuse existing support destinations and change campaign/event/message text to Honey Nut.

- [ ] **Step 5: Implement the mobile order bar**

Hide it at desktop widths, keep it above the mobile safe area, scroll to `#honey-nut-checkout`, focus the checkout heading, and use reduced-motion-aware scrolling.

- [ ] **Step 6: Run checkout tests and verify they pass**

```bash
node --test client/src/features/honey-nut/honey-nut-checkout.test.ts client/src/features/honey-nut/order.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit checkout**

```bash
git add client/src/features/honey-nut
git commit -m "feat: add Honey Nut live checkout"
```

---

## Task 5: Wire page composition, routes, metadata, and thank-you flow

**Files:**
- Create: `client/src/pages/honey-nut.tsx`, `honey-nut-thank-you.tsx`
- Modify: `client/src/App.tsx`, `script/build.ts`, `client/src/pages/honey-nut-routing.test.ts`

**Interfaces:** `HoneyNutPage` loads live/fallback product data; `HoneyNutThankYouPage` reads and clears only `HONEY_NUT_CONFIRMATION_KEY` and marks the Honey Nut purchase once.

- [ ] **Step 1: Extend failing route assertions**

Assert thank-you precedes landing, both precede generic product matching, metadata includes `হানি নাট | ম্যাংগো লাভার` and `হানি নাট অর্ডারের জন্য ধন্যবাদ | ম্যাংগো লাভার`, and `"honey-nut"` is in `fallbackSlugs`.

- [ ] **Step 2: Run route tests and verify they fail**

```bash
node --test client/src/pages/honey-nut-routing.test.ts
```

Expected: FAIL because imports/routes and metadata are missing.

- [ ] **Step 3: Implement page composition**

Use `const slug = "honey-nut"`, `findGeneratedStorefrontProduct`, `fetchStorefrontProduct`, `fetchStorefrontProductInventory`, `STOREFRONT_POLL_INTERVAL_MS`, and `mergeInventory`. Resolve Honey Nut checkout status, track one `campaign_view`, scroll/focus `#honey-nut-checkout` for CTA placements, and render all sections, gallery, checkout, footer, and mobile bar.

- [ ] **Step 4: Implement thank-you and routes**

Read Honey Nut confirmation from session storage, clear it after mount, mark purchase once, show product/variant/quantity/subtotal/delivery/total, and link back to `/step/honey-nut`. Register thank-you before landing and add both metadata titles in `App.tsx`.

- [ ] **Step 5: Add the build fallback slug**

Add `"honey-nut"` to `fallbackSlugs` without changing catalog generation.

- [ ] **Step 6: Run route tests and verify they pass**

```bash
node --test client/src/pages/honey-nut-routing.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit page and route wiring**

```bash
git add client/src/pages/honey-nut.tsx client/src/pages/honey-nut-thank-you.tsx client/src/App.tsx script/build.ts client/src/pages/honey-nut-routing.test.ts
git commit -m "feat: wire Honey Nut campaign routes"
```

---

## Task 6: Run regression checks and browser QA

**Files:** Modify only files required by a failing check; do not alter unrelated campaign code.

- [ ] **Step 1: Run all Honey Nut tests**

```bash
node --test client/src/pages/honey-nut.test.ts client/src/pages/honey-nut-routing.test.ts client/src/features/honey-nut/*.test.ts
```

Expected: all Honey Nut tests pass.

- [ ] **Step 2: Run existing campaign tests**

```bash
node --test client/src/pages/kalojira-mixed.test.ts client/src/pages/kalojira-mixed-routing.test.ts client/src/pages/sundarbans-honey.test.ts client/src/pages/sundarbans-honey-routing.test.ts
```

Expected: existing campaign tests pass.

- [ ] **Step 3: Run type checking and build**

```bash
npm run check
npm run build
```

Expected: zero TypeScript errors and a successful Vite/server build. Inspect `git status --short` and keep only intentional Honey Nut or generated catalog changes.

- [ ] **Step 4: Preview the page**

```bash
npm run dev
```

Open the reported URL at `/step/honey-nut` and verify desktop/mobile section order, images, nine labels, nutritionist portrait, testimonials, FAQ keyboard interaction, mobile order bar, live variant totals, ৳100 delivery, form errors, and thank-you navigation. Do not create a real order during QA.

- [ ] **Step 5: Inspect final diff**

Run `git diff --check && git status --short`. If a verification issue is found, fix it, rerun the focused test and build, and commit the verified fix with an imperative `fix:` message.
