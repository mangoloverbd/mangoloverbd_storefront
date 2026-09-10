# Menu Category Navigation Design

## Goal

Update the storefront’s desktop and mobile category navigation to use the same Featured Categories shown on the homepage.

## Behavior

- The desktop category strip, desktop menu overlay, and mobile menu’s Collection view read from `FEATURED_COLLECTIONS`.
- Only collections with matching live catalog products are shown:
  - Homemade
  - Honey
  - Oil & Ghee
  - Semai
  - Nuts & Seeds
- Each visible category links to `/collection/:slug`.
- Empty categories (Jaggery, Fresh Mango, and Dates) remain defined and directly routable, but are omitted from both menus.
- Existing Home, Track Order, Contact Us, search, cart, and menu interactions remain unchanged.

## Implementation

`layout.tsx` will import `getVisibleFeaturedCollections` and use the already-loaded catalog query to produce the navigation items. The desktop strip, desktop overlay, and mobile Collection submenu will map the same result, preventing category names, visibility, and URLs from drifting apart. Desktop overlay category entries become direct collection links instead of the obsolete product-keyword accordions.

## Testing

Add regression coverage that verifies the old menu categories are gone, visible categories use collection URLs, and both desktop and mobile menu paths consume the shared visibility helper.
