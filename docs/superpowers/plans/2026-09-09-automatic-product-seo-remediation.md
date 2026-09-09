# Automatic Product SEO Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove legacy template URLs and false product `200` responses from Google, while automatically rebuilding static SEO files whenever a Merchant Suite product's indexable state or static metadata changes.

**Architecture:** Keep the existing Vite-generated product HTML and sitemap instead of adding request-time product rendering. The Merchant Suite remains the sole product source: its published public catalog is fetched during a Vercel production build, and product mutations queue and start a Vercel deployment. A server-only daily Vercel Cron checks the tracked deployment until it reaches `READY` and retries failed submissions or builds. Vercel filesystem routing serves generated active product pages; unknown and unpublished product paths bypass the SPA rewrite and receive Vercel's real `404`; seven confirmed legacy template paths rewrite to one `410` function.

**Tech Stack:** React 19, Vite, TypeScript, Node `node:test`, Vercel static hosting and Functions, Express ESM, Vitest, Supabase `app_settings`, Vercel REST API, Vercel Cron.

## Global Constraints

- Merchant Suite owns product state. The storefront must not hardcode Mango Lover product names, prices, stock, SEO records, or use Supabase directly.
- `products.published === true` is the only active storefront lifecycle state. An unpublished seasonal mango is hidden from grids and returns a real `404` until it is published again; it does not receive `410`.
- The public catalog is the build's sole product input. An active product receives generated `200` HTML and sitemap membership; an unpublished, deleted, or unknown slug receives `404`; the exact seven legacy template paths receive `410`.
- Do not create crawler-, referrer-, or IP-specific behavior. A route's status, HTML, and robots directive must be the same for every visitor.
- Static Product JSON-LD must include only data the build can truthfully know. It must not emit volatile stock `availability`; live stock remains in Merchant Suite's inventory API.
- Treat all public catalog strings as untrusted. Escape HTML attributes and serialize JSON-LD so a product value cannot terminate a script tag.
- Reuse `client/src/lib/storefront-products.ts` for browser catalog reads. Keep Vercel and local checkout paths unchanged.
- Reuse the existing Merchant Suite `vercelApi()` and fixed workspace helpers. Do not accept an org/workspace id from a request, query string, or cron caller.
- `CRON_SECRET`, `VERCEL_ACCESS_TOKEN`, and project configuration remain server-side Vercel environment variables. Never commit values or add a `VITE_` secret.
- Do not create test orders or mutate production catalog data solely for verification.
- Preserve the user-owned uncommitted `client/src/lib/generated-storefront-products.ts` change. A build may rewrite it temporarily, but restore the exact pre-build file and never stage it.
- Do not commit or deploy from this planning task. Implementation commits named below are for the executing engineer.

---

## Approved Decision Amendment

The earlier dynamic-server design is superseded by these implementation decisions made during engineering review:

| Public state | Merchant Suite representation | Public product URL | Sitemap | Search signal |
|---|---|---|---|---|
| Active | `published: true` | Generated static `200` product page | Included | `index, follow` |
| Seasonal/unavailable | `published: false` | Vercel filesystem miss, real `404` | Excluded | `404` response; no product page generated |
| Deleted/unknown | No published public record | Vercel filesystem miss, real `404` | Excluded | `404` response |
| Legacy template | Exact routing allowlist only | Shared function, `410` | Excluded | `X-Robots-Tag: noindex, follow` |

The permanent legacy allowlist is deliberately limited to:

```text
stepprs-massage-insoles
massage-insoles
4-in-1-makeup-pen
bordeaux
plum-veil
rosy-bloom
mauve-nude
```

### Data and deployment flow

```text
Authenticated Merchant Suite product mutation
        |
        +--> products/product_images write (fixed org guard)
        |
        +--> existing public-catalog cache purge
        |
        +--> enqueue latest JSON job in app_settings
                 |
                 +--> POST Vercel deployment from storefront main
                 |       |
                 |       +--> Vite build GETs public published catalog once
                 |       |       |
                 |       |       +--> generated snapshot + /product/:slug/index.html
                 |       |       +--> active-only sitemap.xml
                 |       |
                 |       +--> Vercel reports READY -> clear job
                 |
                 +--> request/build error -> keep job for daily cron retry

Public request /product/:slug
        |
        +--> exact legacy rewrite -> /api/legacy-gone -> 410
        +--> generated filesystem product file -> 200
        +--> no file and no SPA rewrite -> Vercel 404
```

## File Structure

### Storefront repository

- `docs/superpowers/specs/2026-09-09-dynamic-product-seo-remediation-design.md`: records the approved static-build and unpublished-404 amendment so it no longer conflicts with this plan.
- `script/storefront-seo-artifacts.ts`: pure catalog-resolution, HTML metadata, JSON-LD, and sitemap helpers used by the build and tested without invoking Vite.
- `script/storefront-seo-artifacts.test.ts`: `node:test` behavior coverage for catalog failure modes, XML output, and hostile catalog strings.
- `script/build.ts`: orchestration only: fetch/write a fresh snapshot, invoke Vite, write active product routes, and write the sitemap.
- `api/legacy-gone.ts`: one small Vercel Function returning a constant, noindex `410` response.
- `api/legacy-gone.test.ts`: unit coverage for the function's status, headers, and body.
- `vercel.json`: exact legacy rewrites before the SPA fallback; product routes excluded from that fallback.
- `script/vercel-routing.test.mjs`: regression checks for the filesystem/legacy/SPA routing boundary and cache headers.
- `client/src/lib/storefront-products.ts`: distinguishes a confirmed public-product `404` from transport and server failures.
- `client/src/lib/storefront-products.test.ts`: browser API-client tests for `404 -> null` and non-404 failure behavior.
- `client/src/pages/product.tsx`: clears stale local data only after an authoritative detail `404`.
- `client/src/pages/product.test.ts`: source-level regression contract for the authoritative-404 branch.
- `README.md`: documents automatic product SEO deployments and the no-manual-redeploy expectation.

### Merchant Suite repository (`../mangoloverbd_commerceos`)

- `server/storefrontSeoRefresh.js`: standalone, dependency-injected durable refresh-job state machine and constant-time cron authorization helper.
- `src/test/storefrontSeoRefresh.test.ts`: Vitest coverage for queue, submit, `READY`, failed/canceled, stale, malformed-job, and auth branches.
- `server/index.js`: adapts the job module to `app_settings`, the existing Vercel API helper, authenticated product mutation routes, and the server-only cron endpoint.
- `src/test/storefrontSeoRefreshWiring.test.ts`: source/config regression checks that every SEO-relevant mutation queues the job, stock/variant routes do not, and cron is server-authenticated.
- `vercel.json`: adds one production-only daily cron entry for the internal retry route.
- `.env.example`: documents blank server-only variables required to operate automatic SEO deployments.

## Test Coverage Map

