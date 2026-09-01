# Live Homepage Catalog Design

## Goal

Replace every static product-card section on the Mango Lover BD homepage with the published Merchant-Suite catalog. The four sections are What's New, Latest Drop, Just Arrived, and Special Collections.

## Catalog Source

- `Home` will make one shared `fetchStorefrontProducts()` query through `client/src/lib/storefront-products.ts`.
- The query will use the existing `merchant-suite-products-listing` cache key and the established eight-second polling interval.
- No homepage code will read Supabase directly, add a public API route, or embed catalog records, prices, images, stock, or workspace data.
- The public API's newest-first order is authoritative. Each section renders the same newest published products, capped to its existing visual capacity.

## Section Behavior

- What's New retains its horizontal mobile scroller and desktop grid, showing up to six live products. Its static category labels, LAST FEW badge, and fixed quick-add control are removed.
- Latest Drop retains its four-card grid, showing up to four live products.
- Just Arrived retains its horizontal mobile scroller and desktop grid, showing up to four live products. Its fixed quick-add control and fake size count are removed.
- Special Collections retains its horizontal mobile scroller and three-column desktop grid, showing up to three live products. Its hardcoded collection names and count superscripts are removed.
- Every live card links to its product page so the shopper selects a valid variant before adding it to the cart.
- Every card renders the API product name, primary image, formatted live price range, and a Sold out label when `available === false`.

## States

- While the catalog is loading, each section displays neutral skeletons matching its card capacity and layout. Skeleton animation honors reduced-motion preferences.
- When the request fails before a successful response, each section shows a clear error treatment rather than stale static products.
- During a background refresh failure, previously loaded catalog cards remain visible.
- A successful empty response shows no hardcoded fallback products.

## Scope

- Modify `client/src/pages/home.tsx` and its focused source-level tests in `client/src/pages/home.test.ts`.
- Preserve hero, category, editorial, and essentials promotional sections.
- Preserve established layouts, motion, responsive behavior, and public catalog product-page URLs.
- Do not modify Merchant-Suite, Supabase, checkout behavior, or the user-owned `client/src/index.css` change.
- Remove build-generated changes to `client/src/lib/generated-storefront-products.ts` before completing the task; they are not part of this homepage change.

## Verification

- Run the focused homepage catalog tests and production build.
- Confirm the public catalog returns Pure Ghee and that `http://localhost:5001/` serves the updated source.
- Check the rendered homepage once browser automation is available; Chrome's local remote-debugging setting currently blocks automated DOM inspection.
- Classify the known unrelated TypeScript error in `client/src/components/layout.tsx` and stale hero/reveal source-test assertions separately.
