# Recently Viewed Products Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task with review checkpoints.

**Goal:** Add a browser-persisted Recently Viewed carousel with the shared product-card design to the homepage, `/products`, and product-detail pages.

**Architecture:** A focused recent-view utility owns a versioned local-storage list of up to eight product slugs, ordering, deduplication, malformed-data recovery, and a same-tab update event. A reusable `RecentlyViewed` component maps those slugs to the current live catalog, excludes the active detail product when needed, and renders a responsive horizontal carousel with Swiss-style arrow controls. Each page supplies its existing catalog data and keeps its current fallback and inventory behavior.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Framer Motion, Wouter, Vitest/Node test contracts, existing `HomeProductCard`.

## Global Constraints

- Use the existing `HomeProductCard`; do not duplicate product-card markup or pricing logic.
- Keep the browser-only history in `localStorage`; do not add API, Supabase, or server-side tracking.
- Preserve generated catalog fallback, live catalog revalidation, inventory polling, cart analytics, and existing page layouts.
- Store only product slugs; resolve current product data from the live catalog or generated fallback.
- Show four carousel cards at desktop widths and two at mobile widths.
- Put the left-aligned title and homepage-style highlight on the left; put compact previous/next arrows on the right.
- Exclude the active product from the detail-page Recently Viewed section.
- Treat unavailable or malformed storage as an empty history without breaking rendering.

---

### Task 1: Add recent-view storage and ordering utilities

**Files:**
- Create: `client/src/lib/recently-viewed.ts`
- Test: `client/src/lib/recently-viewed.test.ts`

**Interfaces:**
- `RECENTLY_VIEWED_STORAGE_KEY: string`
- `MAX_RECENTLY_VIEWED: number` set to `8`
- `readRecentlyViewedSlugs(storage?: Pick<Storage, "getItem">): string[]`
- `recordRecentlyViewedSlug(storage: Pick<Storage, "getItem" | "setItem"> | undefined, slug: string): string[]`
- `getRecentlyViewedProducts(products: StorefrontProduct[], slugs: string[], excludeSlug?: string): StorefrontProduct[]`
- `useRecentlyViewedSlugs(): string[]` including same-tab updates after `recordRecentlyViewedSlug` dispatches its custom event.

- [ ] **Step 1: Write failing utility tests**

Test valid ordering, duplicate promotion, eight-item limit, malformed JSON, invalid entries, and active-product exclusion:

```ts
test("records a slug at the front and removes duplicate history", () => {
  const storage = createStorage({ [RECENTLY_VIEWED_STORAGE_KEY]: JSON.stringify(["older", "current"]) });

  const result = recordRecentlyViewedSlug(storage, "older");

  assert.deepEqual(result, ["older", "current"]);
});

test("maps current catalog products in stored order and excludes the open product", () => {
  const products = [{ slug: "new" }, { slug: "open" }, { slug: "old" }] as StorefrontProduct[];

  assert.deepEqual(
    getRecentlyViewedProducts(products, ["old", "missing", "open", "new"], "open").map((product) => product.slug),
    ["old", "new"],
  );
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `node --test client/src/lib/recently-viewed.test.ts`

Expected: FAIL because the utility module and exported functions do not exist yet.

- [ ] **Step 3: Implement the storage utilities**

Use a defensive parser that accepts only non-empty strings, catches storage/JSON errors, writes at most eight unique slugs, and dispatches `recently-viewed-products:changed` after a successful write. Make the React hook read on mount and update from that custom event; guard all `window` access for non-browser test environments.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `node --test client/src/lib/recently-viewed.test.ts`

Expected: PASS with all recent-view utility cases passing.

- [ ] **Step 5: Commit the utility**

```bash
git add client/src/lib/recently-viewed.ts client/src/lib/recently-viewed.test.ts
git commit -m "feat: track recently viewed products"
```

### Task 2: Build the reusable Recently Viewed carousel

**Files:**
- Create: `client/src/components/recently-viewed.tsx`
- Test: `client/src/components/recently-viewed.test.ts`

**Interfaces:**
- `RecentlyViewedProps`:
  - `products: StorefrontProduct[]`
  - `excludeSlug?: string`
  - `className?: string`
- `RecentlyViewed` renders nothing when no stored products resolve, otherwise renders the heading, arrows, and `HomeProductCard` items.

- [ ] **Step 1: Write the component contract test**

Read the source contract and assert the component uses `useRecentlyViewedSlugs`, `getRecentlyViewedProducts`, `HomeProductCard`, accessible previous/next buttons, and the `Recently Viewed` label. Also assert the section has four-column desktop/two-column mobile sizing behavior.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `node --test client/src/components/recently-viewed.test.ts`

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement the carousel**

Use a scroll container with `grid-auto-columns`/responsive basis so two cards fit on mobile and four fit at desktop widths. Use a `ref` and `scrollBy` for arrow controls, moving by one visible-page width while clamping naturally at the scroll edges. Use Phosphor `CaretLeft` and `CaretRight` with `weight="light"` for the compact controls. Match the homepage title rhythm with a bold `RECENTLY` label and a highlighted `VIEWED` word using the same yellow highlight treatment. Set `aria-label`, disabled state, and `aria-controls` for both arrows.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `node --test client/src/components/recently-viewed.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the component**

