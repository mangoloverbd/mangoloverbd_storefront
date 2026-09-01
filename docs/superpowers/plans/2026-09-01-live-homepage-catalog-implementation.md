# Live Homepage Catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render all four homepage product-card sections from the newest-first Merchant-Suite public catalog without hardcoded storefront product records.

**Architecture:** `Home` retains one TanStack Query call to `fetchStorefrontProducts()` using the existing catalog cache key and polling interval. Its result becomes one `catalogProducts` source for What’s New, Latest Drop, Just Arrived, and Special Collections; each section retains its layout while taking its own capped slice. Static product metadata and quick-add controls are removed because product pages own live variant selection.

**Tech Stack:** React 19, TypeScript, TanStack Query v5, Framer Motion, Wouter, Merchant-Suite public catalog API.

## Global Constraints

- Use only `fetchStorefrontProducts()`, `getProductImage()`, `formatProductPriceRange()`, and `STOREFRONT_POLL_INTERVAL_MS` from `client/src/lib/storefront-products.ts` for homepage catalog data.
- Keep the `merchant-suite-products-listing` query key and newest-first API order.
- Render the same live catalog in every product-card section, capped at six / four / four / three cards for What’s New / Latest Drop / Just Arrived / Special Collections.
- Product cards link to `/product/${product.slug}`; do not restore fixed quick-add behavior or derive a default variant.
- Preserve hero, category, editorial, and essentials sections. Do not modify Merchant-Suite, Supabase, checkout, or user-owned `client/src/index.css`.
- Do not commit or push unless the user explicitly requests it.
- Do not retain build-generated changes to `client/src/lib/generated-storefront-products.ts` as part of this work.

---

## File Structure

- `client/src/pages/home.tsx`: owns one live catalog query and the four homepage product section presentations.
- `client/src/pages/home.test.ts`: source-level regression checks for the shared live catalog contract and removal of static product behavior.
- `client/src/lib/generated-storefront-products.ts`: verification-only artifact; restore it to its pre-build contents if a production build rewrites it.

### Task 1: Define the Shared Homepage Catalog Contract

**Files:**
- Modify: `client/src/pages/home.test.ts:7-97`

**Interfaces:**
- Consumes: `Home` source text and the existing `node:test` source-level testing convention.
- Produces: Regression coverage that all four product sections consume `catalogProducts` and no static homepage product arrays remain.

- [ ] **Step 1: Replace static-product assertions with a failing live-catalog test**

Replace tests that require `whatsNewProducts`, `justArrivedProducts`, fixed quick-add functions, fake size counts, static category labels, and collection count superscripts with this contract:

```ts
test("loads every homepage product section from the public catalog", () => {
  const whatsNewSource = homeSource.slice(
    homeSource.indexOf("What's New Section"),
    homeSource.indexOf("Latest Drop Section"),
  );
  const latestDropSource = homeSource.slice(
    homeSource.indexOf("Latest Drop Section"),
    homeSource.indexOf("Just Arrived Section"),
  );
  const justArrivedSource = homeSource.slice(
    homeSource.indexOf("Just Arrived Section"),
    homeSource.indexOf("Editorial Section"),
  );
  const specialSource = homeSource.slice(
    homeSource.indexOf("Special Collections Section"),
  );

  assert.match(homeSource, /data: catalogProducts = \[\]/);
  assert.match(homeSource, /queryKey: \["merchant-suite-products-listing"\],/);
  assert.match(homeSource, /queryFn: fetchStorefrontProducts,/);
  assert.doesNotMatch(homeSource, /const whatsNewProducts = \[/);
  assert.doesNotMatch(homeSource, /const justArrivedProducts = \[/);
  assert.doesNotMatch(homeSource, /const specialProducts = \[/);
  assert.doesNotMatch(homeSource, /useCart/);
  assert.doesNotMatch(homeSource, /Quick add/);
  assert.match(whatsNewSource, /catalogProducts\.slice\(0, 6\)\.map/);
  assert.match(latestDropSource, /catalogProducts\.slice\(0, 4\)\.map/);
  assert.match(justArrivedSource, /catalogProducts\.slice\(0, 4\)\.map/);
  assert.match(specialSource, /catalogProducts\.slice\(0, 3\)\.map/);
});
```

- [ ] **Step 2: Run the contract before implementation**

Run: `node --test --test-name-pattern="loads every homepage product section from the public catalog" client/src/pages/home.test.ts`

Expected: FAIL because What’s New, Just Arrived, and Special Collections still reference static arrays.

### Task 2: Render All Homepage Product Sections from the Shared Catalog

**Files:**
- Modify: `client/src/pages/home.tsx:1-290,413-650,745-804`
- Test: `client/src/pages/home.test.ts`

**Interfaces:**
- Consumes: `fetchStorefrontProducts(): Promise<StorefrontProduct[]>`, `getProductImage(product)`, `formatProductPriceRange(product)`, and `STOREFRONT_POLL_INTERVAL_MS`.
- Produces: One newest-first `catalogProducts` array and four live card groups that link to product pages.

- [ ] **Step 1: Remove static catalog and quick-add plumbing**

Delete the `useCart` and `MouseEvent` imports, `whatsNewProducts`, `justArrivedProducts`, `specialProducts`, `addToCart`, and all three quick-add functions. Keep the scroll refs and their wheel/touch behavior because What’s New and Just Arrived retain their existing mobile carousels.

- [ ] **Step 2: Rename the existing query state to catalog-wide names**

