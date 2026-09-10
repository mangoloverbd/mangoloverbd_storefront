# Homepage Category Header Controls Design

## Goal

Make every populated category section below `LATEST COLLECTION` easier to scan by aligning its bilingual title left, adding an underlined `View All` link on the right, and showing no more than four products.

## Scope

Apply this change only to the category product sections. Keep the `PURE GHEE` and `BLACK SEED MIX` editorial banners unchanged.

## Behavior

- Category headings use the existing Featured Categories typography and continue to show labels such as `Homemade-হোমমেড`.
- Heading controls use a horizontal layout: title on the left and `View All` on the right.
- `View All` links to `/collection/:slug` and uses an underlined bottom border.
- Each category section renders `products.slice(0, 4)`.
- Categories with no products remain hidden through `getVisibleFeaturedCollections()`.

## Implementation boundary

Modify the reusable category-section renderer in `client/src/pages/home.tsx` and its source-level tests. Do not change collection definitions, editorial banner markup, product-card behavior, catalog fetching, or the existing top Featured Categories navigation.

## Verification

- Test the left/right header structure, collection link, underline, and four-product limit.
- Confirm editorial sections remain present and unchanged by this task.
- Run focused homepage tests, TypeScript checking, production build, and `git diff --check`.
