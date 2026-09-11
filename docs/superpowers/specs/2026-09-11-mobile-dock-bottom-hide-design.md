# Mobile Dock Bottom-of-Page Hide Design

## Goal

Hide the mobile quick-order dock when a visitor reaches the bottom of a campaign page, so the dock does not cover footer content or remain redundant beside the checkout/footer area.

## Scope

Apply the behavior to all three campaign mobile docks:

- Honey Nut
- Kalojira Mixed
- Sundarbans Honey

Desktop behavior is out of scope and must remain unchanged. The docks already use a desktop media query that removes them at `min-width: 768px`.

## Behavior

Each dock is hidden when either of these conditions is true:

1. Its checkout section is visible, preserving the current behavior.
2. The viewport has reached the bottom of the document.

The bottom check uses the document scroll position with a small tolerance so mobile browser rounding and safe-area changes do not prevent the state from activating. The listener is passive and cleaned up on unmount.

## Animation

Replace the dock's CSS transform transition with a Framer Motion `motion.div`. The visible state sits at `y: 0`; the hidden state translates down by `110%`. The existing desktop `display: none` media query remains unchanged. Framer Motion's reduced-motion behavior is enabled so users who request reduced motion do not receive the slide animation.

The existing `data-hidden` attribute remains available for source-level regression coverage and styling hooks, while the animated transform is owned by Framer Motion.

## Testing

Add or update source-level tests for each campaign to verify:

- bottom-of-page detection is present;
- the dock uses Framer Motion and a hidden/visible `y` animation;
- the desktop-only media query remains present;
- checkout visibility continues to participate in the hidden state.
