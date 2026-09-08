# Homepage Product Card Consistency — Design

Date: 2026-09-08
Status: Approved

## Goal

Give the homepage's **Latest Collection**, **Just Arrived**, and **আমাদের আরও কিছু পণ্য** product sections the same product-card treatment already used by **Top Selling Products**.

## Design

Extract the existing Top Selling card into a reusable homepage product-card component. The shared card will render:

- the product image with the existing hover zoom;
- the sold-out badge when the product is unavailable;
- the product name;
- the first-variant or base current price;
- the crossed-out compare-at price when it is higher than the current price;
- the yellow `Save ৳...` discount pill;
- the full-width yellow `Add to Cart` button with the existing hover state and cart analytics payload.

The normalized homepage catalog data will preserve the current snapshot compare-at fallback so discount styling remains available while live catalog data revalidates.

## Layout preservation

Only card content and styling will be shared. Each section keeps its existing layout and product count:

- Latest Collection: four-column desktop grid;
- Just Arrived: horizontal mobile carousel and four-column desktop grid;
- আমাদের আরও কিছু পণ্য: horizontal mobile carousel and three-column desktop grid.

Section headers, links, backgrounds, and responsive carousel behavior remain unchanged.

## Behavior and error handling

The shared card uses the existing `addToCart` behavior and disables the button for sold-out products. Loading, live-catalog error, and generated-snapshot fallback states remain owned by the section renderers. No new product data or API is introduced.

## Testing

Add source-contract regression coverage that requires all four homepage product sections to use the shared card and verifies the shared card contains discount, compare-at, and cart-action behavior. Run the focused homepage tests and production build before deployment.
