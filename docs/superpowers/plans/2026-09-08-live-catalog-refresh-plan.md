# Live Catalog Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the storefront revalidate the live Merchant Suite catalog immediately on every mount while preserving the generated snapshot as first-paint fallback.

**Architecture:** Add one catalog-specific TanStack Query options object in `storefront-products.ts`, then spread it into every product-listing query. The global `QueryClient` defaults remain unchanged; only catalog reads become immediately stale and always revalidate on mount.

**Tech Stack:** React 19, TanStack Query v5, TypeScript, Vite, Node test runner, Vercel.

## Global Constraints

- Keep the generated catalog snapshot as immediate fallback data.
- Do not add hardcoded product data or Supabase access to the storefront.
- Do not change global `QueryClient` defaults.
- Catalog live sync remains on `STOREFRONT_POLL_INTERVAL_MS = 8000`.
- Use the existing source-contract test style with `node:test` and `node:assert/strict`.

---

### Task 1: Add catalog freshness regression coverage

**Files:**
- Modify: `client/src/pages/products-loading.test.ts:1-19`
- Test: `client/src/pages/products-loading.test.ts`

**Interfaces:**
- Consumes: source files `client/src/lib/storefront-products.ts`, `client/src/pages/home.tsx`, `client/src/pages/products.tsx`, `client/src/components/product-grid.tsx`, `client/src/components/layout.tsx`, and `client/src/pages/product.tsx`.
- Produces: assertions that the shared catalog options force immediate revalidation and that every catalog query uses them.

- [ ] **Step 1: Extend the test sources loaded at the top of `products-loading.test.ts`**

Read the six source files with `readFileSync(new URL(..., import.meta.url), "utf8")`, alongside the existing products and product-grid sources.

- [ ] **Step 2: Write the failing assertions**

Add a test with these behavioral checks:

```ts
test("revalidates the live catalog instead of trusting the build snapshot", () => {
  assert.match(storefrontProductsSource, /STOREFRONT_CATALOG_QUERY_OPTIONS/);
  assert.match(storefrontProductsSource, /staleTime: 0/);
  assert.match(storefrontProductsSource, /refetchOnMount: "always"/);

  for (const source of [homeSource, productsSource, gridSource, layoutSource, productSource]) {
    assert.match(source, /\.\.\.STOREFRONT_CATALOG_QUERY_OPTIONS/);
  }
});
```

- [ ] **Step 3: Run the focused test and verify it fails**

Run: `node --test client/src/pages/products-loading.test.ts`

Expected: FAIL because the shared catalog options object and query spreads do not yet exist.

- [ ] **Step 4: Commit the failing test**

```bash
git add client/src/pages/products-loading.test.ts
git commit -m "test: require immediate catalog revalidation"
```

### Task 2: Implement catalog-specific immediate revalidation

**Files:**
- Modify: `client/src/lib/storefront-products.ts:1-10`
- Modify: `client/src/pages/home.tsx:1-100`
- Modify: `client/src/pages/products.tsx:1-90`
- Modify: `client/src/components/product-grid.tsx:1-90`
- Modify: `client/src/components/layout.tsx:1-155`
- Modify: `client/src/pages/product.tsx:1-215`

**Interfaces:**
- Consumes: existing `generatedStorefrontProducts`, `fetchStorefrontProducts`, and TanStack Query v5 `useQuery` calls.
- Produces: exported `STOREFRONT_CATALOG_QUERY_OPTIONS` with `staleTime: 0` and `refetchOnMount: "always"`, applied to all shared product-listing queries.

- [ ] **Step 1: Add the minimal shared options object**

In `storefront-products.ts`, add near `STOREFRONT_POLL_INTERVAL_MS`:

```ts
export const STOREFRONT_CATALOG_QUERY_OPTIONS = {
  staleTime: 0,
  refetchOnMount: "always" as const,
};
```

- [ ] **Step 2: Import and spread the options into every catalog listing query**

In `home.tsx`, `products.tsx`, `product-grid.tsx`, `layout.tsx`, and `product.tsx`, import `STOREFRONT_CATALOG_QUERY_OPTIONS` from `storefront-products.ts` and add:

```ts
...STOREFRONT_CATALOG_QUERY_OPTIONS,
```

inside each `useQuery` options object that calls `fetchStorefrontProducts`. Leave product-detail and inventory query behavior unchanged except for the existing polling.

- [ ] **Step 3: Run the focused regression test**

Run: `node --test client/src/pages/products-loading.test.ts`

Expected: PASS.

- [ ] **Step 4: Verify the options do not change unrelated query defaults**

Confirm `client/src/lib/queryClient.ts` has no changes and still contains `staleTime: Infinity`, `refetchOnWindowFocus: false`, and `retry: false`.

- [ ] **Step 5: Commit the implementation**

```bash
git add client/src/lib/storefront-products.ts client/src/pages/home.tsx client/src/pages/products.tsx client/src/components/product-grid.tsx client/src/components/layout.tsx client/src/pages/product.tsx
git commit -m "fix: revalidate storefront catalog on mount"
```

### Task 3: Verify and deploy the storefront fix

**Files:**
- No additional source files.

**Interfaces:**
- Consumes: the two implementation commits and the existing Vercel deployment from `main`.
- Produces: passing tests/check/build and a deployed storefront that retains new products after refresh.

- [ ] **Step 1: Run the complete storefront test suite**

Run: `node --test client/src/**/*.test.ts`

Expected: all tests pass with zero failures.

- [ ] **Step 2: Run TypeScript checking**

Run: `npm run check`

Expected: exit code 0 with no TypeScript errors.

- [ ] **Step 3: Run the production build**

Run: `NODE_ENV=production npm run build`

Expected: exit code 0 and a generated snapshot build without modifying catalog source files unexpectedly.

- [ ] **Step 4: Inspect the final diff**

Run: `git diff origin/main...HEAD --check` and `git status --short`.

Expected: no whitespace errors and no untracked/generated files beyond intentional build outputs ignored by git.

- [ ] **Step 5: Push `main`**

Run: `git push origin main`

Expected: Vercel creates a production deployment from the storefront `main` branch.

- [ ] **Step 6: Verify the live behavior**

After Vercel reports deployment completion, request the storefront twice and confirm the page bundle is current. Confirm the Merchant Suite endpoint still returns the newly published slugs and that a hard refresh does not fall back permanently to the generated snapshot.
