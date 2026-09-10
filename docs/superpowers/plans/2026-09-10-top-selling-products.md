# Top Selling Products Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a curated Top Selling Products category to the homepage and navigation, with the three Mango Lover hero products first and a complete ordered category page.

**Architecture:** Keep the existing eight visual Featured Categories unchanged. Add a separate top-selling collection definition and deterministic ordering helper in `featured-collections.ts`; reuse that helper for the homepage’s six cards and the existing collection page. Add the route to the existing parameterized collection route and add explicit desktop/mobile menu links.

**Tech Stack:** React 19, TypeScript, wouter, TanStack Query, Node’s built-in test runner, Vite.

## Global Constraints

- Use the navigation label `Top Selling Products - সেরা বিক্রিত পণ্য`.
- Homepage displays exactly 6 products in the Top Selling Products section.
- Homepage order starts with `honey-nut`, `sundarbans-natural-honey`, and `kalojira-mixed`.
- The next homepage products come automatically from remaining honey and seed products.
- The full category includes all available honey, seed, and other products, with hero products first.
- Missing catalog products are skipped; newly introduced unlisted products append after the known ordered list.
- Do not add Top Selling Products to the circular Featured Categories cards.
- Preserve existing uncommitted changes in `client/src/lib/generated-storefront-products.ts`, `client/src/pages/home.tsx`, `client/src/pages/home.test.ts`, and `storefront-server.log`; stage only intentional files.

---

## File map

- Modify `client/src/lib/featured-collections.ts`: add the top-selling collection definition, ordered slugs, collection lookup, and ordering helper.
- Modify `client/src/lib/featured-collections.test.ts`: test hero-first ordering, automatic honey/seed follow-ups, missing products, and fallback products.
- Modify `client/src/pages/home.tsx`: derive homepage cards from the shared helper and limit to six.
- Modify `client/src/pages/home.test.ts`: verify the homepage uses the helper and six-card limit.
- Modify `client/src/pages/collection.tsx`: resolve the new top-selling slug through the shared collection lookup.
- Modify `client/src/pages/collection.test.ts`: verify collection pages use the expanded lookup.
- Modify `client/src/components/layout.tsx`: add the category to desktop and mobile navigation/menu.
- Modify `client/src/components/layout.test.ts`: verify the navigation destination and bilingual label.
- Modify `client/src/pages/app-routing.test.ts`: verify the parameterized collection route remains the route for the new category.

### Task 1: Add failing ordering and route tests

**Files:**
- Modify: `client/src/lib/featured-collections.test.ts`
- Modify: `client/src/pages/home.test.ts`
- Modify: `client/src/pages/collection.test.ts`
- Modify: `client/src/components/layout.test.ts`

**Interfaces:**
- Consumes the planned `TOP_SELLING_COLLECTION`, `TOP_SELLING_PRODUCT_SLUGS`, `getTopSellingProducts`, and `getCollection` exports.
- Produces regression expectations for data ordering, homepage selection, collection lookup, and navigation.

- [ ] **Step 1: Write the failing top-selling data tests**

Add tests using minimal `{ slug, name }` product objects:

```ts
test("orders Top Selling Products with the three hero products first", () => {
  assert.equal(TOP_SELLING_COLLECTION.slug, "top-selling-products");
  assert.equal(TOP_SELLING_COLLECTION.label, "Top Selling Products - সেরা বিক্রিত পণ্য");

  const products = TOP_SELLING_PRODUCT_SLUGS.map((slug) => ({ slug, name: slug }));
  assert.deepEqual(
    getTopSellingProducts(products).slice(0, 6).map(({ slug }) => slug),
    [
      "honey-nut",
      "sundarbans-natural-honey",
      "kalojira-mixed",
      "litchi-flower-honey",
      "black-seed-flower-honey",
      "seed-nut-mix",
    ],
  );
});

test("skips missing top-selling products and appends new catalog products", () => {
  const products = [
    { slug: "new-product", name: "New Product" },
    { slug: "seed-mixed", name: "Seed Mixed" },
    { slug: "honey-nut", name: "Honey Nut" },
    { slug: "kalojira-mixed", name: "Kalojira Mixed" },
  ];

  assert.deepEqual(
    getTopSellingProducts(products).map(({ slug }) => slug),
    ["honey-nut", "kalojira-mixed", "seed-mixed", "new-product"],
  );
});

test("resolves Top Selling Products without exposing it as a Featured Category", () => {
  assert.equal(getCollection("top-selling-products")?.slug, "top-selling-products");
  assert.equal(getFeaturedCollection("top-selling-products"), null);
  assert.doesNotMatch(FEATURED_COLLECTIONS.map(({ slug }) => slug).join(" "), /top-selling-products/);
});
```

- [ ] **Step 2: Add failing source-contract tests**

Extend the homepage test with assertions that the Top Selling Products section calls `getTopSellingProducts(homepageProducts)` and renders `topSellingProducts.slice(0, 6).map`. Update the collection test to expect `getCollection`, and extend the layout test with `/collection/top-selling-products` and `Top Selling Products - সেরা বিক্রিত পণ্য`.

- [ ] **Step 3: Run the focused tests and confirm the expected failures**

Run:

```bash
node --import tsx --test client/src/lib/featured-collections.test.ts client/src/pages/home.test.ts client/src/pages/collection.test.ts client/src/components/layout.test.ts
```

Expected: the new imports/helper assertions fail because the top-selling collection and navigation link do not exist yet.

### Task 2: Implement the shared top-selling collection and ordering helper

**Files:**
- Modify: `client/src/lib/featured-collections.ts`
- Test: `client/src/lib/featured-collections.test.ts`

