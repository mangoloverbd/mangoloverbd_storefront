# Pumpkin Bori Default Variant Design

Date: 2026-09-22
Scope: storefront product page default selection for `homemade-pumpkin-bori`
Repo: `mangoloverbd/mangoloverbd_storefront`

## Goal

On the হোমমেড কুমড়ো বড়ি | Homemade Pumpkin Bori product page, the ১ কেজি (৳700)
variant is preselected on load. Shopper can still switch sizes. If ১ কেজি is
unavailable, fall back to the first available variant.

## Context

- `client/src/lib/product-selection.ts` — `getDefaultBundleIndex(slug, bundles)`
  is the single default-selection seam. Today only `litchi-flower-honey` has a
  custom default (২ কেজি); everything else returns 0.
- `client/src/pages/product.tsx:301` — `defaultBundleIdx =
  getDefaultBundleIndex(slug, bundles)`, then `useEffect` resets
  `selectedBundleIdx` when `slug / bundleSignature / defaultBundleIdx` changes.
- `bundles` in `product.tsx:281-299` are already filtered to orderable variants
  (`available !== false`, `stock_quantity > 0` when numeric), with
  `title = variant.attributes.size ?? first attribute ?? "Default"`.
- Price, analytics (`view_item`), and order submission follow `selectedBundle`,
  so changing the default index propagates everywhere with no extra edits.

## Design

Replace the single-slug `if` with a preferred-title map:

```ts
const PREFERRED_BUNDLE_BY_SLUG: Record<string, string> = {
  "litchi-flower-honey": "২ কেজি",
  "homemade-pumpkin-bori": "১ কেজি",
};

export function getDefaultBundleIndex(slug: string, bundles: BundleWithTitle[]): number {
  const preferred = PREFERRED_BUNDLE_BY_SLUG[slug];
  if (!preferred) return 0;
  const idx = bundles.findIndex((b) => b.title === preferred);
  return idx >= 0 ? idx : 0;
}
```

No change to `product.tsx`: the existing reset effect picks up the new
`defaultBundleIdx` on first load and when async catalog data arrives.

## Edge cases

- ১ কেজি out of stock / unpublished: it never enters `bundles`, `findIndex`
  returns -1, default is index 0 (first available). Matches the approved
  "preselect with fallback" choice.
- Exact title match on `১ কেজি`: same convention as the existing ২ কেজি rule.
  If the merchant renames the size attribute, the default silently falls back
  to index 0 — no crash, no empty selection.
- Single-variant or Default-titled products: unaffected (`preferred` undefined
  or not found → 0).
- Other products: behavior unchanged; existing litchi rule preserved verbatim.

## Testing

Extend `client/src/lib/product-selection.test.ts`:

1. selects index 1 for `homemade-pumpkin-bori` with
   `[{ title: "৫০০ গ্রাম" }, { title: "১ কেজি" }]`.
2. falls back to 0 for `homemade-pumpkin-bori` with `[{ title: "৫০০ গ্রাম" }]`.
3. keep existing 3 tests green (litchi prefer, other-products first, litchi
   fallback).

Run: `node --test` on the lib test (repo's existing pattern) plus `npm run build`
to confirm no type regression.

## Out of scope

- No backend / schema / API change; no variant reorder.
- No change to quick-order dialogs, cart, checkout, or dedicated sales pages
  (`honey-checkout`, `kalojira-checkout` select `packs[0]` by design).
- No merchant-editable "default variant" dashboard flag (rejected Approach B).
