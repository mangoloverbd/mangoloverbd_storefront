# Add-to-Cart Toast and Mobile Dock Handoff

## Goal

Adding a product must keep the shopper on the current page. Replace the automatic full cart drawer with a compact floating confirmation that gives the shopper an optional path to the cart.

## Approved Experience

### Confirmation toast

- Appears immediately after every successful `addToCart()` call.
- Uses a slim floating capsule with:
  - product thumbnail with a confirmation check,
  - “Added to cart” label,
  - product name and selected variant,
  - `View cart` action.
- Does not add an overlay, trap focus, move page content, or block browsing.
- Remains visible for 3.5 seconds.
- Pauses its dismissal timer while hovered or keyboard-focused.
- Repeated additions update the current toast and restart the timer rather than stacking notices.
- `View cart` dismisses the toast and opens the existing full cart drawer.

### Mobile behavior

- Position the toast above the fixed mobile navigation dock, including safe-area spacing.
- At automatic dismissal, animate the toast down toward the dock cart control.
- Pulse the dock cart control once after the dismissal animation.
- Replace the current tiny cart dot with a persistent yellow numeric badge showing `itemCount`.
- Keep the badge visible whenever `itemCount > 0`; remove it when the cart is empty.
- Tapping the dock cart control continues to open the existing full cart drawer.

### Desktop behavior

- Place the same toast near the bottom-right of the viewport.
- Use a restrained fade/slide exit rather than animating toward the desktop header.
- Keep the existing desktop header cart count and manual drawer behavior.

## Component Design

### Cart context

`CartProvider` remains the owner of cart mutations and drawer state. Add a small notification state describing the latest successful addition:

```ts
type CartAddNotice = {
  key: number;
  itemId: string;
  title: string;
  size: string;
  image: string;
  quantityAdded: number;
};
```

Each `addToCart()` call updates this state and increments `key`, which restarts the toast lifecycle even when the same product is added repeatedly. Remove the existing automatic `setIsOpen(true)` call. Expose explicit methods to dismiss the notice and to signal that the automatic mobile handoff completed.

### Toast component

Create one `CartAddedToast` component mounted once alongside `CartDrawer` in the shared layout. It:

- reads the latest notice from cart context,
- owns the 3.5-second timer and hover/focus pause state,
- renders through `AnimatePresence`,
- opens the drawer through the existing `setIsOpen(true)` API,
- emits the mobile handoff signal after an automatic exit,
- renders nothing when no notice exists.

Only one toast may exist at a time.

### Mobile dock cart control

The existing dock cart button continues to use `itemCount`. Change its indicator from a dot to a numeric badge. Consume the handoff signal to run one short Framer Motion pulse, then clear the signal so it does not replay during unrelated renders.

## Motion

- Enter: short upward slide with opacity and a restrained spring.
- Auto-dismiss on mobile: scale down slightly and translate toward the dock cart control.
- Auto-dismiss on desktop: short downward fade.
- Dock handoff: one pulse only, not a repeating animation.
- Respect `prefers-reduced-motion`: use opacity-only transitions and skip the dock pulse/translation.

## Accessibility

- Toast container uses `role="status"` and `aria-live="polite"` so additions are announced without interrupting input.
- `View cart` is a real button with an explicit accessible label.
- Hover and keyboard focus both pause auto-dismissal.
- The mobile badge has accessible text through the existing cart button label; the visible badge itself remains hidden from screen readers to avoid duplicate announcements.
- Interactive targets remain at least 44px on touch devices.
- Text and controls meet contrast requirements against the translucent black capsule and yellow action.

## Edge Cases

- Adding the same variant repeatedly updates the toast and resets its timer.
- Adding a different product replaces the current toast immediately.
- Clicking `View cart` prevents the automatic handoff animation because the drawer is already opening intentionally.
- Route changes dismiss the stale toast.
- Emptying the cart removes the numeric badge.
- The toast stays above the dock and browser safe area on small iPhones.

## Testing

Add source/component tests covering:

1. `addToCart()` no longer opens the drawer automatically.
2. A successful addition creates a notice carrying product image, title, variant, and quantity.
3. Repeated additions replace the notice and restart its lifecycle.
4. The toast dismisses after 3.5 seconds and pauses on hover/focus.
5. `View cart` opens the existing drawer and dismisses the toast.
6. The mobile dock shows the numeric `itemCount` badge instead of a dot.
7. The mobile handoff pulse runs once after automatic dismissal.
8. Reduced-motion users do not receive translation or pulse animation.
9. Existing checkout line-item and analytics behavior remains unchanged.

## Out of Scope

- Redesigning the full cart drawer or checkout dialog.
- Adding undo/removal controls to the toast.
- Changing cart persistence, pricing, analytics, or checkout payloads.
- Stacking multiple historical notifications.
