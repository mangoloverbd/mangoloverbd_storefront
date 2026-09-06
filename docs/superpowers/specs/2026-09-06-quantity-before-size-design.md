# Quantity Before Size Design

**Date:** 2026-09-06
**Status:** Approved

## Goal

Show the product quantity selector above the size selector on both mobile and desktop product detail pages.

## Design

Reorder the two existing blocks in `client/src/pages/product.tsx`. The product purchase area will appear in this order:

1. Product title, price, and description
2. Quantity selector
3. Size selector
4. Availability message and purchase actions

Mobile and desktop use the same markup, so a single source-order change applies at every breakpoint. Do not duplicate controls or use responsive CSS ordering.

## Behavior

The quantity selector's behavior does not change. It starts at one, has no business maximum, and continues to apply to Add to Cart and Cash on Delivery.

## Verification

Update the product source test to assert that the `Quantity` block appears before `Select Size`. Run the focused product test and a production build. Confirm the generated catalog snapshot does not change.

## Success Criteria

Every product detail page displays Quantity immediately before Select Size on mobile and desktop, with all existing quantity and checkout behavior preserved.
