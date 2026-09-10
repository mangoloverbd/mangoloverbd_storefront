# Top Selling Products Category Design

## Goal

Create a curated **Top Selling Products - সেরা বিক্রিত পণ্য** collection that appears in the homepage product section and in the storefront navigation/menu.

## Product ordering

The collection uses a deterministic ordered product list instead of the live catalog response order:

1. `honey-nut`
2. `sundarbans-natural-honey`
3. `kalojira-mixed`
4. Other honey products
5. Other seed products
6. All remaining products

The homepage renders the first six available products from this list. The full category page renders every available product from the same list, so the hero products always lead both surfaces.

The next three homepage products are selected automatically from the remaining honey and seed products using the curated list order. Products missing from the live catalog are skipped without breaking the ordering.

## Routes and navigation

- Add `/collection/top-selling-products` using the existing collection page experience.
- Add the category to desktop and mobile navigation/menu.
- Do not add it to the circular Featured Categories section; that section remains the existing visual category set.
- Keep the existing Arc Labs developer WhatsApp footer link unchanged.

## Architecture

Add a dedicated top-selling collection definition and ordering helper beside the existing featured collection definitions. The collection page resolves the new slug through the same collection lookup used by existing category routes. The homepage derives its six cards from the shared helper, avoiding duplicate product-selection logic.

The top-selling definition will include the three hero slugs, remaining honey slugs, seed slugs, and then the remaining catalog slugs. A final fallback appends any unlisted catalog products so the full category remains complete as the catalog changes.

## Testing

- Test the ordered helper places Honey Nut, Sundarbans Natural Honey, and Kalojira Mixed first.
- Test missing products are skipped and remaining products retain their deterministic order.
- Test the homepage uses the shared top-selling helper and six-item limit.
- Test the collection route and navigation/menu include `/collection/top-selling-products`.
- Run focused tests, type-check, and production build.
