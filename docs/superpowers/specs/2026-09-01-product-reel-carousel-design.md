# Product Reel Carousel Design

## Goal

Turn the product-page video reel into a smooth horizontal, swipeable carousel that clearly previews the next reel and feels natural on touch and mouse input.

## Design

- Replace the single-video viewer with a horizontal snap carousel containing the existing three Wistia reels.
- Keep portrait `9:16` video cards, with one active card and a visible portion of the next card.
- Move exactly one reel per intentional swipe, drag, arrow click, or keyboard action.
- Use smooth, interruptible carousel motion with no abrupt fades or jumps.
- Keep only the active reel mounted/playing to prevent multiple videos from playing simultaneously.
- Preserve previous/next arrow controls and dot navigation as secondary controls.
- Keep the existing Bengali section heading and responsive layout.
- On mobile, prioritize touch scrolling and a partial next-card preview; on desktop, allow mouse dragging while keeping the same carousel interaction model.

## Scope

Modify the product-page reel markup and state in `client/src/pages/product.tsx`. Add focused regression coverage in `client/src/pages/product.test.ts`. No API, Wistia media ID, or content changes are required.

## Verification

- Run the focused product-page test.
- Run the storefront production build.
- Confirm the source keeps all three Wistia media IDs, carousel controls, and smooth snap configuration.
- Confirm the diff does not alter checkout, product data, or other page sections.
