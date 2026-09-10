# Jaggery Category Visibility Design

## Goal

Show the existing `Jaggery-গুড়` Featured Category with its two sugarcane products.

## Approved behavior

- Assign `sugarcane-juice-powder` to the `jaggery` collection.
- Assign `granulated-sugarcane-jaggery` to the `jaggery` collection.
- Remove `sugarcane-juice-powder` from `homemade` so each product has one Featured Category.
- Keep the existing `jaggery` slug, label, image, and visibility helper unchanged.

## Architecture

Change only `FEATURED_COLLECTIONS` in `client/src/lib/featured-collections.ts`. The existing `getVisibleFeaturedCollections()` helper will make the category visible automatically when the live or generated catalog contains either product. Add unit coverage for the exact assignments and visible collection result.

No product data, homepage layout, API, or checkout changes are required.
