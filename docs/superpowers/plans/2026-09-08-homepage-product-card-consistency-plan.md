# Homepage Product Card Consistency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (recommended) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the Top Selling Products card styling and cart behavior to Latest Collection, Just Arrived, and আমাদের আরও কিছু পণ্য without changing their responsive layouts.

**Architecture:** Extract one `HomeProductCard` component for all four homepage product sections. The homepage will keep owning catalog loading, snapshot fallback, section slicing, and responsive wrapper layouts; the shared card will own image, price, discount, sold-out, cart, and analytics rendering.

**Tech Stack:** React 19, TypeScript, TanStack Query, Framer Motion, wouter, Node test runner.

## Global Constraints

- Preserve each section's existing product count and responsive layout.
- Use the existing first-variant/base price and compare-at fallback behavior.
- Use the existing `addToCart` and `toGoogleAnalyticsItem` behavior.
- Do not add product data, API routes, dependencies, or Supabase access.
- Keep the yellow `Save ৳...` pill and crossed-out compare-at price only when compare-at price exceeds current price.
- Disable Add to Cart for unavailable products.

---

### Task 1: Add the failing shared-card regression test

**Files:**
- Create: `client/src/components/home-product-card.test.ts`
- Test: `client/src/components/home-product-card.test.ts`

**Interfaces:**
- Consumes: `client/src/pages/home.tsx` and the planned `client/src/components/home-product-card.tsx` source.
- Produces: source-contract coverage requiring one shared card implementation and four homepage usages.

- [ ] **Step 1: Write the failing test**

Create a Node test that reads the homepage source and conditionally reads the planned card source so missing files produce assertion failures rather than module-load errors:

```ts
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const homeSource = readFileSync(new URL("../pages/home.tsx", import.meta.url), "utf8");
const cardPath = new URL("./home-product-card.tsx", import.meta.url);
const cardSource = existsSync(cardPath) ? readFileSync(cardPath, "utf8") : "";

test("uses one styled product card across all homepage catalog sections", () => {
  assert.match(homeSource, /import HomeProductCard from "@\/components\/home-product-card"/);
  assert.equal((homeSource.match(/<HomeProductCard\b/g) ?? []).length, 4);
  assert.match(cardSource, /Save/);
  assert.match(cardSource, /compareAtPrice/);
  assert.match(cardSource, /Add to Cart/);
  assert.match(cardSource, /addToCart/);
  assert.match(cardSource, /disabled=\{product\.available === false\}/);
});
```

- [ ] **Step 2: Run the focused test and verify it fails for the missing shared card**

Run: `node --test client/src/components/home-product-card.test.ts`

Expected: FAIL because the homepage does not import or render `HomeProductCard`, and the component source does not exist yet.

- [ ] **Step 3: Commit the failing test**

```bash
git add client/src/components/home-product-card.test.ts
git commit -m "test: require shared homepage product cards"
```

### Task 2: Extract the reusable styled product card

**Files:**
- Create: `client/src/components/home-product-card.tsx`

**Interfaces:**
- Consumes: `StorefrontProduct`, `getProductImage`, `getProductNumericId`, `toGoogleAnalyticsItem`, `useCart`, and wouter `Link`.
- Produces: default `HomeProductCard({ product, className? })` component for every homepage catalog section.

- [ ] **Step 1: Add the shared card implementation**

Implement `HomeProductCard` with this prop type:

```ts
type HomeProductCardProps = {
  product: StorefrontProduct;
  className?: string;
};
```

Inside the component:

1. Calculate `image`, `firstVariant`, `currentPrice`, `compareAtPrice`, and `hasDiscount` exactly as the current Top Selling card does.
2. Render a `motion.article` with the existing `group flex min-w-0 flex-col` structure and merge any layout-specific `className`.
3. Keep the existing image zoom, sold-out badge, product name, price row, crossed-out compare-at price, yellow Save pill, and full-width yellow Add to Cart button classes.
4. Keep the existing cart item and analytics payload, including the `Default` variant and numeric price.
5. Use `event.preventDefault()` and `event.stopPropagation()` before calling `addToCart` so clicking the button does not navigate to the product page.

- [ ] **Step 2: Run the focused regression test**

Run: `node --test client/src/components/home-product-card.test.ts`

Expected: still FAIL because the homepage has not been migrated to use the shared component.