**Interfaces:**
- Produces `TOP_SELLING_PRODUCT_SLUGS`, `TOP_SELLING_COLLECTION`, `getTopSellingProducts(products: StorefrontProduct[])`, and `getCollection(slug: string)`.
- Keeps `FEATURED_COLLECTIONS`, `getFeaturedCollection`, and `getVisibleFeaturedCollections` behavior unchanged.

- [ ] **Step 1: Add the ordered slug groups**

Define the three hero slugs first, then remaining honey slugs, seed slugs, and all currently known other product slugs:

```ts
export const TOP_SELLING_PRODUCT_SLUGS = [
  "honey-nut",
  "sundarbans-natural-honey",
  "kalojira-mixed",
  "litchi-flower-honey",
  "black-seed-flower-honey",
  "seed-nut-mix",
  "seed-mixed",
  "chia-seed",
  "sugarcane-juice-powder",
  "amsotto-pickle",
  "lachcha-semai",
  "mustard-oil",
  "beetroot-powder",
  "pure-ghee",
] as const;

export const TOP_SELLING_COLLECTION = {
  slug: "top-selling-products",
  label: "Top Selling Products - সেরা বিক্রিত পণ্য",
  productSlugs: TOP_SELLING_PRODUCT_SLUGS,
} as const;
```

- [ ] **Step 2: Implement deterministic ordering and expanded lookup**

Use a slug map to select known products in curated order, then append catalog products whose slugs are not in the known list. Resolve the special collection only from `getCollection`, leaving `getFeaturedCollection("top-selling-products")` as `null` so the visual Featured Categories list cannot grow accidentally.

- [ ] **Step 3: Run data tests to verify they pass**

Run:

```bash
node --import tsx --test client/src/lib/featured-collections.test.ts
```

Expected: all collection tests pass, including hero-first ordering, missing-product skipping, fallback appending, and Featured Categories isolation.

### Task 3: Connect homepage and collection page to the shared category

**Files:**
- Modify: `client/src/pages/home.tsx`
- Modify: `client/src/pages/collection.tsx`
- Modify: `client/src/pages/home.test.ts`
- Modify: `client/src/pages/collection.test.ts`

**Interfaces:**
- Consumes `getTopSellingProducts` and `getCollection` from `@/lib/featured-collections`.
- Produces six ordered homepage cards and a complete `/collection/top-selling-products` page.

- [ ] **Step 1: Derive top-selling products after the snapshot price merge**

Add:

```ts
const topSellingProducts = getTopSellingProducts(homepageProducts);
```

Use `topSellingProducts.slice(0, 6).map(...)` only in the existing Top Selling Products homepage section. Leave Latest Drop, Just Arrived, Special Collections, and Recently Viewed sourcing unchanged.

- [ ] **Step 2: Resolve the category in the collection page**

Replace the collection page lookup with `getCollection(params.slug)`. Keep the current live-query, loading, empty-state, and inventory-aware card behavior unchanged.

- [ ] **Step 3: Run homepage and collection tests**

Run:

```bash
node --import tsx --test client/src/pages/home.test.ts client/src/pages/collection.test.ts client/src/lib/featured-collections.test.ts
```

Expected: homepage source tests verify the shared helper and six-item limit; collection tests verify the expanded lookup and existing rendering contracts.

### Task 4: Add desktop/mobile navigation and verify the route

**Files:**
- Modify: `client/src/components/layout.tsx`
- Modify: `client/src/components/layout.test.ts`
- Modify: `client/src/pages/app-routing.test.ts`

**Interfaces:**
- Consumes `/collection/top-selling-products` and the approved bilingual label.
- Produces explicit desktop and mobile menu links while leaving circular Featured Categories unchanged.

- [ ] **Step 1: Add the Top Selling Products menu item**

Add `{ label: "Top Selling Products - সেরা বিক্রিত পণ্য", href: "/collection/top-selling-products" }` to `MENU_ITEMS` after Products. Add the same route to the mobile menu after Products. The existing desktop menu composition will include it from `MENU_ITEMS`; do not add it to `visibleCollections`.

- [ ] **Step 2: Run navigation and route tests**

Run:

```bash
node --import tsx --test client/src/components/layout.test.ts client/src/pages/app-routing.test.ts client/src/lib/featured-collections.test.ts
```

Expected: both navigation surfaces contain the new destination, and the parameterized collection route remains registered.

### Task 5: Final verification and commit

**Files:**
- No additional files beyond the implementation and tests above.

- [ ] **Step 1: Run the complete focused regression set**

Run:

```bash
node --import tsx --test client/src/lib/featured-collections.test.ts client/src/pages/home.test.ts client/src/pages/collection.test.ts client/src/components/layout.test.ts client/src/pages/app-routing.test.ts
```

Expected: all tests pass.

- [ ] **Step 2: Run type-check and production build**

Run `npm run check`, then run `npm run build` with a backup/restore of `client/src/lib/generated-storefront-products.ts`, because the build regenerates that user-owned snapshot. Expected: both commands exit 0.

- [ ] **Step 3: Inspect diff and commit only intentional files**

Run `git diff --check` and `git status --short`. Stage only the top-selling implementation, tests, and plan/spec files. Do not stage the existing catalog snapshot, homepage category edits, or `storefront-server.log`.

```bash
git add client/src/lib/featured-collections.ts client/src/lib/featured-collections.test.ts client/src/pages/home.tsx client/src/pages/home.test.ts client/src/pages/collection.tsx client/src/pages/collection.test.ts client/src/components/layout.tsx client/src/components/layout.test.ts client/src/pages/app-routing.test.ts
git commit -m "feat: add top selling products category"
```
