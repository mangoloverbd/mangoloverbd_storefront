# Product Quantity Selector Design

**Date:** 2026-09-06
**Status:** Approved

## Goal

Let customers choose a quantity on every storefront product detail page before adding the product to the cart or starting a cash-on-delivery checkout.

## Scope

The existing dynamic product detail route serves every catalog product, so the feature belongs in `client/src/pages/product.tsx`. It applies to both purchase actions on that page:

- Add to Cart
- Cash on Delivery

Product listing cards and the cart drawer remain unchanged. The cart drawer already lets customers adjust quantities after adding an item.

## Interaction Design

Place a quantity control below the size/variant selector and above the availability message and purchase buttons. The control contains a `Quantity` label, a decrement button, the current whole-number quantity, and an increment button.

- Initial quantity: `1`
- Minimum quantity: `1`
- Maximum quantity: none
- The decrement button is disabled when quantity is `1`.
- The quantity resets to `1` when the product slug changes.
- The control remains visible for unavailable products, while existing purchase buttons remain disabled.
- Buttons have explicit accessible labels for increasing and decreasing quantity.

## Purchase Behavior

### Add to Cart

Pass the selected quantity to the existing `addToCart` API. If the same product and variant already exists in the cart, the selected amount is added to its current quantity. Existing cart and analytics behavior then records the requested quantity.

### Cash on Delivery

Carry the selected quantity into `OrderDialogBundle`. The direct-checkout product subtotal is the selected unit price multiplied by quantity. The order dialog:

- shows the selected quantity in its product summary;
- displays the multiplied product subtotal;
- evaluates free delivery against that subtotal;
- submits the selected quantity and subtotal;
- reports the selected quantity, unit price, and total value to Google Analytics and Meta.

Cart checkout continues using its existing aggregate bundle behavior. Quantity additions to `OrderDialogBundle` remain optional so current cart checkout callers do not need synthetic single-item quantities.

## Server Contract

Add `quantity` to the storefront order request. Both local Express and Vercel checkout paths must validate it as a positive integer and forward it to the Merchant Suite custom-order webhook.

The webhook's `price` field remains the aggregate product subtotal, matching the existing dashboard order model. For a direct product checkout:

`price = unit price × quantity`

Both server paths also use quantity in purchase analytics. Their behavior must remain equivalent.

## Error Handling

- Client controls prevent quantities below `1`.
- Both server entry points reject missing, fractional, zero, or negative quantities.
- Existing product availability verification runs before either purchase action.
- This feature does not impose a stock-derived maximum, as explicitly requested. The Merchant Suite remains responsible for final order and inventory handling.

## Testing and Verification

Add source-level tests that verify:

- the product page owns quantity state and renders increment/decrement controls;
- Add to Cart receives the selected quantity;
- direct checkout receives quantity and a multiplied subtotal;
- the order dialog sends quantity and displays it in the summary;
- local Express and Vercel handlers validate and forward quantity;
- analytics use the selected quantity and correct values.

Run:

```bash
npm run check
node --test client/src/pages/home.test.ts
node --test client/src/lib/storefront-products.test.ts
npm run build
```

Also run the new quantity-focused source test and inspect `git status` after the build for unrelated generated-catalog changes.

## Success Criteria

On any product detail page, a customer can select any whole-number quantity of at least `1`. Adding to cart adds that amount, and cash-on-delivery checkout displays and submits the same amount with accurate subtotal, delivery threshold, and analytics values.
