# Homepage Category Sections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task with review checkpoints.

**Goal:** Replace the homepage's Just Arrived and Our Special Collections blocks with bilingual product sections for all currently populated Featured Categories, while retaining Pure Ghee and Black Seed Mix.

**Architecture:** Reuse `visibleFeaturedCollections`, `getProductsForCollection()`, the existing public catalog query, and `HomeProductCard`. Render category sections from the configured collection data and place the two existing editorial sections between category sections in the approved order, without changing collection definitions or product-card behavior.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Framer Motion, Wouter, Node test runner.

## Global Constraints

- Render only Featured Categories that currently contain products.
- Show category labels in English and Bengali, for example `Homemade-হোমমেড`.
- Keep the existing `FEATURED CATEGORIES` navigation unchanged.
- Remove `JUST ARRIVED` and `OUR SPECIAL COLLECTIONS`.
- Keep `PURE GHEE` and `BLACK SEED MIX` editorial sections.
- Use the public catalog and existing `getProductsForCollection()` helper; do not hardcode category product arrays.
- Preserve loading, error, animation, product-card, and responsive behavior patterns.

---

### Task 1: Add failing homepage section-order and category-content tests

**Files:**
- Modify: `client/src/pages/home.test.ts`
- Read: `client/src/pages/home.tsx`, `client/src/lib/featured-collections.ts`

**Interfaces:**
- Consumes: homepage source text and the existing Featured Collection definitions.
- Produces: regression coverage for the approved section order, bilingual labels, and collection filtering.

- [ ] **Step 1: Add a test for the removed sections**

Add a test that asserts the homepage source does not contain `Just Arrived Section` or `Special Collections Section`, while it still contains `Editorial Section` and `Essentials Section`.

- [ ] **Step 2: Add a test for the approved category sequence**

Add a test that slices the source after `Latest Drop Section` and asserts the following markers appear in order:

```ts
const belowLatest = homeSource.slice(homeSource.indexOf("Latest Drop Section"));
const order = [
  'label: "Homemade-হোমমেড"',
  'label: "Honey-মধু"',
  "Editorial Section",
  'label: "Oil & Ghee-তেল ও ঘি"',
  "Essentials Section",
  'label: "Semai-সেমাই"',
  'label: "Nuts & Seeds-বাদাম ও বীজ"',
];

let previous = -1;
for (const marker of order) {
  const index = belowLatest.indexOf(marker);
  assert.ok(index > previous, `${marker} should follow the previous homepage section`);
  previous = index;
}
```

- [ ] **Step 3: Add a test for category rendering behavior**

Assert the homepage imports and calls `getProductsForCollection`, maps `visibleFeaturedCollections`, renders bilingual `label`, and maps each category's filtered products through `HomeProductCard`.

- [ ] **Step 4: Run the homepage tests and verify the expected failure**

Run: `node --test client/src/pages/home.test.ts`

Expected: FAIL because the current homepage still contains Just Arrived and Special Collections and does not render category sections below Latest Collection.

### Task 2: Implement the approved homepage section sequence

**Files:**
- Modify: `client/src/pages/home.tsx`

**Interfaces:**
- Consumes: `visibleFeaturedCollections`, `getProductsForCollection()`, `catalogProducts`, `HomeProductCard`, and existing editorial section markup.
- Produces: homepage sections in the approved interleaved order with bilingual category headings and filtered product cards.

- [ ] **Step 1: Import and prepare category product filtering**

Import `getProductsForCollection` from `@/lib/featured-collections`. Keep `visibleFeaturedCollections` as the source of populated categories. Remove only the `justArrivedRef`, `justArrivedInView`, `specialRef`, and `specialInView` hooks and any wheel/touch handling that exists solely for the removed Just Arrived grid. Keep category auto-scroll behavior and the What's New grid behavior.

- [ ] **Step 2: Add a reusable category section renderer inside `Home`**

Render each category with a stable key based on `collection.slug`, filter with `getProductsForCollection(catalogProducts, collection)`, and show the collection's `label` in the same heading style as `FEATURED CATEGORIES`. Split the label at the first hyphen so English and Bengali remain readable on separate lines on mobile and inline on desktop, matching the existing category label treatment.

- [ ] **Step 3: Replace the section block after Latest Collection**

Remove the entire Just Arrived block. Render category sections and editorial sections in this exact order:

```tsx
category("homemade");
category("honey");
editorial PURE GHEE;
category("oil-and-ghee");
essentials BLACK SEED MIX;
category("semai");
category("nuts-and-seeds");
```

Do not alter the editorial image assets, overlay copy, CTA links, or product-card component.

- [ ] **Step 4: Remove the Special Collections block and obsolete references**

Delete the `Special Collections Section` markup and remove any now-unused refs, event listeners, or motion state. Keep `RecentlyViewed` at the end of the homepage.

- [ ] **Step 5: Run the homepage tests and verify they pass**

Run: `node --test client/src/pages/home.test.ts`

Expected: all homepage tests pass, including the new order and filtering assertions.

### Task 3: Run integration verification

**Files:**
- Verify: `client/src/pages/home.tsx`, `client/src/pages/home.test.ts`
- Verify unchanged: `client/src/lib/featured-collections.ts`, editorial assets, `client/src/components/home-product-card.tsx`

- [ ] **Step 1: Run focused homepage and related tests**

Run:

```bash
node --test \
  client/src/pages/home.test.ts \
  client/src/components/home-product-card.test.ts \
  client/src/pages/products-card.test.ts
```

Expected: all tests pass, except any failures already present before this task must be reported separately.

- [ ] **Step 2: Run the production build**

Run: `NODE_ENV=production npm run build`

Expected: build exits successfully. Restore only generated catalog changes caused by the build before final review.

- [ ] **Step 3: Check the final diff**

Run: `git diff --check && git status --short --branch`

Expected: no whitespace errors; unrelated existing changes remain uncommitted and are not included in the feature commit.
