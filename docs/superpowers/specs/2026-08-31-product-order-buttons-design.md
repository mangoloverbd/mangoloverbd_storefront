# Product Order Buttons Design

## Goal

Make the phone-order and WhatsApp-order actions on the product page more vibrant and easier to distinguish at a glance, without changing their behavior or the surrounding product-page layout.

## Design

- Keep the existing two-column layout, compact height, rounded corners, Bengali labels, and links.
- Style the phone action with a saturated coral-orange background and white phone icon/text.
- Style the WhatsApp action with vivid WhatsApp green and a white logo/text treatment.
- Use darker versions of each color on hover, with a small upward lift to make the actions feel interactive.
- Preserve visible keyboard focus styling and muted disabled behavior.
- Keep the buttons readable and side-by-side on mobile at the existing responsive breakpoint.

## Scope

Only the product-page order-action classes in `client/src/pages/product.tsx` need to change. No API, routing, copy, icon asset, or data-flow changes are required.

## Verification

- Run the storefront TypeScript check/build command available in `package.json`.
- Confirm the product page still contains the `tel:` phone link and WhatsApp URL, with both Bengali labels unchanged.
- Confirm the diff contains only the intended product-button styling and this design document.
