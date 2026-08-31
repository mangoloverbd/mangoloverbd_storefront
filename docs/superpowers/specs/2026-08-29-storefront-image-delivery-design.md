# Storefront Image Delivery Design

## Goal

Make full product images arrive quickly on a new browser or device while keeping Supabase as the only commerce database and image store.

## Evidence

- Fixed homepage assets are committed in `client/public/` and served by Vercel. Product images are separate public objects in Supabase Storage's `product-images` bucket.
- A Vite SPA does not expose its React images in the initial HTML. The live hero request began about 930 ms after navigation because the browser first downloaded and ran the application bundle.
- Homepage product cards and category images are intentionally lazy. The current long Framer Motion reveal also delays visible content after it enters the viewport.
- The current category images are 1254 x 1254 sources rendered at about 104 x 104 pixels; one PNG is 1.6 MB.
- Product uploads store one original JPEG, PNG, or WebP object and expose that same URL to every screen size. The six existing image rows use this legacy single-source model.
- Direct Supabase object responses currently revalidate on a cold browser. Object metadata has a one-hour cache setting, but the delivered raw-object response was observed with `Cache-Control: no-cache`.

## Constraints

- Supabase remains the shared source of truth for Merchant Suite and storefront data. No second database, storefront Supabase client, or external image vendor is introduced.
- The storefront continues to access commerce data only through Merchant Suite's public API.
- Existing product rows and direct image URLs must remain valid while the backfill is running.
- New paths must be immutable. A new image replaces the old path rather than overwriting it.
- The customer sees the full image only. The design intentionally excludes blurred or low-quality placeholders.

## Chosen Architecture

### Storage Layout

Each new product image receives one immutable asset directory in the existing public bucket:

```text
product-images/
  <org_id>/<product_id>/<asset_uuid>/
    source
    320.webp
    640.webp
    960.webp
```

- `source` preserves the merchant's original bytes and MIME type for future reprocessing.
- `320.webp`, `640.webp`, and `960.webp` are generated with `sharp`, normalized for EXIF orientation, and never enlarged beyond the source dimensions.
- The three delivery objects receive a one-year cache setting because their UUID paths are never overwritten.
- No schema migration is needed. `product_images.storage_path` stores the source path, and `product_images.image_url` stores the public 960 px URL as the existing fallback URL.

### Merchant Suite Upload And Cleanup

1. The authenticated image-upload route resolves the current Mango Lover BD workspace and validates the existing file count, MIME type, byte limit, and a safe pixel limit.
2. It creates the source and all three WebP buffers before writing database metadata.
3. It uploads the source and variants to the immutable asset directory. If any upload or database insert fails, it removes every object written for that image.
4. It inserts the existing `product_images` row only after all four objects exist, mirrors the 960 px URL to `products.image_url` for compatibility, and purges the relevant public catalog cache.
5. Reorder, individual-image delete, and product delete remove the source plus all three variants. They also purge the affected catalog entries.

### Public Catalog Contract

Existing fields remain compatible. Each gallery object receives an optional delivery map when the complete variant set exists:

```json
{
  "id": "...",
  "url": "https://.../960.webp",
  "sources": {
    "320": "https://.../320.webp",
    "640": "https://.../640.webp",
    "960": "https://.../960.webp"
  },
  "alt_text": "...",
  "sort_order": 0,
  "is_primary": true
}
```

- `image_url` and `image_urls` continue to return the 960 px URL strings for current consumers.
- Legacy rows without variants return their current `url` and omit `sources`; the storefront safely falls back to that URL.
- Internal `storage_path` values never reach the public API.
- Catalog cache validators include gallery data, and all image mutations purge the catalog cache so changed image metadata becomes visible promptly.

### Backfill

An explicit server-side maintenance script processes the six current `product_images` rows for the Mango Lover BD workspace.