```text
STORE FRONT BUILD                                  MERCHANT SUITE REFRESH JOB
  public catalog success -> artifacts [unit]         enqueue -> immediate deploy [unit]
  public catalog 5xx in production -> throw [unit]   Vercel accepts -> track deployment ID [unit]
  non-production failure -> current snapshot [unit]  READY -> clear job [unit]
  unsafe text/URL -> escaped markup [unit]           ERROR/CANCELED/stale -> retry [unit]
  no inventory availability claim [unit]              malformed JSON -> safe replacement [unit]

VERCEL ROUTING                                     BROWSER DETAIL STATE
  legacy exact path -> 410/noindex [unit]            public 404 -> null [unit]
  any /product/* bypasses SPA [config]               confirmed null -> clear cache/UI [source test]
  generated file -> filesystem 200 [public smoke]    5xx/network error -> retain fallback [unit/source]
  unknown/unpublished -> real 404 [public smoke]
```

### Task 1: Record the Superseding Product SEO Contract

**Files:**
- Modify: `docs/superpowers/specs/2026-09-09-dynamic-product-seo-remediation-design.md:9-66`

**Interfaces:**
- Consumes: the approved decisions table above.
- Produces: one unambiguous source of truth for implementation, QA, and Google Search Console cleanup.

- [ ] **Step 1: Replace the dynamic lifecycle language with the approved static-build contract**

  Add an `## Implementation amendment (2026-09-09)` section immediately after `## Decisions`. State that automatic Vercel deployments replace request-time server rendering; that `published: false` means a real `404`, not a seasonal `200 + noindex`; and that static JSON-LD omits volatile inventory availability. Preserve the original design below it as historical context rather than silently editing its decisions out of existence.

- [ ] **Step 2: Replace the scope and verification bullets that require a lifecycle API or dynamic sitemap function**

  State that the already-existing versioned public `GET .../products` catalog is the build input, only published products become static route files and sitemap entries, and Merchant Suite triggers a build after SEO-relevant writes. List the seven exact `410` slugs from the allowlist above. Update the verification table to expect a seasonal/unpublished slug to return `404`.

- [ ] **Step 3: Add the deployment-failure contract**

  Document these non-negotiable outcomes:

  ```text
  Catalog fetch fails during a production build -> fail the build; do not deploy stale SEO files.
  Vercel accepts but the build fails -> retain the pending job and retry daily.
  Vercel rejects/times out -> retain the pending job and retry daily.
  Stock changes -> no SEO deployment and no static availability claim.
  ```

- [ ] **Step 4: Review the amended document against this plan**

  Confirm that it no longer asks for a public lifecycle state, a dynamic product route, or a dynamic sitemap function. Confirm it still prohibits direct storefront Supabase access and crawler-specific responses.

- [ ] **Step 5: Commit the documentation-only change**

  ```bash
  git add docs/superpowers/specs/2026-09-09-dynamic-product-seo-remediation-design.md
  git commit -m "docs: align product SEO remediation contract"
  ```

### Task 2: Make Static SEO Artifact Generation Testable and Fail Closed in Production

**Files:**
- Create: `script/storefront-seo-artifacts.ts`
- Create: `script/storefront-seo-artifacts.test.ts`
- Modify: `script/build.ts:1-199`

**Interfaces:**
- Consumes: `GET https://admin.mangolover.com.bd/api/public/v1/storefronts/<VITE_STOREFRONT_ID>/products`, whose `products` array contains published public products only.
- Produces: `resolveStorefrontBuildCatalog()`, `injectProductMeta()`, and `createSitemapXml()` for `script/build.ts`.
- Produces: `BuildCatalogResult = { products: BuildProduct[]; source: "live" | "fallback" }`, where only `source: "live"` may overwrite `generated-storefront-products.ts`.

- [ ] **Step 1: Write failing unit tests for catalog source selection**

  Create `script/storefront-seo-artifacts.test.ts` using `node:test` and injectable fake `fetch`/fallback readers. Cover all four outcomes:

  ```ts
  test("uses an empty successful public catalog as an empty catalog", async () => {
    const result = await resolveStorefrontBuildCatalog({
      storefrontProductsUrl: "https://suite.test/products",
      production: true,
      fetchImpl: async () => new Response(JSON.stringify({ products: [] }), { status: 200 }),
      readFallbackProducts: async () => [{ name: "Old", slug: "old" }],
    });

    assert.deepEqual(result, { products: [], source: "live" });
  });

  test("fails a production build rather than returning stale product SEO files", async () => {
    await assert.rejects(
      () => resolveStorefrontBuildCatalog({
        storefrontProductsUrl: "https://suite.test/products",
        production: true,
        fetchImpl: async () => new Response("down", { status: 503 }),
        readFallbackProducts: async () => [{ name: "Old", slug: "old" }],
      }),
      /Could not refresh storefront SEO catalog/,
    );
  });

  test("uses the previous snapshot only outside production", async () => {
    const result = await resolveStorefrontBuildCatalog({
      storefrontProductsUrl: "https://suite.test/products",
      production: false,
      fetchImpl: async () => { throw new Error("offline"); },
      readFallbackProducts: async () => [{ name: "Cached", slug: "cached" }],
    });

    assert.deepEqual(result, {
      products: [{ name: "Cached", slug: "cached" }],
      source: "fallback",
    });
  });
  ```

- [ ] **Step 2: Run the new catalog tests before implementation**

  Run: `node --test script/storefront-seo-artifacts.test.ts`

  Expected: FAIL because `script/storefront-seo-artifacts.ts` does not yet export `resolveStorefrontBuildCatalog`.

- [ ] **Step 3: Implement the pure artifact module**

  Define the minimal public shape and helpers below. Do not add a product fallback array.

  ```ts
  export type BuildProduct = {
    slug: string;
    name: string;
    description?: string | null;
    image_url?: string | null;
    price?: string | number | null;
  };

  export type BuildCatalogResult = {
    products: BuildProduct[];
    source: "live" | "fallback";
  };

  export async function resolveStorefrontBuildCatalog(options: {
    storefrontProductsUrl: string;
    production: boolean;
    fetchImpl?: typeof fetch;
    readFallbackProducts: () => Promise<BuildProduct[]>;
  }): Promise<BuildCatalogResult>;

  export function injectProductMeta(baseHtml: string, product: BuildProduct): string;
  export function createSitemapXml(products: BuildProduct[]): string;
  ```

  `resolveStorefrontBuildCatalog()` must accept an empty `products` array as a valid live result. For a non-OK response, JSON parse error, or transport error, throw `new Error("Could not refresh storefront SEO catalog: <safe reason>")` when `production` is true. Outside production, call `readFallbackProducts()` and return `{ source: "fallback" }`; if its parsed result is absent or invalid, return an empty array, not invented slugs.

  Build metadata from the fixed site origin and an encoded slug. Validate product image URLs as `http:` or `https:` before using them; otherwise use the fixed Open Graph image. Escape every attribute value with `&amp;`, `&lt;`, `&gt;`, and `&quot;`. Serialize JSON-LD with a helper that replaces `<`, `>`, `&`, U+2028, and U+2029 with JSON escapes before placing it inside `<script type="application/ld+json">`. Keep `Offer.priceCurrency` and `Offer.price`, but omit `Offer.availability` entirely.

  Add `data-seo="canonical"` to the generated canonical link and `data-seo="product"` to the generated JSON-LD script. `ProductPage` already removes exactly those markers before adding hydrated live metadata; without them, a hydrated page would carry duplicate canonical and Product JSON-LD nodes.

  `createSitemapXml()` must emit homepage, `/products`, `/booking`, and one encoded `/product/<slug>` URL for each supplied product. Escape XML text and deduplicate slugs. It must not synthesize a product URL when the list is empty.

