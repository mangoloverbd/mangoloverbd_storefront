# Editorial Product Links and Category Assignment Design

## Goal

Make the homepage category placement and editorial calls to action point to the intended products.

## Approved behavior

- Remove `honey-nut` from the `Honey-মধু` Featured Category.
- Add `honey-nut` to the `Nuts & Seeds-বাদাম ও বীজ` Featured Category.
- Link the `PURE GHEE` editorial CTA to `/product/pure-ghee`.
- Link the `BLACK SEED MIX` editorial CTA to `/product/kalojira-mixed`.
- Position the editorial heading, description, and CTA together at the bottom of each editorial image.
- Keep the existing editorial copy, assets, overlays, and category product-card behavior unchanged.

## Architecture

The category move is a data-definition change in `client/src/lib/featured-collections.ts`, using the existing `getProductsForCollection()` and `getVisibleFeaturedCollections()` helpers. Editorial destinations are direct catalog product routes rendered by the existing `Link` component in `client/src/pages/home.tsx`. No product data, API behavior, campaign routes, or checkout code changes.

## Testing

Update source-level homepage and featured-collection tests to verify the exact category assignment, exact editorial destinations, and bottom-aligned editorial content. Run focused tests, TypeScript checking, the production build, and whitespace validation.
