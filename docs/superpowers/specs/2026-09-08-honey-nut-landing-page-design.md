# Honey Nut Landing Page Design

**Date:** 2026-09-08  
**Route:** `/step/honey-nut`  
**Related route:** `/step/kalojira-mixed`

## Goal

Create a second campaign landing page for the existing Merchant Suite product `honey-nut`. The page should preserve the editorial, responsive, conversion-focused structure of `/step/kalojira-mixed`, while using Honey Nut’s supplied photography, Bengali content, nutrition framing, pricing, and ingredient story.

## Scope

### In scope

- New isolated Honey Nut campaign feature namespace.
- Landing route `/step/honey-nut` and order confirmation route `/step/honey-nut/thank-you`.
- Live Merchant Suite product and inventory reads for `honey-nut`.
- Cash-on-delivery ordering for the existing 500g and 1kg variants.
- Honey Nut content from the supplied nine-page guide.
- Supplied Honey Nut image assets, copied into a versioned public route directory.
- Existing Murad Parvez nutritionist portrait and credentials presentation.
- Existing testimonials component and campaign-style testimonial presentation.
- Responsive layout, keyboard-accessible accordions/carousels, analytics, metadata, and tests.

### Out of scope

- Changes to the Merchant Suite product, variants, inventory, or database.
- Changes to the existing Kalojira campaign behavior or design.
- New nutrition claims beyond the provided guide.
- Fabricating medical claims, certifications, or additional customer data.
- Refactoring all campaign pages into a shared generic framework.

## Visual direction

The Honey Nut page will use the same pacing and section composition as Kalojira Mixed: spacious editorial sections, strong Bengali headings, rounded content blocks, responsive image-led storytelling, and a persistent mobile order action. The palette shifts toward:

- Cream/off-white page background.
- Honey gold for accents, buttons, and ingredient emphasis.
- Deep brown for headings and trust sections.
- Soft green only for nutrition and balanced-food cues.

Typography and spacing will follow the existing campaign styles rather than introducing a new design system.

## Page structure

1. **Campaign header** — Honey Nut identity and accessible navigation treatment.
2. **Hero** — Bengali headline, supporting copy, three trust points, supplied premium product image, and CTA that scrolls to checkout.
3. **Nutrition highlights** — four cards: plant protein, healthy fats, dietary fiber, and vitamins/minerals.
4. **Nine ingredients** — 3×3 desktop grid and 2-column mobile grid, with circular ingredient imagery and short labels.
5. **Ingredient nutrition story** — compact cards or accordion covering why each ingredient is included, without long paragraphs.
6. **Nutritionist trust** — existing Murad Parvez portrait, credentials, responsible positioning, and trust badge.
7. **Product close-up gallery** — three supplied Honey Nut images; mobile carousel and desktop hero-plus-supporting-grid treatment.
8. **Daily food routine** — direct serving, toast/roti, breakfast bowl, and preferred-food cards.
9. **Quality and packaging** — selected product/packaging photo and the supplied quality checklist.
10. **Order section** — live variant selection, quantity, customer details, COD submission, and ৳100 home delivery charge.
11. **Customer reviews** — existing testimonials component and campaign presentation, reused without changing its shared implementation.
12. **FAQ** — supplied ingredient, weight, storage, suitability, and allergy answers.
13. **Final CTA and footer** — concise Honey Nut summary, order CTA, nutritionist details, support/contact links.

## Architecture

Create a new isolated feature directory under `client/src/features/honey-nut/` with Honey Nut-specific equivalents of the Kalojira campaign modules:

- `content.ts` — Bengali copy, ingredient data, nutrition cards, FAQ, trust text, reviews input, and campaign contact constants.
- `documentary-sections.tsx` — Honey Nut sections, gallery, accordion, and CTA buttons.
- `campaign-layout.tsx` — Honey Nut header/footer and event placement wiring.
- `campaign.css` — scoped Honey Nut visual tokens and campaign-specific rules.
- `honey-nut-checkout.tsx` — live product/inventory checkout and COD submission.
- `checkout-state.ts`, `order.ts`, `tracking.ts`, and `mobile-order-bar.tsx` — Honey Nut-specific state, payload/confirmation helpers, analytics, and mobile CTA.

Add:

- `client/src/pages/honey-nut.tsx`.
- `client/src/pages/honey-nut-thank-you.tsx`.
- Honey Nut route imports, route ordering, page titles, and campaign metadata in `client/src/App.tsx`.
- Honey Nut fallback slug in `script/build.ts` if needed for generated product data recovery.
- Versioned Honey Nut assets under `client/public/step/honey-nut/`.

The existing `TestimonialsSection` UI component and existing Murad Parvez portrait asset will be reused. The Kalojira campaign remains unchanged.

## Data flow and checkout

The page will follow Kalojira’s live-catalog pattern:

1. Resolve generated fallback product data by `honey-nut` slug.
2. Fetch the current public product and inventory on the existing polling interval.
3. Merge inventory into the product before presenting variants.
4. Present the current 500g and 1kg variants and prices from Merchant Suite; the known fallback values are ৳650 and ৳1,200.
5. Add a fixed ৳100 home-delivery charge to the order total.
6. Re-fetch product and inventory immediately before submission.
7. Validate selected variant availability and stock.
8. Submit the COD order through the existing storefront order API.
9. Store a Honey Nut order confirmation in session storage and navigate to the Honey Nut thank-you route.

No client-supplied tenant or organization identifier will be added.

## Asset handling

Supplied JPEGs will be copied into the Honey Nut public directory with descriptive, versioned names instead of WhatsApp filenames. The implementation will map each asset deliberately to hero, ingredient, gallery, routine, and packaging roles. Existing Kalojira’s nutritionist portrait will be referenced through its existing immutable asset URL. Images will include dimensions, meaningful Bengali alt text, eager loading only for the hero, lazy loading for later sections, and responsive object positioning.

## Accessibility and responsive behavior

- One primary `h1`; section headings use semantic hierarchy.
- Every CTA has a clear Bengali accessible name.
- FAQ and ingredient story accordions expose `aria-expanded` and `aria-controls`.
- Gallery controls are keyboard accessible and expose active state.
- Checkout fields preserve inline errors, focus management, and live announcements.
- Mobile order bar remains usable without covering form content.
- Reduced-motion preferences are respected for scroll, carousel, and accordion transitions.
- Desktop uses split layouts and 3×3 grids; mobile reorders hero content, uses 2-column ingredient cards, and converts galleries/reviews to horizontal interaction where appropriate.

## Verification

Add or update tests covering:

- Honey Nut route and thank-you route registration order.
- `honey-nut` slug usage and live product/inventory integration.
- Required asset references and section ordering.
- Existing testimonials and Murad portrait reuse.
- Variant extraction, ৳100 delivery calculation, payload construction, and confirmation storage.
- Honey Nut campaign tracking names and CTA placements.

Run:

```bash
npm run check
npm run build
```

Then manually verify `/step/honey-nut` at mobile and desktop widths, including CTA scrolling, image loading, FAQ interaction, inventory recovery, checkout validation, order submission behavior, and thank-you navigation.

## Acceptance criteria

- `/step/honey-nut` renders independently without changing `/step/kalojira-mixed`.
- All guide sections are present in the specified order with Honey Nut copy.
- Hero and gallery use the supplied Honey Nut assets.
- Nine ingredient labels are represented in the grid.
- Product price and availability come from live Merchant Suite data.
- Checkout supports both existing variants and calculates ৳100 delivery.
- Existing nutritionist portrait and testimonials UI are reused.
- Page is responsive, keyboard usable, and respects reduced motion.
- TypeScript check, production build, and campaign tests pass.