```bash
git add client/src/components/recently-viewed.tsx client/src/components/recently-viewed.test.ts
git commit -m "feat: add recently viewed carousel"
```

### Task 3: Integrate Recently Viewed into the homepage and catalog page

**Files:**
- Modify: `client/src/pages/home.tsx`
- Modify: `client/src/pages/products.tsx`
- Test: `client/src/pages/recently-viewed-pages.test.ts`

**Interfaces:**
- Both pages pass their existing catalog array to `<RecentlyViewed products={...} />` without changing the existing catalog grid.

- [ ] **Step 1: Write failing page integration tests**

Assert `home.tsx` and `products.tsx` import `RecentlyViewed` and render it with their live/fallback catalog data. Assert the existing `HomeProductCard` catalog rendering and `mergeInventory` path remain present in `products.tsx`.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `node --test client/src/pages/recently-viewed-pages.test.ts`

Expected: FAIL because neither page imports or renders the new section.

- [ ] **Step 3: Add the homepage section**

Render `<RecentlyViewed products={homepageProducts} />` near the end of the homepage content before the closing `Layout`, using the homepage background and spacing conventions. Keep the existing `homepageProducts` compare-at fallback normalization as the source.

- [ ] **Step 4: Add the catalog-page section**

Render `<RecentlyViewed products={products ?? generatedStorefrontProducts} />` after the existing all-products content inside the same page container. Keep search filtering limited to the main catalog grid; Recently Viewed should show stored items independent of the current search query.

- [ ] **Step 5: Run the focused integration test**

Run: `node --test client/src/pages/recently-viewed-pages.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit the page integrations**

```bash
git add client/src/pages/home.tsx client/src/pages/products.tsx client/src/pages/recently-viewed-pages.test.ts
git commit -m "feat: show recently viewed on catalog pages"
```

### Task 4: Track detail-page views and render the detail-page section

**Files:**
- Modify: `client/src/pages/product.tsx`
- Test: `client/src/pages/product-recently-viewed.test.ts`

**Interfaces:**
- Product detail calls `recordRecentlyViewedSlug(window.localStorage, product.slug)` after a resolved product is available.
- Product detail renders `<RecentlyViewed products={relatedSource} excludeSlug={product?.slug} />` as a separate section after the existing “আমাদের আরও কিছু পণ্য” section.

- [ ] **Step 1: Write failing detail-page tests**

Assert the page imports the storage recorder and `RecentlyViewed`, records the resolved product slug, passes the current slug as `excludeSlug`, and keeps the existing related-products card section intact.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `node --test client/src/pages/product-recently-viewed.test.ts`

Expected: FAIL because the detail page does not track or render Recently Viewed.

- [ ] **Step 3: Record resolved detail views**

Add an effect keyed by `product?.slug` that calls `recordRecentlyViewedSlug(window.localStorage, product.slug)` only after the product has resolved. Do not record the slug from the URL before product resolution, so invalid product routes never enter history.

- [ ] **Step 4: Render the detail-page section**

Add `<RecentlyViewed products={relatedSource} excludeSlug={product?.slug} />` below the existing `আমাদের আরও কিছু পণ্য` section, preserving the existing related-products heading and four-column layout. The new section should be independently hidden when no stored items resolve.

- [ ] **Step 5: Run the focused detail test**

Run: `node --test client/src/pages/product-recently-viewed.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit the detail-page integration**

```bash
git add client/src/pages/product.tsx client/src/pages/product-recently-viewed.test.ts
git commit -m "feat: add recently viewed to product pages"
```

### Task 5: Verify the complete feature and prepare the PR

**Files:**
- Verify: all files from Tasks 1–4

- [ ] **Step 1: Run all focused regression tests**

Run:

```bash
node --test \
  client/src/lib/recently-viewed.test.ts \
  client/src/components/recently-viewed.test.ts \
  client/src/pages/recently-viewed-pages.test.ts \
  client/src/pages/product-recently-viewed.test.ts \
  client/src/components/home-product-card.test.ts \
  client/src/pages/products-loading.test.ts
```

Expected: all tests pass.

- [ ] **Step 2: Run the production build**

Run: `NODE_ENV=production npm run build`

Expected: build exits successfully. Restore any generated storefront snapshot changes before reviewing the diff.

- [ ] **Step 3: Check the final diff**

Run: `git diff --check && git diff origin/main...HEAD --stat`

Expected: no whitespace errors and only the recent-view utility, section, tests, and three page integrations appear.

- [ ] **Step 4: Commit any final cleanup and open the PR**

Use a PR branch based directly on `origin/main`, push it, and open a PR targeting `main`; do not push directly to protected `main`.