1. It defaults to dry-run mode and requires an explicit apply flag plus the target workspace identifier.
2. For each legacy image, it downloads the existing object, creates a new immutable source-plus-variants directory, and verifies all uploads.
3. Only after successful uploads does it update that image row to the new source path and 960 px URL.
4. The old flat object remains untouched as a rollback path. Failed or interrupted rows remain in their legacy state and are safe to retry.
5. The script purges the catalog cache after each successful image update.

The script is never run at server startup and is not exposed as a public HTTP endpoint.

### Storefront Rendering

1. Extend the shared storefront image type and resolver to prefer a gallery object's `sources` map over its string-only compatibility fields.
2. Render responsive images with `srcset` and `sizes`:
   - 320 px for cart and checkout thumbnails.
   - 320/640 px candidates for product cards.
   - Up to 960 px for the product detail gallery.
3. Replace `home.tsx`'s hard-coded product, price, and direct Supabase image arrays with the live Merchant Suite catalog. Preserve the existing multiple homepage product-section layouts by cycling the available published products through their existing card counts.
4. Preserve product-card styling, links, and quick-add behavior while using live names, prices, and responsive image data.
5. Preload the fixed Vercel hero in `client/index.html`, preconnect to the Supabase image host, create versioned 256 px WebP category assets, and remove the artificial long reveal delay from immediately visible images.
6. Keep farther-down editorial content lazy. Do not show blur placeholders; a card keeps its existing neutral background until the full selected image finishes loading.

## Error Handling And Security

- All image reads and mutations retain the fixed workspace `org_id` guard.
- The public API accepts no workspace identifier from visitors and exposes no internal storage paths.
- A corrupt image, unsupported MIME type, oversized input, pixel-limit failure, `sharp` failure, or storage failure returns a clear upload error and leaves no database row or partial asset directory.
- Backfill continues past an individual failure, reports it, and never replaces a legacy row until its new objects are complete.
- Product-image cache headers are verified against a newly uploaded delivery object after deployment. If Supabase still returns `no-cache`, the system does not mass-edit existing object metadata; the Storage/Smart CDN behavior is investigated separately.

## Files Touched

### Merchant Suite

- `package.json` and `package-lock.json`
- `server/productImages.js` (new standalone image-processing helper)
- `server/index.js`
- `server/publicCatalog.js`
- `scripts/backfill-product-image-variants.mjs` (new explicit maintenance script)
- `src/test/productImagePipeline.test.ts` (new)
- `src/test/productImageGallery.test.ts`
- `src/test/publicCatalog.test.ts`

### Storefront

- `client/index.html`
- `client/src/lib/storefront-products.ts`
- `client/src/lib/storefront-products.test.ts`
- `client/src/pages/home.tsx`
- `client/src/pages/home.test.ts`
- `client/src/pages/products.tsx`
- `client/src/pages/product.tsx`
- `client/src/components/cart-drawer.tsx`
- `client/src/components/order-dialog.tsx`
- `client/public/categories/` (new versioned 256 px WebP files)

## Verification

1. Unit-test derivative generation with a representative JPEG or PNG: source preserved, three WebP outputs created, dimensions capped correctly, and no unwanted upscaling.
2. Unit-test rollback and deletion object lists so all four paths are handled.
3. Test the public catalog contract for responsive `sources`, legacy single-URL fallback, and no leaked storage paths.
4. Test the storefront resolver and each image context's selected candidate/fallback behavior.
5. Test live homepage product cycling for zero, one, and multiple published products without reintroducing hard-coded catalog values.
6. Run Merchant Suite tests, lint, and production build; run storefront type check, source tests, and production build. Confirm generated catalog artifacts are not unintentionally changed.
7. Run the backfill dry-run, then the explicit apply command only after its object and row counts match the six current images.
8. After deployment, use a clean browser profile to confirm the hero starts before application mount, category images are compact and available by the first scroll, and product cards choose responsive WebP sources.
