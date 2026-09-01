# Live Latest Drop Catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the homepage Latest Drop grid render the four newest published Merchant-Suite products, including the newly published Pure Ghee product, without hardcoded catalog data.

**Architecture:** `Home` will use the existing TanStack Query catalog client rather than access Supabase or add another API path. The Latest Drop markup will map the public `StorefrontProduct` records through existing image and price helpers, retaining the page layout while product data refreshes on the established eight-second interval.

**Tech Stack:** React 19, TypeScript, TanStack Query v5, Framer Motion, Wouter, Merchant-Suite public catalog API.

## Global Constraints

- Do not add a Supabase client, direct database access, product data, stock data, prices, images, or workspace IDs to the storefront source.
- All catalog reads must use `client/src/lib/storefront-products.ts`; use `fetchStorefrontProducts()`, `getProductImage()`, `formatProductPriceRange()`, and `STOREFRONT_POLL_INTERVAL_MS`.
- Preserve the API's newest-first ordering and limit Latest Drop to four cards.
- Do not change checkout, public API routes, the other homepage product sections, or the user-owned `client/src/index.css` modification.
- Do not commit or push unless the user explicitly requests it.
- The existing `home.test.ts` has three pre-existing, unrelated stale assertions for the hero asset, hero layout, and reveal blur value. Do not alter those assertions in this scoped change; report their existing failures separately.

---

## File Structure

- `client/src/pages/home.tsx`: Homepage theme markup. Replace only the Latest Drop static product array and rendering path with the live catalog query.
- `client/src/pages/home.test.ts`: Source-level regression test ensuring Latest Drop uses the shared catalog client rather than static product records.

### Task 1: Test the Live Latest Drop Contract

**Files:**
- Modify: `client/src/pages/home.test.ts`

**Interfaces:**
- Consumes: `Home` source in `client/src/pages/home.tsx` and the existing `node:test` source-text test pattern.
- Produces: A regression assertion that fails if Latest Drop returns to a hardcoded product array or stops using the shared catalog integration.

- [ ] **Step 1: Add the failing source-level test**

Add this test after the existing Latest Drop header test:

```ts
test("loads Latest Drop from the public catalog", () => {
  const latestDropSource = homeSource.slice(
    homeSource.indexOf("Latest Drop Section"),
    homeSource.indexOf("Just Arrived Section"),
  );

  assert.match(homeSource, /import \{ useQuery \} from "@tanstack\/react-query";/);
  assert.match(homeSource, /fetchStorefrontProducts,/);
  assert.match(homeSource, /formatProductPriceRange,/);
  assert.match(homeSource, /getProductImage,/);
  assert.match(homeSource, /STOREFRONT_POLL_INTERVAL_MS,/);
  assert.match(homeSource, /queryFn: fetchStorefrontProducts,/);
  assert.match(homeSource, /refetchInterval: STOREFRONT_POLL_INTERVAL_MS,/);
  assert.doesNotMatch(homeSource, /const latestDropProducts = \[/);
  assert.match(latestDropSource, /latestDropProducts\.slice\(0, 4\)\.map/);
  assert.match(latestDropSource, /getProductImage\(product\)/);
  assert.match(latestDropSource, /formatProductPriceRange\(product\)/);
});
```

- [ ] **Step 2: Run the new test before the implementation**

Run:

```bash
node --test --test-name-pattern="loads Latest Drop from the public catalog" client/src/pages/home.test.ts
```

Expected: FAIL because `home.tsx` still declares `latestDropProducts` and does not query the public catalog.

### Task 2: Render Latest Drop from Merchant-Suite

**Files:**
- Modify: `client/src/pages/home.tsx:1-45,197-216,509-566`
- Test: `client/src/pages/home.test.ts`

**Interfaces:**
- Consumes: `fetchStorefrontProducts(): Promise<StorefrontProduct[]>`, `getProductImage(product)`, `formatProductPriceRange(product)`, and `STOREFRONT_POLL_INTERVAL_MS` from `@/lib/storefront-products`.
- Produces: A Latest Drop grid that displays `StorefrontProduct` data from the newest-first public catalog and updates every eight seconds.

- [ ] **Step 1: Add the shared query imports and remove the static Latest Drop array**

At the import block, add TanStack Query and the existing catalog helpers:

```ts
import { useQuery } from "@tanstack/react-query";
import {
  fetchStorefrontProducts,
  formatProductPriceRange,
  getProductImage,
  STOREFRONT_POLL_INTERVAL_MS,
} from "@/lib/storefront-products";
```

Delete only `const latestDropProducts = [...]`. Keep the unrelated static arrays for What's New, Just Arrived, and Special Collections unchanged.

- [ ] **Step 2: Query the live catalog inside `Home`**

