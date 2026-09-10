# Homepage Category Sections Design

## Goal

Replace the homepage's `JUST ARRIVED` and `OUR SPECIAL COLLECTIONS` blocks with product sections for every Featured Category that currently contains products, while keeping the `PURE GHEE` and `BLACK SEED MIX` editorial sections.

## Approved order

Below `LATEST COLLECTION`, render the following sequence:

1. `Homemade-হোমমেড`
2. `Honey-মধু`
3. `PURE GHEE`
4. `Oil & Ghee-তেল ও ঘি`
5. `BLACK SEED MIX`
6. `Semai-সেমাই`
7. `Nuts & Seeds-বাদাম ও বীজ`

The category order follows `FEATURED_COLLECTIONS`. Empty configured categories such as Jaggery, Fresh Mango, and Dates remain hidden through the existing `getVisibleFeaturedCollections()` behavior.

## Category section behavior

Each category section uses the existing catalog query and `getProductsForCollection()` helper to filter products by the category's assigned slugs. Its heading uses the same visual treatment as `FEATURED CATEGORIES`, with the bilingual label shown in the format `English-বাংলা`. Product cards use the existing `HomeProductCard` component and current loading/error behavior.

The existing top `FEATURED CATEGORIES` navigation remains unchanged. `PURE GHEE` and `BLACK SEED MIX` retain their existing editorial layouts and are moved into the approved interleaved sequence only as needed.

## Implementation boundary

Modify `client/src/pages/home.tsx` and its source-level tests. Import the existing `getProductsForCollection()` helper rather than duplicating slug filtering. Do not change product data, collection definitions, product cards, editorial assets, or the Merchant Suite API.

## Verification

- Test that Just Arrived and Our Special Collections are absent.
- Test that all seven non-empty category sections appear after Latest Collection in the approved order.
- Test that each category section uses the bilingual Featured Category label and collection product filtering.
- Run homepage tests, the production build, and `git diff --check`.