- [ ] **Step 4: Add metadata, JSON-LD, and sitemap regression tests**

  Add tests that pass a product containing both an attribute-breaking image URL and a closing-script sequence:

  ```ts
  const html = injectProductMeta(indexHtml, {
    name: 'Mango </script><script>bad()</script>',
    slug: "raw mango/2026",
    description: '" onmouseover="bad()",
    image_url: 'https://images.test/x" onerror="bad()',
    price: 1200,
  });

  assert.match(html, /raw%20mango%2F2026/);
  assert.match(html, /\\u003c\/script\\u003e/);
  assert.doesNotMatch(html, /<script>bad\(\)<\/script>/);
  assert.match(html, /&quot; onerror=&quot;bad\(\)/);
  assert.doesNotMatch(html, /"availability"/);
  assert.match(html, /<link[^>]+data-seo="canonical"/);
  assert.match(html, /<script[^>]+data-seo="product"/);
  ```

  Also assert that `createSitemapXml([{ slug: "active", name: "Active" }])` contains `/product/active`, and that an empty product list contains no `/product/` entry.

- [ ] **Step 5: Refactor `script/build.ts` to use the tested helpers**

  Remove `fallbackSlugs`, the inline `BuildProduct` type, inline escaping, inline metadata injection, and inline sitemap construction. Read the existing generated TypeScript file only through a `readFallbackProducts()` adapter. Write `generated-storefront-products.ts` only after `source === "live"`; never overwrite it with a local fallback or an empty error result.

  Use `const production = process.env.NODE_ENV === "production"` when resolving the catalog. For production, let the helper's error reject `buildAll()` before Vite runs or output files are written. On a live empty catalog, still run Vite and write an empty sitemap without product route directories. Generate directories only from `products.map((product) => product.slug)`; do not retain an `effective` fallback list.

- [ ] **Step 6: Run the artifact tests after implementation**

  Run: `node --test script/storefront-seo-artifacts.test.ts`

  Expected: PASS, including live-empty, production failure, local fallback, hostile metadata, and empty-sitemap cases.

- [ ] **Step 7: Run a production build without retaining generated user work**

  Run this guarded command from the storefront repository:

  ```bash
  backup=/private/var/folders/ks/66d7f7mj5gb4r4cfw1wmzrjh0000gn/T/opencode/generated-storefront-products.before-seo-build.ts
  cp client/src/lib/generated-storefront-products.ts "$backup"
  npm run build
  status=$?
  cp "$backup" client/src/lib/generated-storefront-products.ts
  rm -f "$backup"
  exit "$status"
  ```

  Expected: the build succeeds when the public catalog is reachable. Check `dist/public/sitemap.xml` contains only API-returned published product slugs, then run `git diff -- client/src/lib/generated-storefront-products.ts`; expected output is empty because the user-owned file was restored.

- [ ] **Step 8: Commit the build artifact work**

  ```bash
  git add script/storefront-seo-artifacts.ts script/storefront-seo-artifacts.test.ts script/build.ts
  git commit -m "fix: generate product SEO from fresh catalog data"
  ```

### Task 3: Make Vercel Product Routing Honest

**Files:**
- Create: `api/legacy-gone.ts`
- Create: `api/legacy-gone.test.ts`
- Modify: `vercel.json:1-63`
- Modify: `script/vercel-routing.test.mjs:1-57`

**Interfaces:**
- Consumes: Vercel filesystem precedence for generated `dist/public/product/<slug>/index.html` files.
- Produces: `sendLegacyGone(res)` and an exact `vercel.json` rewrite contract.

- [ ] **Step 1: Add failing routing assertions**

  Extend `script/vercel-routing.test.mjs` so the SPA regular expression must not match any product route:

  ```js
  for (const route of ["/product/active", "/product/not-real", "/product"]) {
    assert.equal(matchesFallback.test(route), false, `${route} must bypass the SPA fallback`);
  }
  ```

  Parse the rewrite list and assert it contains each exact legacy source and that each destination equals `/api/legacy-gone`. Keep the existing assertion that `/product/honey` receives HTML `no-store` caching headers; routing and cache headers are separate concerns.

- [ ] **Step 2: Add a failing 410 handler test**

  Create a small fake `ServerResponse` with `statusCode`, `setHeader()`, and `end()`. Test the exported handler with these exact expectations:

  ```ts
  assert.equal(response.statusCode, 410);
  assert.equal(response.headers["x-robots-tag"], "noindex, follow");
  assert.equal(response.headers["cache-control"], "no-store");
  assert.match(response.body, /no longer available/i);
  ```

- [ ] **Step 3: Run the new tests before implementation**

  Run:

  ```bash
  node --test script/vercel-routing.test.mjs
  node --test api/legacy-gone.test.ts
  ```

  Expected: routing assertions fail because `/product/*` still matches the SPA fallback; the handler test fails because the module does not exist.

- [ ] **Step 4: Implement the constant 410 response**

  Create `api/legacy-gone.ts` using the existing `api/orders.ts` Node request/response type style. Export a named `sendLegacyGone(res)` for unit testing and a default handler that calls it. The body must be a small, static Mango Lover HTML document with a `noindex, follow` meta tag and a link to `/products`; it must not mention Stepprs, echo a requested slug, or inspect user agent, referrer, IP address, query parameters, or request body.

  Set these exact response properties before ending it:

  ```ts
  res.statusCode = 410;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex, follow");
  ```

- [ ] **Step 5: Replace redirects with exact legacy rewrites and exclude product routes from the SPA rewrite**

  Delete the current `redirects` array; none of its seven targets is an equivalent Mango Lover page. Add seven exact rewrites before the SPA fallback, one per allowlisted slug:

  ```json
  { "source": "/product/stepprs-massage-insoles", "destination": "/api/legacy-gone" }
  ```

  Use the same shape for the other six slugs. Change only the SPA rewrite source to exclude `product` paths while retaining its API, assets, and file-extension exclusions:

  ```json
  "/((?!api(?:/|$)|assets(?:/|$)|product(?:/|$)|.*\\.[^/]+$).*)"
  ```

  Leave the existing broad no-store HTML header rule in place so generated product HTML remains revalidated even though it no longer reaches the SPA rewrite. Do not add an arbitrary catch-all 410 rule.

