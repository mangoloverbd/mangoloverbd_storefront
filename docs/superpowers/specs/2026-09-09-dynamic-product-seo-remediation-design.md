# Dynamic Product SEO Remediation Design

## Goal

Remove the old Stepprs and false-404 search results from Google, while making newly active Mango Lover products discoverable without a storefront redeploy.

This design fixes the HTTP and SEO signals Google receives. It does not promise a ranking position or an exact Google update date.

## Decisions

- Mango products are seasonal. When unavailable, they are hidden from the shop and Google, but their canonical URLs are retained for the next season.
- Storefront product state remains owned by Merchant Suite. The storefront does not hardcode product names, slugs, prices, stock, or SEO state, and does not access Supabase directly.
- The storefront uses dynamic, server-readable SEO responses rather than a static sitemap or client-only metadata changes.
- The same content decision applies to every visitor. There is no Googlebot, IP, referrer, or crawler-specific content path.

## Product Lifecycle Contract

Merchant Suite will expose a safe public lifecycle state for a product slug. The exact database representation belongs to Merchant Suite, but the public API contract must distinguish these states:

| State | Shop listing | Product URL | Search indexing | Sitemap |
|---|---|---|---|---|
| `active` | Visible and purchasable | `200 OK` product page | `index, follow` | Included |
| `seasonal` | Hidden | `200 OK` out-of-season page | `noindex, follow` | Excluded |
| `retired` | Hidden | Not exposed as a product | Not indexable | Excluded |
| unknown slug | Hidden | `404 Not Found` | `noindex` | Excluded |

`seasonal` preserves a known mango URL, such as a future Langra page, without showing it in product grids or asking Google to index it while it is unavailable. When Merchant Suite changes it back to `active`, it returns to the shop, its product URL becomes indexable, and it appears in the sitemap.

## Storefront SEO Responses

### Active product

For `/product/:slug`, a Vercel server-side route resolves the canonical product through the versioned Merchant Suite public API. It returns a response containing:

- the product-specific title, description, canonical URL, Open Graph image, and robots directive;
- Product JSON-LD with the real public name, price, availability, image, and canonical URL;
- the normal React storefront application for the interactive customer page.

The product-specific HTML head must be present before client JavaScript runs. The client application continues to render and refresh product data normally.

### Seasonal product

A known seasonal slug returns a lightweight Mango Lover out-of-season page with `200 OK` and `noindex, follow`. It must not render old template copy, a fake product, or the generic homepage metadata. It stays reachable only by its direct URL and is excluded from shop lists and the sitemap.

### Unknown and legacy URLs

- Unknown `/product/:slug` paths return a true `404 Not Found` response with noindex, instead of the current generic SPA homepage shell with `200 OK`.
- Permanently abandoned Stepprs/template paths, including `/product/stepprs-massage-insoles`, return `410 Gone` directly at Vercel routing level.
- Seasonal Mango Lover URLs must never be included in the Stepprs `410` list.
- No arbitrary old path is redirected to the homepage. A redirect is used only when there is a genuinely equivalent replacement page.

## Dynamic Sitemap

`/sitemap.xml` becomes a server-generated XML response backed by the Merchant Suite public API.

- It includes the homepage, product listing page, and only `active` product URLs.
- Each product entry has its canonical URL and an accurate `lastmod` value when the public API provides one.
- Seasonal, retired, unknown, and Stepprs URLs are never emitted.
- It refreshes from Merchant Suite with a short, bounded cache so a newly activated product is discoverable without a storefront deployment.
- `robots.txt` continues to point at the canonical sitemap URL.

## Failure Handling

- If Merchant Suite cannot be reached, the SEO route must not mislabel the homepage as a product or emit an indexable fake page.
- The route returns a temporary server error or a safe noindex response as appropriate, allowing Google to retry later.
- Product data from the public API is treated as data, escaped before insertion into HTML and JSON-LD, and limited to the public product fields.

## Google Cleanup Runbook

After the routing and sitemap release:

1. Verify exact response status and robots directives for one active product, one seasonal mango, one Stepprs path, and one invented product slug.
2. Purge or wait out Vercel edge cache, then repeat the checks from the public domain.
3. In Google Search Console, use URL Inspection's live test to confirm the active product's canonical URL, title, structured data, and indexability.
4. Submit the new sitemap.
5. Use Search Console Removals to temporarily hide the old Stepprs and false-404 search results while Google processes the permanent `410`/`404` responses.
6. Request indexing for important newly active products only after their live test is clean.
7. Review Security Issues, Manual Actions, Vercel deployment history, GitHub access, and DNS once to rule out an unauthorized change.

Google controls when it recrawls and updates snippets. The removal request hides results quickly; the correct `410`, `404`, `noindex`, canonical metadata, and sitemap make the cleanup durable.

## Scope

### Storefront

- Replace the product catch-all behavior that currently serves arbitrary product URLs as a `200` SPA shell.
- Add dynamic server-side product SEO/status handling and a dynamic sitemap.
- Define exact permanent legacy Stepprs routes for `410` responses.
- Keep the existing client-side live catalog and checkout behavior intact.

### Merchant Suite

- Provide the storefront public API with the lifecycle data needed to distinguish active and seasonal product slugs.
- Keep the fixed Mango Lover workspace guard and expose no private product, inventory, customer, or credential data.

### Out of scope

- Direct Supabase access from the storefront.
- Hardcoded product or SEO records in the storefront repository.
- A full framework migration or broad storefront redesign.
- Guaranteed Google ranking or an exact indexing timeline.

## Verification

- An active product returns `200`, a unique product title/canonical/JSON-LD, and appears in `/sitemap.xml`.
- A seasonal mango is absent from storefront product lists and the sitemap, but its exact URL returns `200` with `noindex, follow` and Mango Lover out-of-season content.
- `/product/stepprs-massage-insoles` returns `410`; an invented product slug returns `404`.
- Normal browser, Googlebot user-agent, and Google-referrer checks receive the same status and content decision. This is a diagnostic comparison, not proof of a real Google IP request.
- Search Console Live Test validates the active-product response before submitting the sitemap or requesting indexing.
- Implementation runs the focused tests, type check, production build, and public response checks without overwriting the existing user-owned generated catalog change.