- [ ] **Step 3: Commit the standalone component**

```bash
git add client/src/components/home-product-card.tsx
git commit -m "refactor: extract homepage product card"
```

### Task 3: Migrate all homepage catalog sections

**Files:**
- Modify: `client/src/pages/home.tsx`

**Interfaces:**
- Consumes: `HomeProductCard` and the existing `catalogProducts` query result.
- Produces: four homepage sections using one card implementation while preserving their wrappers, slices, loading states, and responsive classes.

- [ ] **Step 1: Normalize the homepage catalog once**

Keep `catalogProducts` as the query result and define `homepageProducts` immediately after it. Copy the existing compare-at fallback logic into that normalized array:

```ts
const homepageProducts = catalogProducts.map((product) => {
  const snapshotProduct = generatedStorefrontProducts.find((snapshot) => snapshot.slug === product.slug);
  return product.compare_at_price == null && snapshotProduct?.compare_at_price != null
    ? { ...product, compare_at_price: snapshotProduct.compare_at_price }
    : product;
});
```

Use `homepageProducts` for Top Selling, Latest Collection, Just Arrived, and আমাদের আরও কিছু পণ্য so every section receives the same discount metadata.

- [ ] **Step 2: Remove card-only imports and state from `home.tsx`**

Import `HomeProductCard`, then remove `formatProductPriceRange`, `getProductImage`, `getProductNumericId`, `useCart`, `toGoogleAnalyticsItem`, and the homepage `addToCart` state after their markup is extracted.

- [ ] **Step 3: Replace the Top Selling card body**

Keep `topSellingProducts.slice(0, 6)` or its equivalent section slice, but replace the inline `motion.article` body with `<HomeProductCard product={product} />`.

- [ ] **Step 4: Replace Latest Collection cards**

Keep the existing `slice(0, 4)` and grid wrapper. Render:

```tsx
<HomeProductCard product={product} />
```

- [ ] **Step 5: Replace Just Arrived cards**

Keep the mobile carousel and desktop grid wrapper. Pass its existing layout classes to the shared card:

```tsx
<HomeProductCard
  product={product}
  className="min-w-[58vw] snap-start snap-always md:min-w-0"
/>
```

- [ ] **Step 6: Replace আমাদের আরও কিছু পণ্য cards**

Keep the existing `slice(0, 3)` and carousel/grid wrapper. Pass:

```tsx
<HomeProductCard
  product={product}
  className="min-w-[78vw] snap-start snap-always md:min-w-0"
/>
```

Keep the section header, background, and `OUR SPECIAL COLLECTIONS` / Bengali section copy unchanged.

- [ ] **Step 7: Run the focused regression tests**

Run: `node --test client/src/components/home-product-card.test.ts client/src/pages/products-loading.test.ts`

Expected: all focused tests pass.

- [ ] **Step 8: Commit the migration**

```bash
git add client/src/pages/home.tsx client/src/components/home-product-card.tsx client/src/components/home-product-card.test.ts
git commit -m "feat: style all homepage product cards consistently"
```

### Task 4: Verify the storefront build and production behavior

**Files:**
- No additional source files.

**Interfaces:**
- Consumes: the shared card and homepage migration.
- Produces: verified source tests, type/build results, and a production deployment through a pull request.

- [ ] **Step 1: Run the focused homepage test suite**

Run: `node --test client/src/components/home-product-card.test.ts client/src/pages/products-loading.test.ts`

Expected: all focused tests pass.

- [ ] **Step 2: Run the production build**

Run: `NODE_ENV=production npm run build`

Expected: exit code 0. Restore any build-generated changes to `client/src/lib/generated-storefront-products.ts` unless they are intentionally part of this feature.

- [ ] **Step 3: Inspect the diff**

Run: `git diff origin/main...HEAD --check` and `git status --short`.

Expected: no whitespace errors and only intentional design, plan, test, component, and homepage files changed.

- [ ] **Step 4: Push a feature branch and open a PR**

Create or use a non-main branch, push it, and open a PR targeting `main`. Do not push directly to protected `main`.

- [ ] **Step 5: Verify the deployed homepage**

After the Vercel check passes and the PR merges, fetch the production homepage bundle and confirm it contains the shared card’s `Save`, compare-at, and `Add to Cart` markup. Manually verify all three requested sections retain their mobile carousel or desktop grid behavior.