Use the following query shape immediately inside `Home`:

```ts
const {
  data: catalogProducts = [],
  isError: isCatalogError,
  isLoading: isCatalogLoading,
} = useQuery({
  queryKey: ["merchant-suite-products-listing"],
  queryFn: fetchStorefrontProducts,
  refetchInterval: STOREFRONT_POLL_INTERVAL_MS,
});
```

This preserves previously loaded cards during a background refresh error because error UI is only selected when `catalogProducts.length === 0`.

- [ ] **Step 3: Replace What’s New with six live cards**

Remove the Jackets/Hoodies/T-Shirt row, LAST FEW badge, and quick-add button. Keep its heading, mobile scroller, desktop grid, animation, and card dimensions. Render skeletons while `isCatalogLoading`, an error panel only for `isCatalogError && catalogProducts.length === 0`, otherwise `catalogProducts.slice(0, 6).map((product) => ...)`.

Each card must use this live data pattern:

```tsx
const image = getProductImage(product);

<Link href={`/product/${product.slug}`} className="block h-full">
  <div className="relative aspect-[3/4] overflow-hidden bg-[#ededed]">
    {image ? (
      <img src={image} alt={product.name} loading="lazy" className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105" />
    ) : (
      <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.3em] text-black/30">No image</div>
    )}
    {product.available === false && <span className="absolute left-4 top-4 bg-neutral-500/70 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.3em] text-white">Sold out</span>}
  </div>
  <div className="pb-2 pt-5 text-black md:pt-7">
    <h3>{product.name}</h3>
    <p>{formatProductPriceRange(product)}</p>
  </div>
</Link>
```

- [ ] **Step 4: Update Latest Drop, Just Arrived, and Special Collections to the same source**

Keep their existing headings and responsive wrappers. Replace all section-specific data references with `catalogProducts` and use these exact limits:

```tsx
catalogProducts.slice(0, 4).map((product) => /* Latest Drop */)
catalogProducts.slice(0, 4).map((product) => /* Just Arrived */)
catalogProducts.slice(0, 3).map((product) => /* Special Collections */)
```

For each card, use `product.id || product.slug` as its key, `getProductImage(product)`, `product.name`, `formatProductPriceRange(product)`, and `/product/${product.slug}`. Keep the Sold out treatment, no-image fallback, error state, and reduced-motion skeleton behavior consistent with Latest Drop. Remove the Just Arrived fake size line and the Special Collections count superscript.

- [ ] **Step 5: Run the focused contract after implementation**

Run: `node --test --test-name-pattern="loads every homepage product section from the public catalog" client/src/pages/home.test.ts`

Expected: PASS.

### Task 3: Verify Live Source, Build, and Worktree Scope

**Files:**
- Verify: `client/src/pages/home.tsx`
- Verify: `client/src/pages/home.test.ts`
- Verify: `client/src/lib/generated-storefront-products.ts`

**Interfaces:**
- Consumes: The live shared catalog implementation from Task 2 and the local Vite server at `http://localhost:5001/`.
- Produces: Evidence that Pure Ghee is returned first by the public API and the local Vite server contains the dynamic source.

- [ ] **Step 1: Confirm the public catalog response**

Run:

```bash
node --env-file=.env --input-type=module -e 'const base = process.env.VITE_MERCHANT_SUITE_URL?.replace(/\/$/, ""); const id = process.env.VITE_STOREFRONT_ID ?? "2a155750-b11a-4ff2-a7ff-4e26daac46ef"; const response = await fetch(`${base}/api/public/v1/storefronts/${id}/products`, { headers: { "ngrok-skip-browser-warning": "true" } }); const payload = await response.json(); console.log(payload.products?.slice(0, 6).map((product) => product.slug));'
```

Expected: the list includes `pure-ghee` in newest-first order.

- [ ] **Step 2: Verify the running Vite source contains the shared query**

Run:

```bash
curl -fsS http://localhost:5001/src/pages/home.tsx -o /var/folders/ks/66d7f7mj5gb4r4cfw1wmzrjh0000gn/T/opencode/home-vite-source.tsx
node -e 'const fs = require("node:fs"); const source = fs.readFileSync("/var/folders/ks/66d7f7mj5gb4r4cfw1wmzrjh0000gn/T/opencode/home-vite-source.tsx", "utf8"); console.log(source.includes("data: catalogProducts = []"));'
```

Expected: `true`.

- [ ] **Step 3: Run focused tests and the production build**

Run:

```bash
node --test --test-name-pattern="loads every homepage product section from the public catalog" client/src/pages/home.test.ts
npm run build
```

Expected: focused test and build pass. The build may rewrite `client/src/lib/generated-storefront-products.ts`; remove only the generated diff before reporting the final worktree status.

- [ ] **Step 4: Classify known unrelated failures**

Run:

```bash
npm run check
node --test client/src/pages/home.test.ts
```

Expected: `npm run check` still reports the unrelated `IconWeight` mismatch in `client/src/components/layout.tsx`; the full homepage test file may still report the known stale hero and reveal assertions. Do not modify those unrelated checks in this task.

## Self-Review

- Spec coverage: Task 2 covers all four product-card sections, shared API data, caps, links, image/price/availability rendering, loading/error behavior, and removal of static-only controls. Task 3 verifies the active localhost source and production bundle.
- Placeholder scan: all tasks name concrete files, commands, limits, query keys, states, and exact source-level assertions.
- Type consistency: all product data comes from the existing `StorefrontProduct` contract; no new API or data type is introduced.