- [ ] **Step 6: Run routing and handler tests after implementation**

  Run:

  ```bash
  node --test script/vercel-routing.test.mjs
  node --test api/legacy-gone.test.ts
  ```

  Expected: PASS. Static generated product files will be served by Vercel's filesystem before rewrites; any absent `/product/*` path now falls through to Vercel's actual 404.

- [ ] **Step 7: Commit truthful public routing**

  ```bash
  git add api/legacy-gone.ts api/legacy-gone.test.ts vercel.json script/vercel-routing.test.mjs
  git commit -m "fix: return truthful product SEO statuses"
  ```

### Task 4: Clear Stale Product Detail Data Only After an Authoritative 404

**Files:**
- Modify: `client/src/lib/storefront-products.ts:207-219`
- Modify: `client/src/lib/storefront-products.test.ts:1-120`
- Modify: `client/src/pages/product.tsx:197-328`
- Modify: `client/src/pages/product.test.ts:1-127`

**Interfaces:**
- Consumes: Merchant Suite detail endpoint behavior: a published product returns `{ product }`; unpublished and unknown slugs return HTTP `404`.
- Produces: `fetchStorefrontProduct(slug): Promise<StorefrontProduct | null>`, where `null` means confirmed absence and a thrown error means a retryable transport/server failure.

- [ ] **Step 1: Add failing API-client tests**

  In `client/src/lib/storefront-products.test.ts`, mock `globalThis.fetch` with restoration in a `try/finally` block. Add these contracts:

  ```ts
  test("returns null only when the public product endpoint confirms a 404", async () => {
    globalThis.fetch = async () => new Response("missing", { status: 404 });
    assert.equal(await fetchStorefrontProduct("seasonal-mango"), null);
  });

  test("keeps a 500 distinguishable from a confirmed missing product", async () => {
    globalThis.fetch = async () => new Response("upstream error", { status: 500 });
    await assert.rejects(() => fetchStorefrontProduct("active-mango"), /Could not load product/);
  });
  ```

- [ ] **Step 2: Add a failing ProductPage source contract**

  Add source-level assertions that the page uses TanStack Query's `isFetchedAfterMount`, creates an explicit authoritative-missing predicate, and clears component cache state on that predicate. Assert it does not use `isError` as proof that a product is missing; a `500` must continue to use the generated/local fallback.

- [ ] **Step 3: Run the focused tests before implementation**

  Run:

  ```bash
  node --test --test-name-pattern="confirmed a 404|500 distinguishable" client/src/lib/storefront-products.test.ts
  node --test client/src/pages/product.test.ts
  ```

  Expected: FAIL because all non-OK detail responses currently throw and `ProductPage` always falls through to cached/generated data after an error.

- [ ] **Step 4: Implement the narrow 404 contract**

  Update `fetchStorefrontProduct()` exactly as follows before its generic non-OK branch:

  ```ts
  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error("Could not load product.");
  }
  ```

  In `ProductPage`, destructure `isFetchedAfterMount` from the detail query. Derive:

  ```ts
  const productMissingFromMerchant = isFetchedAfterMount && merchantProduct === null;
  const product = productMissingFromMerchant
    ? null
    : mergeInventory(merchantProduct ?? cachedProduct, merchantInventory?.inventory) || generatedProduct;
  ```

  Use `isFetchedAfterMount` rather than `isFetched` in the cache-cleanup effect. When `merchantProduct === null`, call both `removeCachedStorefrontProduct(window.localStorage, slug)` and `setCachedProduct(null)`. Preserve cache/generated fallback for a rejected query, timeout, or `500`; do not turn network failures into a client-side 404.

- [ ] **Step 5: Run the focused tests after implementation**

  Run:

  ```bash
  node --test client/src/lib/storefront-products.test.ts
  node --test client/src/pages/product.test.ts
  ```

  Expected: PASS. Existing campaign pages can receive `null` from the shared detail client and already route that through their unavailable checkout status rather than inventing product data.

- [ ] **Step 6: Commit the live-detail consistency fix**

  ```bash
  git add client/src/lib/storefront-products.ts client/src/lib/storefront-products.test.ts client/src/pages/product.tsx client/src/pages/product.test.ts
  git commit -m "fix: clear stale product pages after confirmed absence"
  ```

### Task 5: Build and Test the Merchant Suite's Durable SEO Refresh State Machine

**Files:**
- Create: `../mangoloverbd_commerceos/server/storefrontSeoRefresh.js`
- Create: `../mangoloverbd_commerceos/src/test/storefrontSeoRefresh.test.ts`

**Interfaces:**
- Consumes: one org-scoped `app_settings` value named `storefront_seo_refresh`, the existing Vercel API credentials supplied by `server/index.js`, and no visitor-controlled identifiers.
- Produces: a JSON job with `version`, `requestId`, `status`, `deploymentId`, `attempts`, `requestedAt`, `lastAttemptAt`, and `lastError`.
- Produces: `enqueueStorefrontSeoRefresh()`, `reconcileStorefrontSeoRefresh()`, `parseStorefrontSeoRefreshJob()`, and `isAuthorizedCronRequest()` for the Express adapter.

- [ ] **Step 1: Write failing state-machine tests**

  Create a Vitest suite with injected clock, UUID factory, persistence adapter, deployment submitter, and deployment-status reader. Cover these observable results:

  ```ts
  expect(await enqueueStorefrontSeoRefresh(deps)).toMatchObject({
    status: "tracking",
    deploymentId: "dpl_123",
    attempts: 1,
  });

  expect(await reconcileStorefrontSeoRefresh({
    job: trackingJob,
    getDeployment: async () => ({ readyState: "READY" }),
    submitDeployment: async () => { throw new Error("must not submit"); },
    now: fixedNow,
  })).toEqual({ action: "clear" });
  ```

  Add independent tests for: submission timeout/non-2xx leaves a `queued` job with a bounded error; `ERROR` and `CANCELED` request a new deployment; `QUEUED`, `INITIALIZING`, and `BUILDING` preserve the tracked ID; a tracked deployment older than 24 hours is retried; malformed stored JSON becomes a fresh queued job; and a correctly configured cron secret passes while missing, wrong-length, and wrong-value headers fail without throwing.

- [ ] **Step 2: Run the state-machine test before implementation**

  Run: `npm test -- --run src/test/storefrontSeoRefresh.test.ts`

  Expected: FAIL because `server/storefrontSeoRefresh.js` does not yet exist.

