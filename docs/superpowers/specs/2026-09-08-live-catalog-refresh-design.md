# Live Catalog Refresh on Storefront — Design

Date: 2026-09-08
Status: Approved

## Problem

The storefront renders `generatedStorefrontProducts` immediately as first-paint
data. Its shared TanStack Query client uses `staleTime: Infinity`, so catalog
queries that provide this snapshot as `initialData` do not revalidate on mount.
Newly published dashboard products can therefore appear only after a later poll,
then disappear again after a full page refresh when the old snapshot renders.

The Merchant Suite public catalog API is authoritative and currently returns all
published Mango Lover BD products, so this is a storefront query freshness bug,
not a Supabase persistence problem.

## Design

Apply catalog-specific freshness settings to every query that reads the shared
product listing:

- `staleTime: 0` marks the build snapshot stale immediately.
- `refetchOnMount: "always"` guarantees a live API request on each page mount,
  including when a query result is already present in the client cache.
- Keep the global `QueryClient` defaults unchanged so checkout and unrelated
  queries retain their current behavior.
- Keep the generated snapshot as an immediate fallback while the live request is
  pending or unavailable.

The settings apply to the homepage, products page, shared product grid, search
menu, and product-detail related-products listing. Product detail and inventory
queries retain their existing polling behavior.

## Error handling

If the live request fails, the existing snapshot/fallback remains visible and
the current error states continue to render. No product data is hardcoded or
written in the storefront repository.

## Testing

Add a source-contract regression test covering the catalog query options and
run the storefront test suite, TypeScript check, and production build before
deployment.
