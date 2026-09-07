# Sundarbans Honey Reference-Inspired Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans (required for inline execution). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Sundarbans Natural Honey campaign page with the centered, product-led, long-form ecommerce structure approved from the MindFuel reference while preserving the existing live checkout and campaign policies.

**Architecture:** Keep the existing campaign route and checkout orchestration in `sundarbans-honey.tsx`. Replace the current documentary card stack in `documentary-sections.tsx` with focused sections that mirror the approved reference rhythm: centered hero, trust ribbon, honest collection-media slot, featured packs, product callouts, founder slot, FAQ, comparison, and checkout handoff. Continue consuming live product/image data and the existing content/order/tracking modules; no new backend or catalog source is introduced.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, wouter, TanStack Query v5, lucide-react, Node `node:test`, existing Merchant-Suite catalog/inventory API, existing GTM/GA4 campaign tracking.

## Global Constraints

- Landing routes remain `/step/sundarbans-natural-honey/` and `/step/sundarbans-natural-honey/thank-you`.
- Leave `/product/sundarbans-natural-honey` visually and behaviorally unchanged.
- Product, prices, variants, stock, and product images remain authoritative in Merchant-Suite.
- Do not hardcode stock or create a second price source; pack cards consume `getHoneyPackOptions(product)`.
- Hero shows no price, delivery charge, discount, scarcity, rating, or review count.
- Prices are shown in featured packs and embedded checkout: 500g `৳800`, 1kg `৳1,600`; delivery is flat `৳100`.
- Use Bangla-first copy, `৳`, wouter, lucide-react, and the existing campaign phone/WhatsApp constants.
- Genuine ratings/reviews and founder/collection media are stakeholder-supplied; never fabricate them.
- Until authentic media arrives, show clearly labeled neutral media slots without `<video>`, autoplay, or invented proof.
- Reuse existing GA4/GTM and Google-only campaign tracking; preserve Meta suppression and order-handler parity.
- Preserve accessibility, reduced-motion behavior, searchable location fields, validation, inventory revalidation, duplicate-submit prevention, thank-you storage, and noindex behavior.
- Do not create a real order.

---

## File Map

- Modify `client/src/features/sundarbans-honey/documentary-sections.tsx`: implement the new visual sections and remove the old card-heavy documentary layout.
- Modify `client/src/features/sundarbans-honey/content.ts`: replace weak hero copy with approved stronger copy and add labels/copy for the new reference-inspired sections while retaining responsible claims.
- Modify `client/src/pages/sundarbans-honey.test.ts`: update source-level assertions for the new section order, no-price hero, media slot, and stronger copy.
- Inspect, but do not modify unless required, `client/src/pages/sundarbans-honey.tsx`, `honey-checkout.tsx`, `campaign-layout.tsx`, `order.ts`, and tracking modules to confirm interfaces remain intact.
- Do not add production media in this task; future versioned transparent product, collection reel, poster, founder asset, and approved reviews will be supplied separately.

---

### Task 1: Lock the stronger campaign copy and section content

**Files:**
- Modify: `client/src/features/sundarbans-honey/content.ts`
- Test: `client/src/pages/sundarbans-honey.test.ts`

**Interfaces:**
- Consumes: existing content exports imported by `DocumentarySections`.
- Produces: stable copy exports for hero, trust ribbon, reel slot, featured packs, product callouts, founder slot, FAQ, comparison, and responsible information.

- [ ] **Step 1: Write the failing source assertions**

```ts
assert.match(contentSource, /সুন্দরবনের চাকের মধু—প্রকৃতির আসল স্বাদ/);
assert.match(contentSource, /মৌচাক থেকে বোতল পর্যন্ত/);
assert.match(contentSource, /কেন সুন্দরবনের চাকের মধু বিশেষ/);
assert.match(contentSource, /বনের গল্প, বাস্তব ভিডিওতে/);
assert.match(contentSource, /কেন ম্যাংগো লাভার/);
```

- [ ] **Step 2: Run the focused test and verify the copy assertions fail**

```bash
node --test client/src/pages/sundarbans-honey.test.ts
```

Expected: the new exact-copy assertions fail against the current hero/section strings.

- [ ] **Step 3: Replace weak hero copy and add focused section exports**

Set:

```ts
export const heroHeadline = "সুন্দরবনের চাকের মধু—প্রকৃতির আসল স্বাদ";
export const heroSubcopy =
  "মৌচাক থেকে বোতল পর্যন্ত—সুন্দরবনের বুনো ফুলের নেকটার থেকে সংগ্রহ করা মধু, যত্নে আপনার ঘরে।";
```

