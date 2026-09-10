# Featured Collection Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the eight Featured Categories cards into working single-category collection pages backed by the live storefront catalog.

**Architecture:** Store the fixed collection definitions and product-slug assignments in a focused storefront module. Share the existing product-card/inventory behavior between the all-products page and a new `/collection/:slug` page. Keep the Merchant Suite API and Supabase schema unchanged; collection pages filter the already-authoritative published catalog in the browser.

**Tech Stack:** React 19, TypeScript, wouter, TanStack Query, Framer Motion, Node's built-in test runner, Vite.

## Global Constraints

- Each published product in the current catalog is assigned to exactly one Featured Category.
- Jaggery, Fresh Mango, and Dates must display exactly `No product found`.
- Homepage cards for collections with no matching live products must be hidden; their definitions and direct routes remain.
- All catalog reads must continue through the existing `fetchStorefrontProducts()` flow and its generated fallback.
- Preserve the existing responsive grid, product detail links, inventory polling, motion, and visual language.
- Do not add Merchant Suite routes, Supabase tables, migrations, or direct commerce-table access.
- Do not modify existing user changes in `client/src/lib/generated-storefront-products.ts` or `storefront-server.log`.

---

## File map

- Create `client/src/lib/featured-collections.ts`: fixed collection metadata, assignments, lookup, and pure filtering helpers.
- Create `client/src/lib/featured-collections.test.ts`: assignment and filtering tests.
- Create `client/src/components/storefront-product-card.tsx`: shared animated product card with live inventory overlay.
- Create `client/src/pages/collection.tsx`: collection page that loads and filters live catalog data.
- Create `client/src/pages/collection.test.ts`: collection page behavior/source tests.
- Modify `client/src/pages/products.tsx`: consume the shared product-card component without changing the all-products behavior.
- Modify `client/src/pages/home.tsx`: consume collection definitions and link cards to collection routes.
- Modify `client/src/pages/home.test.ts`: verify Featured Category destinations.
- Modify `client/src/App.tsx`: register `/collection/:slug` and render the new page.
- Modify `client/src/pages/products-loading.test.ts` or add an App route test only if existing focused tests do not cover route registration.

## Task 1: Add collection definitions and pure filtering

**Files:**
- Create: `client/src/lib/featured-collections.ts`
- Test: `client/src/lib/featured-collections.test.ts`

**Interfaces:**
- Produces `FEATURED_COLLECTIONS: readonly FeaturedCollection[]`.
- Produces `getFeaturedCollection(slug: string): FeaturedCollection | null`.
- Produces `getProductsForCollection(products: StorefrontProduct[], collection: FeaturedCollection): StorefrontProduct[]`.

- [ ] **Step 1: Write the failing tests**

Add Node tests that import the soon-to-exist module and assert:

```ts
test("defines the eight homepage collections", () => {
  assert.deepEqual(FEATURED_COLLECTIONS.map(({ slug }) => slug), [
    "homemade", "honey", "oil-and-ghee", "jaggery",
    "semai", "fresh-mango", "dates", "nuts-and-seeds",
  ]);
});

test("assigns every current product to exactly one collection", () => {
  const assignments = FEATURED_COLLECTIONS.flatMap((collection) =>
    collection.productSlugs.map((productSlug) => ({ collection: collection.slug, productSlug })),
  );
  const productSlugs = [
    "litchi-flower-honey", "mustard-oil", "seed-nut-mix", "seed-mixed",
    "beetroot-powder", "kalojira-mixed", "honey-nut", "chia-seed",
    "pure-ghee", "sundarbans-natural-honey", "black-seed-flower-honey",
  ];

  assert.equal(new Set(assignments.map(({ productSlug }) => productSlug)).size, assignments.length);
  assert.deepEqual(assignments.map(({ productSlug }) => productSlug).sort(), productSlugs.sort());
});

test("filters a catalog by assigned slugs and ignores missing products", () => {
  const products = [
    { slug: "honey-nut", name: "Honey Nut" },
    { slug: "missing", name: "Missing" },
    { slug: "pure-ghee", name: "Pure Ghee" },
  ];
  const collection = getFeaturedCollection("honey");

  assert.deepEqual(getProductsForCollection(products, collection!), [products[0]]);
});

test("returns no assigned products for empty collections", () => {
  const collection = getFeaturedCollection("jaggery");
  assert.deepEqual(getProductsForCollection([], collection!), []);
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --import tsx --test client/src/lib/featured-collections.test.ts`

Expected: FAIL because `featured-collections.ts` and its exports do not exist yet.

- [ ] **Step 3: Implement the minimal collection module**

Define `FeaturedCollection` with `slug`, `label`, `image`, and `productSlugs: readonly string[]`. Use the exact current category labels/images from `home.tsx` and the confirmed assignments. Implement lookup with `find`, returning `null` when absent. Implement filtering with a `Set` of assigned slugs and preserve live-catalog order.

- [ ] **Step 4: Run the focused test and verify it passes**

Run: `node --import tsx --test client/src/lib/featured-collections.test.ts`

Expected: PASS with all collection definition, uniqueness, filtering, and empty-collection tests passing.

- [ ] **Step 5: Commit the focused module**

```bash
git add client/src/lib/featured-collections.ts client/src/lib/featured-collections.test.ts
git commit -m "feat: define storefront featured collections"
```

## Task 2: Share product-card behavior and build the collection page

**Files:**
- Create: `client/src/components/storefront-product-card.tsx`
- Create: `client/src/pages/collection.tsx`
- Test: `client/src/pages/collection.test.ts`
- Modify: `client/src/pages/products.tsx`

