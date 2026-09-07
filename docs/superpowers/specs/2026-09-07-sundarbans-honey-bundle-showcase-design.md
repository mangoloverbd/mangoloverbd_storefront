# Sundarbans Honey Bundle Showcase

**Date:** 2026-09-07  
**Status:** Approved design for implementation

## Goal

Replace the founder-story placeholder in the Sundarbans Natural Honey campaign with a
reference-inspired two-card bundle showcase using the two stakeholder-supplied honey bundle
graphics.

## Design

- Remove the founder placeholder media and story copy from the campaign narrative.
- Add a centered `honey-bundle-showcase` section with the campaign's cream, amber, and forest palette.
- Render the supplied 0.5kg and 1kg graphics as two responsive bundle cards.
- Keep the graphics' baked-in prices visible as supplied; do not duplicate those prices in JSX.
- Place an `অর্ডার করুন` CTA under each graphic. Each CTA uses the existing checkout scroll/focus
  behavior and campaign tracking through `onOrderClick`.
- Stack the cards on narrow screens and place them side by side when space allows.

## Data and safety

- The supplied graphics are visual assets only. Current pack prices, stock, availability, and order
  validation remain owned by the existing Merchant Suite-backed checkout.
- No product, price, stock, workspace, or order data is hardcoded in the new component.
- No real orders are created during implementation or verification.
- The supplied graphics are recorded in the campaign attribution file as stakeholder-supplied
  promotional artwork.

## Implementation surface

- `client/src/features/sundarbans-honey/documentary-sections.tsx`: replace the founder section.
- `client/public/step/sundarbans-natural-honey/`: add versioned bundle image assets.
- `client/src/pages/sundarbans-honey.test.ts`: assert both bundle assets are rendered and the founder
  placeholder is removed.

## Verification

- Run the campaign test suite and `git diff --check`.
- Browser-check the campaign at mobile and desktop widths for card order, CTA presence, image loading,
  and horizontal overflow.
- Confirm the existing checkout, tracking, routing, inventory, and thank-you behavior is unchanged.