- [ ] **Step 3: Implement the standalone state machine**

  Keep Vercel HTTP and Supabase calls out of this module. It must receive those as injected functions so every state transition is deterministic under Vitest. Use this persisted shape:

  ```js
  export const STOREFRONT_SEO_REFRESH_SETTING = "storefront_seo_refresh";

  export async function enqueueStorefrontSeoRefresh({
    existingJob,
    saveJob,
    submitDeployment,
    now,
    createRequestId,
  }) {}

  export async function reconcileStorefrontSeoRefresh({
    job,
    getDeployment,
    submitDeployment,
    now,
  }) {}

  // Serialized as the value of <orgId>:storefront_seo_refresh.
  // No product/customer data and no secret is stored here.
  {
    version: 1,
    requestId: "uuid",
    status: "queued" | "tracking",
    deploymentId: "dpl_..." | null,
    attempts: 0,
    requestedAt: "ISO-8601",
    lastAttemptAt: "ISO-8601" | null,
    lastError: "safe, bounded text" | null
  }
  ```

  `enqueueStorefrontSeoRefresh()` creates a new request ID, persists `queued` before attempting Vercel, then persists `tracking` only after a returned deployment ID. Submission errors must keep a queued job and truncate the logged/stored reason to 500 characters without including request headers, tokens, or Vercel URLs containing credentials.

  `reconcileStorefrontSeoRefresh()` must return `{ action: "clear" | "persist" | "submit", job?: StorefrontSeoRefreshJob }` instead of mutating storage itself. Treat `READY` as clear; `ERROR`, `CANCELED`, no ID, and an in-progress deployment older than 24 hours as submit; leave recent in-progress states unchanged. A later product change can safely replace the single stored job because every deployment rebuilds from the current public catalog, not an input snapshot. Add a test in which a later enqueue receives an existing tracking job and records a newer `requestId`; the latest tracking state is what daily reconciliation monitors.

  Implement `isAuthorizedCronRequest(authorization, cronSecret)` with `node:crypto` `timingSafeEqual` only after verifying both byte lengths. It must accept exactly `Bearer <secret>` and return `false` if the secret is missing.

- [ ] **Step 4: Run state-machine tests after implementation**

  Run: `npm test -- --run src/test/storefrontSeoRefresh.test.ts`

  Expected: PASS for every queued, tracking, ready, failed, stale, malformed, and unauthorized branch.

- [ ] **Step 5: Commit the independently testable job module**

  ```bash
  cd ../mangoloverbd_commerceos
  git add server/storefrontSeoRefresh.js src/test/storefrontSeoRefresh.test.ts
  git commit -m "feat: add durable storefront SEO refresh jobs"
  ```

### Task 6: Wire SEO-Relevant Merchant Mutations, Vercel Monitoring, and Daily Retry

**Files:**
- Modify: `../mangoloverbd_commerceos/server/index.js:1-55,1134-1285,2403-2571,10312-11190`
- Create: `../mangoloverbd_commerceos/src/test/storefrontSeoRefreshWiring.test.ts`
- Modify: `../mangoloverbd_commerceos/vercel.json:1-8`
- Modify: `../mangoloverbd_commerceos/.env.example:34-47`

**Interfaces:**
- Consumes: Task 5's job module, `getOrgSettings()`, `saveOrgSettings()`, `getStorefrontProjectId()`, `vercelApi()`, `VERCEL_ACCESS_TOKEN`, `STOREFRONT_GIT_REPO`, and `CRON_SECRET`.
- Produces: an authenticated `GET /api/internal/storefront-seo-refresh` cron endpoint and one automatic deployment request for an SEO-relevant successful product change.

- [ ] **Step 1: Write failing Merchant Suite wiring tests**

  Create `src/test/storefrontSeoRefreshWiring.test.ts` using the repository's source-contract pattern. Read `server/index.js` and assert all of the following:

  ```ts
  expect(handlerFor('app.post("/api/products/save"')).toContain("requestStorefrontSeoRefresh");
  expect(handlerFor('app.patch("/api/products/:id"')).toContain("SEO_BUILD_PRODUCT_FIELDS");
  expect(handlerFor('app.delete("/api/products/:id"')).toContain("requestStorefrontSeoRefresh");
  expect(handlerFor('app.post("/api/products/publish-all"')).toContain("requestStorefrontSeoRefresh");
  expect(handlerFor('app.post("/api/products/:id/images"')).toContain("requestStorefrontSeoRefresh");
  expect(handlerFor('app.patch("/api/products/:id/images/reorder"')).toContain("requestStorefrontSeoRefresh");
  expect(handlerFor('app.delete("/api/products/:id/images/:imageId"')).toContain("requestStorefrontSeoRefresh");
  expect(handlerFor('app.post("/api/products/:id/variants"')).not.toContain("requestStorefrontSeoRefresh");
  ```

  Assert the cron handler checks `isAuthorizedCronRequest(req.headers.authorization, process.env.CRON_SECRET)` before calling any retry function. Parse the Merchant Suite `vercel.json` and assert exactly one cron entry uses `/api/internal/storefront-seo-refresh` with `0 3 * * *`.

- [ ] **Step 2: Run the wiring test before implementation**

  Run: `npm test -- --run src/test/storefrontSeoRefreshWiring.test.ts`

  Expected: FAIL because neither the job adapter nor the cron configuration exists.

- [ ] **Step 3: Add the server-only Vercel deployment adapter**

  Import the Task 5 module near the existing `productCache.js` import. In `server/index.js`, add narrowly scoped adapters around the existing settings and Vercel helpers:

  1. Read/write JSON only at `orgSettingKey(orgId, STOREFRONT_SEO_REFRESH_SETTING)` via `getOrgSettings()` and `saveOrgSettings()`.
  2. Resolve the storefront project only through `getStorefrontProjectId(orgId)`.
  3. Resolve the configured Vercel project's real name through `GET /v9/projects/<projectId>` and resolve the configured GitHub repository ID the same way `provisionStorefrontProject()` already does.
  4. Start a production deployment through the same `POST /v13/deployments?skipAutoDetectionConfirmation=1` shape already used at `server/index.js:2547-2554`, with `target: "production"`, `ref: "main"`, and no visitor input.
  5. Monitor a tracked ID through `GET /v13/deployments/<encoded deploymentId>` and pass its `readyState` into Task 5's reconciliation helper.

  Apply `AbortSignal.timeout(10_000)` to Vercel and GitHub calls. Return only safe errors to the job state and log a short `[storefront-seo]` message without a bearer token, cron secret, full settings payload, or customer/product payload.

- [ ] **Step 4: Persist first, then make a bounded immediate attempt**

  Add `requestStorefrontSeoRefresh(orgId, reason)` in `server/index.js`. It must persist the queued job before asking Vercel to deploy. It may await the bounded initial attempt, but it must catch its own Vercel failure so a successfully committed product write still responds successfully. The daily cron remains responsible for any pending job.

  Use this static field set for `PATCH /api/products/:id`; it deliberately excludes stock, COG, warehouse, source URL, and variants:

  ```js
  const SEO_BUILD_PRODUCT_FIELDS = new Set([
    "name",
    "description",
    "selling_price",
    "slug",
    "published",
    "image_url",
  ]);
  ```

