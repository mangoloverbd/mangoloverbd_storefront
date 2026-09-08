# Recently Viewed Products Design

## Goal

Add a consistent `Recently Viewed` product section to the homepage, the `/products` catalog page, and individual product-detail pages. The section should use the existing shared product-card treatment while feeling like a deliberate Swiss-style editorial module.

## Scope

- Record product views in browser `localStorage`.
- Keep the most recent product slugs first and deduplicate repeated views.
- Resolve stored slugs against the current live catalog so prices, images, availability, and compare-at data remain current.
- Display up to four products on desktop and two products on mobile.
- Exclude the currently open product from its own product-detail recommendation section.
- Render the section only when at least one recently viewed product is available.
- Preserve the existing catalog fallback, inventory polling, cart analytics, and page layouts.

## Visual design

- Section heading is left-aligned.
- Heading follows the homepage section-title language: bold leading text and the highlighted/display treatment for `Recently Viewed`.
- A compact previous/next arrow control sits on the right side of the heading row.
- The cards use the existing `HomeProductCard`, including pricing, compare-at price, savings, sold-out state, hover treatment, and Add to Cart behavior.
- Cards are presented in a horizontal carousel rather than a new page-specific card grid.
- The carousel remains responsive: four visible cards on desktop, two visible cards on mobile, with horizontal movement controlled by the arrow buttons.

## Data flow

1. When a product detail page has a resolved product, store its slug at the front of a bounded recent-view list.
2. On the homepage, `/products`, and product-detail pages, read the recent slugs from storage.
3. Use the page's live catalog data to map those slugs back to products, preserving recent-view order and dropping unavailable catalog entries.
4. Apply the existing inventory query/merge behavior through `HomeProductCard` consumers without creating a second stock source.

The storage format is versioned and defensive: malformed or unavailable storage is treated as an empty list, never as a rendering error.

## Component boundaries

- A small recent-view utility owns storage read/write, deduplication, ordering, and limiting.
- A reusable `RecentlyViewed` section owns the heading, arrow controls, responsive carousel, and product-card rendering.
- Page components provide the current catalog and, on the detail page, the current product slug to exclude.

## Testing

- Unit tests cover recent-view storage ordering, deduplication, bounded history, malformed data, and current-product exclusion.
- Source-contract or component tests confirm all three page surfaces render the shared section and `HomeProductCard`.
- Production build verification confirms the new carousel and storage code bundle successfully.

## Non-goals

- No server-side tracking or account-based history.
- No changes to the public API or Supabase schema.
- No changes to existing product-card styling or catalog layout outside the new section.