Immediately after `const { addToCart } = useCart();`, add:

```ts
const { data: latestDropProducts = [], isLoading: isLatestDropLoading } = useQuery({
  queryKey: ["merchant-suite-products-home-latest-drop"],
  queryFn: fetchStorefrontProducts,
  refetchInterval: STOREFRONT_POLL_INTERVAL_MS,
});
```

This preserves the public API's newest-first response order. With the current catalog, Pure Ghee is the first card.

- [ ] **Step 3: Replace Latest Drop card data bindings**

Inside the existing Latest Drop grid, render four neutral placeholders while `isLatestDropLoading` is true. Otherwise map `latestDropProducts.slice(0, 4)`. Use a stable `product.id || product.slug` key, `getProductImage(product)` for the image source, `product.name` for accessible text, `/product/${product.slug}` for the link, and `formatProductPriceRange(product)` for the price.

Use this rendering shape while preserving the existing card classes and animations:

```tsx
{isLatestDropLoading
  ? Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="aspect-[3/4] animate-pulse bg-[#e5e5e5]" aria-hidden="true" />
    ))
  : latestDropProducts.slice(0, 4).map((product) => {
      const image = getProductImage(product);

      return (
        <motion.article key={product.id || product.slug} variants={reveal} transition={transition} className="group bg-[#f6f6f6]">
          <Link href={`/product/${product.slug}`} className="block h-full">
            <div className="aspect-[3/4] overflow-hidden bg-[#e5e5e5]">
              {image ? (
                <img src={image} alt={product.name} loading="lazy" className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.3em] text-black/30">No image</div>
              )}
            </div>
            <div className="space-y-2 pl-0 pr-3 pb-4 pt-3 md:pl-0 md:pr-4 md:pb-5">
              <h3 className="line-clamp-2 min-h-[2.4em] text-sm font-bold uppercase leading-tight tracking-[0.06em] md:min-h-[2.35em] md:text-base md:tracking-[0.08em]">{product.name}</h3>
              <p className="mt-4 whitespace-nowrap text-sm font-normal tracking-[0.02em] md:text-xl">{formatProductPriceRange(product)}</p>
            </div>
          </Link>
        </motion.article>
      );
    })}
```

An empty or failed request must render no stale product cards.

- [ ] **Step 4: Run the focused regression test**

Run:

```bash
node --test --test-name-pattern="loads Latest Drop from the public catalog" client/src/pages/home.test.ts
```

Expected: PASS.

### Task 3: Verify the Change Without Altering Product Data

**Files:**
- Verify: `client/src/pages/home.tsx`
- Verify: `client/src/pages/home.test.ts`
- Verify: `client/src/lib/generated-storefront-products.ts` worktree status after the build

**Interfaces:**
- Consumes: The implementation from Task 2 and the live public catalog contract.
- Produces: Evidence that the homepage compiles, the new regression passes, and the new product is published with live catalog data.

- [ ] **Step 1: Verify live catalog eligibility with a read-only database query**

Run a read-only query scoped to the fixed Mango Lover BD workspace:

```sql
select p.name, p.slug, p.published, p.published_at, p.created_at,
  count(pv.id) filter (where pv.stock_quantity > 0) as stocked_variants
from public.products p
join public.user_roles ur on ur.org_id = p.org_id
left join public.product_variants pv on pv.product_id = p.id and pv.org_id = p.org_id
where p.slug = 'pure-ghee'
group by p.id;
```

Expected: one published Pure Ghee row with stocked variants. Do not write to Supabase.

- [ ] **Step 2: Type-check the storefront**

Run:

```bash
npm run check
```

Expected: PASS.

- [ ] **Step 3: Run the homepage test file and classify existing failures**

Run:

```bash
node --test client/src/pages/home.test.ts
```

Expected: the new Latest Drop regression passes. The known pre-existing failures are the hero poster cache query string, hero aspect/min-height assertion, and reveal blur assertion; do not attribute them to this change.

- [ ] **Step 4: Build and inspect generated output status**

Run:

```bash
npm run build
git status --short
```

Expected: build succeeds. Check whether the build regenerated `client/src/lib/generated-storefront-products.ts`; do not stage, commit, or discard user-owned changes. Report any generated-file change explicitly.

## Self-Review

- Spec coverage: Task 2 implements shared public catalog loading, newest-first order, four-card limit, live image/price/slug bindings, loading placeholders, and no stale fallback. Task 3 checks published Pure Ghee data without a write.
- Placeholder scan: no deferred steps, unspecified error handling, or unnamed interfaces remain.
- Type consistency: every helper and `StorefrontProduct` shape comes from `@/lib/storefront-products`; no new data model or API is introduced.
