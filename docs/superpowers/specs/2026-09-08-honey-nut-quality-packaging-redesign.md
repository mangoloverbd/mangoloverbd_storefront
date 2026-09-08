# Honey Nut Quality & Packaging Redesign

## Scope

Redesign only the Honey Nut “Quality & packaging” section. Preserve the existing quality copy, section heading, accessibility label, and all other Honey Nut campaign sections.

## Visual direction

- Replace the current solid green two-column panel with a warm cream Swiss editorial layout.
- Use the supplied `WhatsApp Image 2026-09-08 at 16.09.06 (2).jpeg` as the section’s image, optimized into the Honey Nut public asset folder.
- Keep a wide image panel on the right at desktop widths, with a clean rectangular crop and a restrained border.
- Use a left editorial column containing a small `QUALITY / 05` label, the existing Bengali heading, and a short supporting line.
- Present the five existing quality points as numbered `01`–`05` rows with thin divider rules rather than rounded cards.

## Responsive behavior

- On mobile, stack the editorial heading, image, and numbered quality list in that order.
- Keep the list readable at narrow widths without horizontal scrolling.
- Preserve visible focus states and readable contrast.
- Respect the existing reduced-motion behavior; this redesign adds no new animation.

## Data and boundaries

- Do not add product, price, stock, variant, or order data.
- Do not alter Merchant Suite calls or checkout behavior.
- Keep the section isolated to `client/src/features/honey-nut/documentary-sections.tsx`, its focused source test, and the new optimized image asset.

## Verification

- Focused Honey Nut source tests must pass.
- `git diff --check` must pass.
- Production build must complete while preserving the generated catalog snapshot fallback behavior.