- [ ] **Step 5: Call the adapter only after successful SEO-relevant writes**

  Add the call after each database mutation and preserve existing cache-purge behavior:

  | Handler | Queue condition |
  |---|---|
  | `POST /api/products/save` | At least one inserted row is published. Queue once for the batch. |
  | `PATCH /api/products/:id` | The update contains a member of `SEO_BUILD_PRODUCT_FIELDS` and the product is published, is being published, or is being unpublished. |
  | `DELETE /api/products/:id` | The deleted row was published. Extend its pre-delete select to include `published`. |
  | `POST /api/products/publish-all` | The returned published count is greater than zero. |
  | image upload/reorder/delete | The affected product is published. Extend existing product selects to include `published`; queue once after the primary/image write succeeds. |

  Do not invoke the adapter from stock-only product updates, warehouse assignment, embedding generation, or any variant create/update/delete route. Do not let an image route schedule before its database/storage write is complete.

- [ ] **Step 6: Add the cron endpoint with service authentication, not visitor auth**

  Add this endpoint in the Vercel/storefront integration section of `server/index.js`:

  ```js
  app.get("/api/internal/storefront-seo-refresh", async (req, res) => {
    if (!isAuthorizedCronRequest(req.headers.authorization, process.env.CRON_SECRET)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Load only app_settings rows whose key ends in :storefront_seo_refresh.
    // Validate the org-id prefix before processing; never read an org id from the request.
    const result = await retryPendingStorefrontSeoRefreshes();
    return res.json({ ok: true, processed: result.processed, pending: result.pending });
  });
  ```

  `retryPendingStorefrontSeoRefreshes()` must scan only the one namespaced job type, parse each job defensively, call Task 5's reconciliation function, clear only `READY` jobs, and retain/requeue errored jobs. A retry failure is logged and remains pending for the next daily cron; do not expose its detailed error in the JSON response.

- [ ] **Step 7: Configure daily Vercel Cron and document required server variables**

  Add this top-level property to the Merchant Suite `vercel.json` without changing its existing `/api/*` rewrite:

  ```json
  "crons": [
    { "path": "/api/internal/storefront-seo-refresh", "schedule": "0 3 * * *" }
  ]
  ```

  Add blank, server-only documentation to `.env.example`:

  ```dotenv
  # Automatic storefront SEO deployments. Set only in Merchant Suite server/Vercel settings.
  VERCEL_PROJECT_ID=
  CRON_SECRET=
  ```

  Retain the existing `VERCEL_ACCESS_TOKEN`, `STOREFRONT_GIT_REPO`, and team-ID documentation. Do not put a generated value in the example file.

- [ ] **Step 8: Run Merchant Suite tests after implementation**

  Run:

  ```bash
  npm test -- --run src/test/storefrontSeoRefresh.test.ts src/test/storefrontSeoRefreshWiring.test.ts src/test/publicCatalog.test.ts
  npm run lint
  npm run build
  ```

  Expected: all targeted state-machine, wiring, and existing public-catalog tests pass; lint and build pass. A mutation can succeed when Vercel is down because the retry state was persisted first.

- [ ] **Step 9: Commit the Merchant Suite integration**

  ```bash
  git add server/index.js src/test/storefrontSeoRefreshWiring.test.ts vercel.json .env.example
  git commit -m "feat: refresh storefront SEO after product changes"
  ```

### Task 7: Document Operation, Verify Both Repositories, and Run the Safe Release Checklist

**Files:**
- Modify: `README.md:295-301`
- Verify: all files in Tasks 1-6

**Interfaces:**
- Consumes: deployed Merchant Suite cron, Vercel production deployment, and public storefront endpoints.
- Produces: evidence that Google receives correct status, metadata, sitemap, and no-cloaking behavior.

- [ ] **Step 1: Add a concise storefront operations note**

  Under `README.md`'s Deploying section, document that published product and SEO metadata changes are fetched into generated static SEO files by an automatic Vercel deployment triggered from Merchant Suite. State that staff should publish/unpublish products in Merchant Suite, not edit the storefront catalog; an unpublished seasonal product returns `404` until republished. Link to the remediation design for the exact legacy/Google cleanup policy.

- [ ] **Step 2: Configure production-only Merchant Suite environment variables manually**

  In the Merchant Suite Vercel project settings, set or verify these server-side values without placing them in Git:

  ```text
  VERCEL_ACCESS_TOKEN=<least-privilege token able to read/deploy the storefront project>
  VERCEL_PROJECT_ID=<current Mango Lover storefront Vercel project id>
  STOREFRONT_GIT_REPO=<owner/mangoloverbd_storefront>
  CRON_SECRET=<openssl rand -hex 32 output>
  ```

  Keep `CRON_SECRET` only in the Merchant Suite production environment. Vercel sends it as `Authorization: Bearer <CRON_SECRET>` when invoking the configured cron path. Do not test the endpoint from a browser, log the value, or add it to a client environment variable.

- [ ] **Step 3: Run all storefront checks and protect the generated user file**

  Run from the storefront repository:

  ```bash
  node --test script/storefront-seo-artifacts.test.ts
  node --test api/legacy-gone.test.ts
  node --test script/vercel-routing.test.mjs
  node --test client/src/lib/storefront-products.test.ts
  node --test client/src/pages/product.test.ts
  npm run check
  ```

  Then run the guarded production build from Task 2, Step 7. Run `git status --short` afterward. The only pre-existing generated-catalog modification must still be present and unstaged; do not use `git checkout`, `git restore`, or a broad reset to accomplish that.

- [ ] **Step 4: Deploy Merchant Suite first, then storefront code**

  Deploy the Merchant Suite changes so the cron route and deployment trigger exist. Deploy storefront code only after the build code and routing rules are committed. Confirm the Merchant Suite's Vercel deployment registers the daily cron; Vercel crons run only for production deployments. Do not manufacture a product edit merely to exercise the trigger. Unit tests cover the state machine; observe the next ordinary SEO-relevant staff edit in Vercel deployment history and logs.

