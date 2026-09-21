import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchStorefrontInventoryBatch,
  STOREFRONT_POLL_INTERVAL_MS,
  type StorefrontInventoryEntry,
  type StorefrontInventoryMap,
  type StorefrontProduct,
} from "./storefront-products.ts";

export function catalogInventoryIds(products: readonly StorefrontProduct[]): string[] {
  const ids = new Set<string>();
  for (const product of products) {
    const id = product?.id == null ? "" : String(product.id);
    if (id) ids.add(id);
  }
  // Sorted so the query key is stable no matter how the list was filtered or
  // ordered — otherwise a re-sort would look like a new query and refetch.
  return Array.from(ids).sort();
}

// One batched stock read for a whole listing page. Every caller with the same
// product set shares a single query, so a 16-product grid makes one request per
// interval instead of sixteen.
export function useCatalogInventory(products: readonly StorefrontProduct[]): StorefrontInventoryMap {
  const ids = useMemo(() => catalogInventoryIds(products), [products]);
  const idsKey = ids.join(",");

  const { data } = useQuery({
    queryKey: ["merchant-suite-inventory-batch", idsKey],
    queryFn: () => fetchStorefrontInventoryBatch(ids),
    enabled: ids.length > 0,
    refetchInterval: STOREFRONT_POLL_INTERVAL_MS,
  });

  return data ?? {};
}

export function inventoryEntryFor(
  inventory: StorefrontInventoryMap,
  product: Pick<StorefrontProduct, "id">,
): StorefrontInventoryEntry | null {
  const id = product?.id == null ? "" : String(product.id);
  if (!id) return null;
  return inventory[id] ?? null;
}
