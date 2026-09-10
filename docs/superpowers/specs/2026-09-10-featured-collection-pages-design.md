# Featured Collection Pages

## Goal

Turn the eight existing Featured Categories cards into working collection pages while keeping the storefront-only scope. Each published product is assigned to exactly one collection.

## Confirmed assignments

- Homemade: `kalojira-mixed`, `beetroot-powder`, `sugarcane-juice-powder`, `amsotto-pickle`
- Honey: `litchi-flower-honey`, `sundarbans-natural-honey`, `black-seed-flower-honey`, `honey-nut`
- Oil & Ghee: `mustard-oil`, `pure-ghee`
- Semai: `lachcha-semai`
- Nuts & Seeds: `seed-nut-mix`, `seed-mixed`, `chia-seed`
- Jaggery: no product found
- Fresh Mango: no product found
- Dates: no product found

## Architecture

Add a shared storefront collection definition containing each collection's slug, display label, existing category image, and assigned product slugs. The homepage category cards link to `/collection/<slug>`. A new collection page fetches the live published catalog through the existing storefront API, selects the configured product slugs, and reuses the existing layout, product cards, animations, inventory refresh, product detail links, and generated catalog fallback.

This approach intentionally does not add Merchant Suite routes, Supabase tables, or database migrations. Assignments are fixed storefront presentation content and changes to them will be made in the storefront repository.

## User experience

- Collection pages use the same responsive product grid and visual language as `/products`.
- The collection name is the page heading.
- Products missing from the live catalog are ignored safely.
- Empty collections display exactly `No product found`.
- Homepage cards for empty collections are hidden without removing their definitions or direct routes.
- `/products` remains the complete published catalog.

## Verification

Add focused tests covering the collection definitions, one-category-per-product invariant, category-card destinations, filtering, and empty-category messaging. Run the storefront's test, type-check, and build commands after implementation.