- [ ] **Step 5: Perform public HTTP and sitemap smoke checks after the deployment is live**

  Set these non-secret values after confirming the seasonal slug is currently unpublished in Merchant Suite:

  ```bash
  export SITE_URL="https://www.mangolover.com.bd"
  export SUITE_URL="https://admin.mangolover.com.bd"
  export STOREFRONT_ID="<production VITE_STOREFRONT_ID from Vercel settings>"
  export SEASONAL_SLUG="langra"
  export UNKNOWN_SLUG="seo-status-check-does-not-exist-2026"
  active_slug=$(curl -fsS "$SUITE_URL/api/public/v1/storefronts/$STOREFRONT_ID/products" | node -e 'let body=""; process.stdin.on("data", c => body += c); process.stdin.on("end", () => { const products = JSON.parse(body).products || []; if (!products[0]?.slug) process.exit(1); process.stdout.write(products[0].slug); });')
  ```

  Verify statuses and headers without following redirects:

  ```bash
  curl -sS -o /dev/null -D - "$SITE_URL/product/$active_slug" | grep -E "^HTTP/|[Xx]-[Rr]obots-[Tt]ag"
  curl -sS -o /dev/null -D - "$SITE_URL/product/$SEASONAL_SLUG" | grep -E "^HTTP/|[Xx]-[Rr]obots-[Tt]ag"
  curl -sS -o /dev/null -D - "$SITE_URL/product/$UNKNOWN_SLUG" | grep -E "^HTTP/|[Xx]-[Rr]obots-[Tt]ag"
  for slug in stepprs-massage-insoles massage-insoles 4-in-1-makeup-pen bordeaux plum-veil rosy-bloom mauve-nude; do
    curl -sS -o /dev/null -D - "$SITE_URL/product/$slug" | grep -E "^HTTP/|[Xx]-[Rr]obots-[Tt]ag"
  done
  ```

  Expected: active `200`; seasonal/unpublished and invented `404`; every legacy path `410` with `X-Robots-Tag: noindex, follow`.

  Verify server-readable SEO content and sitemap membership:

  ```bash
  curl -fsS "$SITE_URL/product/$active_slug" | grep -E "<title>|canonical|application/ld\+json"
  curl -fsS "$SITE_URL/sitemap.xml" > /private/var/folders/ks/66d7f7mj5gb4r4cfw1wmzrjh0000gn/T/opencode/storefront-sitemap.xml
  grep -F "$SITE_URL/product/$active_slug" /private/var/folders/ks/66d7f7mj5gb4r4cfw1wmzrjh0000gn/T/opencode/storefront-sitemap.xml
  ! grep -F "$SITE_URL/product/$SEASONAL_SLUG" /private/var/folders/ks/66d7f7mj5gb4r4cfw1wmzrjh0000gn/T/opencode/storefront-sitemap.xml
  ! grep -F "$SITE_URL/product/stepprs-massage-insoles" /private/var/folders/ks/66d7f7mj5gb4r4cfw1wmzrjh0000gn/T/opencode/storefront-sitemap.xml
  ```

- [ ] **Step 6: Check for user-agent and referrer parity**

  Compare public status and body hashes for an active product, one unpublished seasonal slug, and one legacy slug. This detects user-agent/referrer branching but does not claim to test Google's IP ranges.

  ```bash
  for slug in "$active_slug" "$SEASONAL_SLUG" stepprs-massage-insoles; do
    for name in normal googlebot google-referrer; do
      case "$name" in
        normal) curl -sS "$SITE_URL/product/$slug" ;;
        googlebot) curl -sS -A "Googlebot/2.1 (+http://www.google.com/bot.html)" "$SITE_URL/product/$slug" ;;
        google-referrer) curl -sS -e "https://www.google.com/" "$SITE_URL/product/$slug" ;;
      esac > "/private/var/folders/ks/66d7f7mj5gb4r4cfw1wmzrjh0000gn/T/opencode/${slug}-${name}.html"
      shasum -a 256 "/private/var/folders/ks/66d7f7mj5gb4r4cfw1wmzrjh0000gn/T/opencode/${slug}-${name}.html"
    done
  done
  ```

  Expected: the three body hashes match per slug, and the independently checked status is identical per slug.

- [ ] **Step 7: Complete Google Search Console cleanup after public checks pass**

  In Google Search Console:

  1. Use URL Inspection's live test for the active product. Confirm product title, canonical URL, JSON-LD, and indexability.
  2. Submit the deployed `https://www.mangolover.com.bd/sitemap.xml`.
  3. Use Removals to temporarily hide the seven `410` legacy URLs and any confirmed false-404 result while Google recrawls them.
  4. Request indexing only for important active products after their live inspections pass.
  5. Review Security Issues, Manual Actions, Vercel deployment history, GitHub access, and DNS once. Do not promise a particular Google removal or ranking date.

- [ ] **Step 8: Commit operations documentation only after verification evidence is recorded**

  ```bash
  git add README.md
  git commit -m "docs: describe automatic storefront SEO refreshes"
  ```

## Failure Modes and Required Handling

| Failure mode | Detection | Handling | Test/verification | Visitor outcome |
|---|---|---|---|---|
| Public catalog returns non-200, invalid JSON, or times out during production build | `resolveStorefrontBuildCatalog()` rejects | Vercel build fails; no stale static output is deployed; pending job remains tracked | Task 2 production-failure test; Vercel build log | Prior valid deployment remains until retry succeeds |
| Vercel deployment request fails | bounded adapter catches non-OK/timeout | Persist queued job and retry from daily cron | Task 5 submission-error test | Product write still succeeds; SEO waits |
| Vercel accepts but build reports `ERROR`/`CANCELED` | daily status lookup sees terminal failure | Submit a new production deployment and retain job | Task 5 reconciliation test | Prior valid deployment remains until retry succeeds |
| Vercel deployment remains in progress for over 24 hours | tracked job age | Treat as stale and submit a fresh deployment | Task 5 stale-job test | No silently abandoned refresh |
| Cron request is forged or misconfigured | exact bearer-secret comparison | Return `401` before settings/Vercel work | Task 5 auth tests and Task 6 wiring test | No visitor can trigger deployments |
| Product is unpublished while a browser tab is open | detail API returns `404` | Clear local cache and render existing unavailable page | Task 4 404 test | Customer no longer sees/orderable stale product |
| Merchant Suite is temporarily unavailable to a browser | detail query rejects | Retain generated/local fallback and retry polling | Task 4 `500` test | No false client-side 404 during an outage |
| Dashboard product text contains markup | static metadata serialization | Escape attribute and script data | Task 2 hostile-string tests | Safe product metadata, no injected script |

No failure mode above is allowed to silently produce an indexable fake homepage, a stale newly deployed product page, or a public deploy trigger.

## What Already Exists

| Existing asset | Reuse in this plan |
|---|---|
| `script/build.ts` static product route and sitemap generation | Refactor into testable helpers; retain its Vite/esbuild orchestration rather than add SSR. |
| `client/src/lib/generated-storefront-products.ts` | Keep as a first-paint/local fallback only; never treat it as authoritative production SEO data. |
| `vercel.json` SPA rewrite and HTML no-store header | Narrow only the rewrite so absent product files reach Vercel 404; retain the no-store product HTML header. |
| `api/orders.ts` Vercel Node handler convention | Match its request/response typing for the small `410` function. |
| Merchant Suite `vercelApi()` / `getStorefrontProjectId()` / `provisionStorefrontProject()` | Reuse existing server-only Vercel authentication and Git deploy body instead of adding a deploy-hook secret or third-party queue. |
| Merchant Suite `app_settings`, `getOrgSettings()`, `saveOrgSettings()` | Store the single durable retry job without a new table, migration, or public database access. |
| Merchant Suite product mutation routes and cache purge calls | Queue only after their successful write paths; do not duplicate catalog access in the storefront. |
| Vercel Cron `CRON_SECRET` support | Use one daily production-only retry route, compatible with Vercel Hobby scheduling. |