Add concise exports for the trust ribbon, collection slot, featured pack heading, callout heading, founder slot, FAQ questions, and comparison heading. Keep existing factual guidance and infant/diabetes warnings. Do not add rating numbers, review counts, certification language, health cures, or unverified purity claims.

- [ ] **Step 4: Run the focused test and verify copy passes**

Run the same command. Expected: copy assertions pass; pre-existing unrelated failures are recorded separately.

- [ ] **Step 5: Commit the copy boundary**

```bash
git add client/src/features/sundarbans-honey/content.ts client/src/pages/sundarbans-honey.test.ts
git commit -m "content: strengthen honey campaign copy"
```

---

### Task 2: Build the centered reference-inspired section system

**Files:**
- Modify: `client/src/features/sundarbans-honey/documentary-sections.tsx`
- Test: `client/src/pages/sundarbans-honey.test.ts`

**Interfaces:**
- Consumes: `productImageUrl`, `onOrderClick`, existing content exports, and live pack data only through the existing checkout below this component.
- Produces: responsive `DocumentarySections` markup with no price in the hero and CTA placements that call `onOrderClick`.

- [ ] **Step 1: Write failing structure assertions**

```ts
assert.match(sectionsSource, /বনের স্বাদ/);
assert.match(sectionsSource, /রিভিউ ও রেটিং এখানে পরে যুক্ত হবে/);
assert.match(sectionsSource, /collection reel/i);
assert.match(sectionsSource, /featured/i);
assert.match(sectionsSource, /object-contain/);
assert.doesNotMatch(sectionsSource, /৳800|৳1,600/);
assert.doesNotMatch(sectionsSource, /heroPoints\.map/);
```

Keep media-policy checks that reject `<video>`, autoplay, fabricated review sections, and unsourced placeholder services.

- [ ] **Step 2: Run the focused test and confirm the new structure fails**

```bash
node --test client/src/pages/sundarbans-honey.test.ts
```

Expected: new layout assertions fail before implementation.

- [ ] **Step 3: Replace the current card stack with the approved section order**

Implement these semantic sections in `DocumentarySections`:

1. Centered hero with `honey-hero-heading`, neutral review/rating placeholder, stronger headline, short subcopy, `বিস্তারিত জানুন` CTA, and the live bottle image below it. The CTA calls `onOrderClick("hero_details")` only if it scrolls to content; it must not render a price.
2. Three-item forest-green trust ribbon: source, clean bottling, and cash-on-delivery.
3. Honest collection reel slot with a labeled poster placeholder and no `<video>` until authentic media is supplied.
4. Featured packs section with two display cards. Do not invent a local price source; render pack labels and keep actual totals authoritative in checkout. If prices appear here, derive them from an API-backed pack model rather than literals.
5. Why-special section with central real bottle image and concise callouts from `whySpecialPoints`; use `object-contain`, not the generated infographic as the only content.
6. Founder media slot with a clearly labeled missing-asset state and approved founder copy slot; no invented portrait or credentials.
7. Everyday-use/responsible-information block using existing `waysToEnjoyPoints` and `importantNotes` without medical claims.
8. FAQ rows using concise question labels and accessible answers.
9. Why Mango Lover comparison/trust block using `whyMangoLoverPoints`, with a non-combative comparison table.

Use thin borders, cream/paper backgrounds, forest-green bands, honey-yellow CTA buttons, centered editorial headings, and restrained corner rounding. Use meaningful section IDs and `aria-labelledby` headings. Reserve image dimensions and lazy-load below-fold media.

- [ ] **Step 4: Remove orphaned imports and verify campaign types**

Remove `heroPoints` and icon imports no longer referenced. Run:

```bash
npx tsc --noEmit 2>&1 | grep -E 'sundarbans-honey|documentary' || true
```

Expected: no TypeScript errors introduced in campaign files.

- [ ] **Step 5: Run structure tests and update only stale assertions**

```bash
node --test client/src/pages/sundarbans-honey.test.ts
```

Expected: updated layout assertions pass. Do not reintroduce old markup to satisfy stale tests.

- [ ] **Step 6: Commit the section redesign**

```bash
git add client/src/features/sundarbans-honey/documentary-sections.tsx client/src/pages/sundarbans-honey.test.ts
git commit -m "feat: redesign honey campaign sections"
```

---

### Task 3: Preserve campaign chrome and checkout handoff

**Files:**
- Inspect: `client/src/features/sundarbans-honey/campaign-layout.tsx`
- Modify only if needed: `client/src/features/sundarbans-honey/campaign-layout.tsx`, `client/src/pages/sundarbans-honey.tsx`, `client/src/features/sundarbans-honey/honey-checkout.tsx`
- Test: campaign page and checkout tests