**Interfaces:**
- `StorefrontProductCard({ product, index }: { product: StorefrontProduct; index: number }): JSX.Element` keeps the existing inventory query key, polling interval, merge behavior, motion reveal, and `HomeProductCard` rendering.
- `CollectionPage({ params }: { params: { slug: string } }): JSX.Element` resolves a configured collection and renders its filtered catalog.

- [ ] **Step 1: Write the failing collection page tests**

Add source-level tests consistent with the existing page tests:

```ts
test("loads the live catalog and filters it through the configured collection", () => {
  assert.match(collectionSource, /fetchStorefrontProducts/);
  assert.match(collectionSource, /getFeaturedCollection/);
  assert.match(collectionSource, /getProductsForCollection/);
  assert.match(collectionSource, /initialData: generatedStorefrontProducts/);
});

test("renders the exact empty collection message", () => {
  assert.match(collectionSource, /No product found/);
});

test("reuses the shared inventory-aware product card", () => {
  assert.match(collectionSource, /StorefrontProductCard/);
  assert.match(productsSource, /StorefrontProductCard/);
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --import tsx --test client/src/pages/collection.test.ts`

Expected: FAIL because the collection page and shared card do not exist.

- [ ] **Step 3: Extract the existing product card without behavior changes**

Move the current `ProductCard` implementation from `products.tsx` into `client/src/components/storefront-product-card.tsx`. Export it as `StorefrontProductCard`, update `products.tsx` to import it, and preserve:

```ts
queryKey: ["merchant-suite-inventory", product.slug]
refetchInterval: STOREFRONT_POLL_INTERVAL_MS
const merged = mergeInventory(product, inventory?.inventory) ?? product
<HomeProductCard product={merged} />
```

- [ ] **Step 4: Implement the collection page**

Use the same TanStack Query options as `ProductsPage`:

```ts
const { data: products, isLoading, isError } = useQuery({
  queryKey: ["merchant-suite-products-listing"],
  queryFn: fetchStorefrontProducts,
  ...STOREFRONT_CATALOG_QUERY_OPTIONS,
  initialData: generatedStorefrontProducts,
  initialDataUpdatedAt: 0,
  refetchInterval: STOREFRONT_POLL_INTERVAL_MS,
});
```

Resolve `params.slug` with `getFeaturedCollection`. For an unknown slug, render the existing `NotFound` page. For a known slug, derive `filteredProducts` with `getProductsForCollection(products ?? [], collection)`. Reuse the `/products` loading and API-error treatment, render the collection heading and responsive grid of `StorefrontProductCard`, and render `No product found` when the filtered collection is empty.

- [ ] **Step 5: Run focused tests and type-check**

Run: `node --import tsx --test client/src/pages/collection.test.ts client/src/lib/featured-collections.test.ts`

Expected: PASS.

Run: `npm run check`

Expected: PASS with no TypeScript errors.

- [ ] **Step 6: Commit the page and shared card**

```bash
git add client/src/components/storefront-product-card.tsx client/src/pages/collection.tsx client/src/pages/collection.test.ts client/src/pages/products.tsx
git commit -m "feat: add storefront collection pages"
```

## Task 3: Wire homepage cards and register the route

**Files:**
- Modify: `client/src/pages/home.tsx`
- Modify: `client/src/pages/home.test.ts`
- Modify: `client/src/App.tsx`

**Interfaces:**
- Homepage consumes `FEATURED_COLLECTIONS` from Task 1.
- Router maps `/collection/:slug` to `CollectionPage` from Task 2.

- [ ] **Step 1: Write the failing integration assertions**

Extend `home.test.ts` with assertions that the homepage imports and iterates the shared collection definitions and builds collection links. Add an App source test or extend an existing route test to assert:

```ts
assert.match(appSource, /path="\/collection\/:slug"/);
assert.match(appSource, /CollectionPage/);
```

- [ ] **Step 2: Run the focused assertions and verify they fail**

Run: `node --import tsx --test client/src/pages/home.test.ts`

Expected: FAIL because cards still use the local array and all link to `/products`.

- [ ] **Step 3: Replace the local category array and wire links**

Import `FEATURED_COLLECTIONS` in `home.tsx`, remove the duplicated local category array, iterate the shared definitions, and change each card link to:

```tsx
href={`/collection/${slug}`}
```

Preserve the existing labels, images, loading priorities, responsive classes, and animation behavior.

- [ ] **Step 4: Register the collection route**

Import `CollectionPage` in `App.tsx` and add a route before the fallback route:

```tsx
<Route path="/collection/:slug">
  {(params) => (
    <PageTransition key={params.slug}>
      <CollectionPage params={params} />
    </PageTransition>
  )}
</Route>
```

- [ ] **Step 5: Run the full verification suite**

Run: `node --import tsx --test $(find client api server script -type f \( -name '*.test.ts' -o -name '*.test.tsx' \) -print)`

Expected: all existing and new tests pass.

Run: `npm run check`

Expected: PASS with no TypeScript errors.

Run: `npm run build`

Expected: production build completes successfully and refreshes SEO artifacts using the live catalog or existing fallback.

- [ ] **Step 6: Inspect the diff and commit integration wiring**

Run: `git diff --check` and `git status --short`. Confirm only the planned files are changed in addition to the pre-existing generated catalog and server log. Then commit:

```bash
git add client/src/pages/home.tsx client/src/pages/home.test.ts client/src/App.tsx
git commit -m "feat: link featured categories to collections"
```

## Final manual verification

- Open `http://localhost:5003/` and click each Featured Category card.
- Confirm Homemade shows 2 products, Honey shows 4, Oil & Ghee shows 2, and Nuts & Seeds shows 3.
- Confirm Jaggery, Semai, Fresh Mango, and Dates show exactly `No product found`.
- Confirm clicking a collection product opens the existing product detail page.
- Confirm `/products` still shows all 11 published products.
