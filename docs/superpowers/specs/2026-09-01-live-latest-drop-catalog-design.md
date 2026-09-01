# Live Latest Drop Catalog Design

## Goal

Replace the stale, hardcoded Latest Drop cards on the Mango Lover BD homepage with published products from the Merchant-Suite public catalog. The newest published product, Pure Ghee at the time of approval, must appear first.

## Design

- Query the existing `fetchStorefrontProducts()` integration from `client/src/lib/storefront-products.ts`.
- Poll on the established eight-second storefront interval so product, price, publication, and image changes arrive without another storefront deployment.
- Preserve the public API's newest-first order and render at most four products in the existing Latest Drop grid.
- Render each card from the API product name, primary image, price range, and slug. Do not duplicate product, price, stock, image, or workspace data in the storefront source.
- Render neutral loading placeholders while the catalog request is pending. On an empty or failed catalog request, do not show stale hardcoded product cards.

## Scope

Modify `client/src/pages/home.tsx` and the focused source-level homepage test. Do not change Supabase, Merchant-Suite routes, checkout, or other homepage product sections.

## Verification

- Run the focused homepage test and the storefront type check.
- Confirm the Latest Drop source uses the shared public catalog integration and has no hardcoded product records.
- Confirm the live catalog lists Pure Ghee as the newest published product before the code change is verified.