**Interfaces:**
- Consumes: existing `CampaignHeader`, `CampaignFooter`, `HoneyCheckout`, and `handleOrderClick` interfaces.
- Produces: compact reference-inspired chrome and a checkout handoff reachable from every order CTA.

- [ ] **Step 1: Verify existing chrome assertions before editing**

```ts
assert.match(layoutSource, /@assets\/mango-lover-logo\.avif/);
assert.match(layoutSource, /HONEY_CAMPAIGN_PHONE_HREF/);
assert.match(layoutSource, /HONEY_CAMPAIGN_WHATSAPP_HREF/);
assert.doesNotMatch(layoutSource, /Products|Categories/);
```

- [ ] **Step 2: Run campaign regression tests**

```bash
node --test client/src/pages/sundarbans-honey.test.ts client/src/features/sundarbans-honey/order.test.ts client/src/features/sundarbans-honey/tracking.test.ts
```

Record any pre-existing failure before changes.

- [ ] **Step 3: Make the smallest handoff change**

Keep the current campaign header and safe-area mobile order bar unless browser QA shows a conflict. Retain phone/WhatsApp handlers and pass placement strings from each new CTA. Keep scrolling/focus on `#honey-checkout-heading`; do not move price calculation, inventory checks, validation, or payload construction into the presentation component.

- [ ] **Step 4: Run regression tests**

```bash
node --test client/src/pages/sundarbans-honey.test.ts client/src/features/sundarbans-honey/order.test.ts client/src/features/sundarbans-honey/tracking.test.ts client/src/pages/sundarbans-honey-thank-you.test.ts client/src/pages/sundarbans-honey-routing.test.ts
```

Expected: campaign behavior remains green.

- [ ] **Step 5: Commit only if chrome/handoff changed**

```bash
git add client/src/features/sundarbans-honey/campaign-layout.tsx client/src/pages/sundarbans-honey.tsx client/src/features/sundarbans-honey/honey-checkout.tsx client/src/pages/sundarbans-honey.test.ts
git commit -m "feat: align campaign chrome with new landing flow"
```

---

### Task 4: Verify responsive rendering and build safety

**Files:**
- Inspect: changed files and `client/public/step/sundarbans-natural-honey/ATTRIBUTION.md`
- Modify: tests only when an assertion is stale because of approved markup changes

**Interfaces:**
- Consumes: completed section redesign and existing live catalog/inventory configuration.
- Produces: verified build output and a clean diff with no unexpected catalog/media changes.

- [ ] **Step 1: Run required automated checks**

```bash
npm run check
node --test client/src/pages/home.test.ts
node --test client/src/lib/storefront-products.test.ts
node --test client/src/pages/sundarbans-honey.test.ts client/src/pages/sundarbans-honey-thank-you.test.ts client/src/pages/sundarbans-honey-routing.test.ts client/src/features/sundarbans-honey/order.test.ts client/src/features/sundarbans-honey/location-data.test.ts client/src/features/sundarbans-honey/tracking.test.ts
```

Expected: campaign tests pass. Report documented pre-existing check/test failures separately.

- [ ] **Step 2: Build and inspect generated changes**

```bash
NODE_ENV=production npm run build
git status --short
git diff -- client/src/lib/generated-storefront-products.ts
```

Expected: successful build and no unexpected catalog or secret files. Do not commit an unplanned catalog refresh.

- [ ] **Step 3: Verify local routes**

```bash
curl -sS -o /dev/null -w 'landing:%{http_code}\n' http://localhost:5009/step/sundarbans-natural-honey/
curl -sS -o /dev/null -w 'thank-you:%{http_code}\n' http://localhost:5009/step/sundarbans-natural-honey/thank-you
```

Expected: both routes return `200` locally.

- [ ] **Step 4: Browser QA without submitting checkout**

In cmux at desktop, tablet, and mobile widths verify that the hero is centered and has no price; the product image is visible; CTAs reach and focus checkout; the trust ribbon, reel slot, featured packs, callouts, founder slot, FAQ, comparison, and checkout are ordered correctly; no horizontal overflow or mobile-bar overlap occurs; media placeholders are honest; the console has no new campaign errors; and pack selection changes totals without submitting an order.

- [ ] **Step 5: Commit the verified implementation**

```bash
git status --short
git diff --check
git add client/src client/public/step/sundarbans-natural-honey/ATTRIBUTION.md
git commit -m "feat: launch reference-inspired honey landing page"
```

→ verify: report the commit, tests, build result, browser widths checked, and any documented pre-existing failures. Do not claim visual confirmation for widths not actually checked.