## Not in Scope

- A dynamic product SEO server, SSR framework migration, or request-time sitemap function. The approved static build plus automatic deployment meets the goal with fewer runtime paths.
- A dedicated queue provider, worker process, or Supabase schema migration. One org-scoped retry record and daily Vercel Cron are sufficient for this single storefront.
- Deploying on stock/variant changes or claiming live inventory in static JSON-LD. The public inventory API remains the live stock source.
- A `410` response for seasonal Mango Lover products. Staff unpublish and republish those products; their temporary URLs are ordinary `404`s.
- Redirecting legacy template URLs to `/products` or inventing redirects for changed Mango slugs without a verified equivalent destination.
- Direct storefront Supabase access, catalog hardcoding, real order creation, or a promised Google indexing/removal timeline.
- A Google-IP cloaking test. The release checks only normal user agent, synthetic Googlebot user agent, and Google referrer parity.

## Parallelization Strategy

| Step | Modules touched | Depends on |
|---|---|---|
| Static artifact generation | storefront `script/` | Task 1 contract |
| Public routing and browser state | storefront `api/`, `vercel.json`, `client/` | Task 1 contract |
| Durable refresh state machine | Merchant Suite `server/`, `src/test/` | Task 1 contract |
| Express/Vercel integration | Merchant Suite `server/`, `vercel.json`, `.env.example` | Durable refresh state machine |
| Rollout verification | both deployments and public URLs | all implementation tasks |

- **Lane A:** Task 2 → Task 3 → Task 4, sequential where the storefront build/routing contract is shared.
- **Lane B:** Task 5 → Task 6, sequential where the job module is consumed by the Express adapter.
- **Lane C:** Task 1 can complete before or alongside the first task in each lane.
- **Merge/launch order:** launch Lanes A and B after Task 1, then deploy Merchant Suite before storefront code, then perform Task 7.
- **Conflict flags:** no code directory is shared between Lanes A and B because they are separate repositories. Task 7 must wait for both because it tests their integration.

## Implementation Tasks

Synthesized from the engineering review's accepted findings. Each task is actionable and maps to the detailed tasks above.

- [ ] **T1 (P1, human: ~2h / CC: ~20min)** — Storefront build — generate product SEO only from a fresh published public catalog and fail closed in production.
  - Surfaced by: Architecture review, D6; `script/build.ts:81-94` reused stale data after catalog failure.
  - Files: `script/storefront-seo-artifacts.ts`, `script/storefront-seo-artifacts.test.ts`, `script/build.ts`.
  - Verify: `node --test script/storefront-seo-artifacts.test.ts` and guarded `npm run build`.
- [ ] **T2 (P1, human: ~1h / CC: ~15min)** — Storefront routing — return 410 for seven known template paths and real 404 for all other absent product paths.
  - Surfaced by: Code quality review, D7; `vercel.json:2-43` redirects template URLs and swallows unknown products in the SPA.
  - Files: `api/legacy-gone.ts`, `api/legacy-gone.test.ts`, `vercel.json`, `script/vercel-routing.test.mjs`.
  - Verify: focused Node tests and public status/header curl checks.
- [ ] **T3 (P2, human: ~1h / CC: ~10min)** — Browser detail state — clear stale cached product data only on an authoritative Merchant Suite 404.
  - Surfaced by: Code quality review, D8; `product.tsx:218` falls back to stale cache after every detail failure.
  - Files: `client/src/lib/storefront-products.ts`, `client/src/lib/storefront-products.test.ts`, `client/src/pages/product.tsx`, `client/src/pages/product.test.ts`.
  - Verify: focused `node --test` files.
- [ ] **T4 (P1, human: ~3h / CC: ~30min)** — Merchant Suite retry job — persist, submit, monitor, and retry SEO deployments through `READY` without exposing Vercel credentials.
  - Surfaced by: Architecture review, D5 and D10; serverless requests cannot keep a retry timer alive and acceptance is not build success.
  - Files: `../mangoloverbd_commerceos/server/storefrontSeoRefresh.js`, `../mangoloverbd_commerceos/src/test/storefrontSeoRefresh.test.ts`.
  - Verify: `npm test -- --run src/test/storefrontSeoRefresh.test.ts`.
- [ ] **T5 (P1, human: ~3h / CC: ~30min)** — Merchant Suite integration — queue only SEO-relevant writes and run daily secret-authenticated retry.
  - Surfaced by: Performance review, D12 and D13; live inventory must not cause build storms or false static availability.
  - Files: `../mangoloverbd_commerceos/server/index.js`, `../mangoloverbd_commerceos/src/test/storefrontSeoRefreshWiring.test.ts`, `../mangoloverbd_commerceos/vercel.json`, `../mangoloverbd_commerceos/.env.example`.
  - Verify: targeted Vitest, lint, build, and Vercel Cron configuration inspection.
- [ ] **T6 (P2, human: ~1h / CC: ~10min)** — Operations and Google cleanup — document the automatic path and verify public SEO responses before Search Console action.
  - Surfaced by: Test review, D11; local tests cannot prove Vercel filesystem status behavior or Google-visible output.
  - Files: `README.md`, remediation design document.
  - Verify: public status/sitemap/parity checks and Search Console live inspection.

## Self-Review

- **Spec coverage:** Task 1 records the reviewed decision reversal; Tasks 2-4 cover authoritative static SEO files, true 404/410 routing, safe markup, hydrated metadata replacement, and stale browser state; Tasks 5-6 cover automatic deployment, daily retry through `READY`, secret authentication, and exact mutation scope; Task 7 covers live proof and Search Console cleanup.
- **No hardcoded product data:** the only fixed product-like strings are the seven user-approved legacy routing paths. Catalog content, active slug selection, pricing, image metadata, and seasonal state all remain Merchant Suite-owned.
- **Failure coverage:** production catalog loss, Vercel rejection/build error/stall, forged cron access, stale browser cache, temporary browser API failure, and hostile metadata all have an explicit behavior and test.
- **Placeholder scan:** all tasks name exact files, exports, fields, response statuses, environment variable names, commands, and expected outputs. No implementation or verification item is deferred without an explicit out-of-scope rationale.
- **Type consistency:** browser `fetchStorefrontProduct()` returns `StorefrontProduct | null`; build catalog results distinguish `live` from `fallback`; durable refresh jobs use one documented serialized JSON shape; deployment completion is determined by Vercel `readyState`.
