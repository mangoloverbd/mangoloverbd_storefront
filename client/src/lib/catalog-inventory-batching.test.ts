import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { catalogInventoryIds } from "./use-catalog-inventory.ts";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

const cardSource = read("../components/storefront-product-card.tsx");
const gridSource = read("../components/product-grid.tsx");
const productsSource = read("../pages/products.tsx");
const collectionSource = read("../pages/collection.tsx");
const libSource = read("./storefront-products.ts");

test("listing cards never open their own inventory query", () => {
  for (const source of [cardSource, gridSource]) {
    assert.doesNotMatch(source, /fetchStorefrontProductInventory/);
    assert.doesNotMatch(source, /"merchant-suite-inventory", /);
  }
});

test("every grid feeds its cards from one batched read", () => {
  for (const source of [gridSource, productsSource, collectionSource]) {
    assert.match(source, /useCatalogInventory\(/);
    assert.match(source, /inventory=\{inventoryEntryFor\(inventory, /);
  }
});

test("listing pages key the batch on the full catalog so they share one query", () => {
  assert.match(productsSource, /useCatalogInventory\(products \?\? \[\]\)/);
  assert.match(collectionSource, /useCatalogInventory\(products \?\? \[\]\)/);
});

test("the batch request stays inside the API's id ceiling", () => {
  assert.match(libSource, /STOREFRONT_INVENTORY_BATCH_LIMIT = 100/);
  assert.match(libSource, /slice\(0, STOREFRONT_INVENTORY_BATCH_LIMIT\)/);
});

test("polling is slow enough that a tab cannot trip the API rate limit", () => {
  const match = libSource.match(/STOREFRONT_POLL_INTERVAL_MS = (\d+)/);
  assert.ok(match, "poll interval must be declared");
  const intervalMs = Number(match[1]);
  // The Suite allows 60 public reads per minute per IP. A listing page now
  // makes 2 requests (catalog + batched inventory) per interval.
  const requestsPerMinute = (60_000 / intervalMs) * 2;
  assert.ok(
    requestsPerMinute <= 60,
    `a single tab would make ${requestsPerMinute} req/min against a 60 req/min limit`,
  );
});

test("ids are deduped and sorted so a re-filter does not refetch", () => {
  const ids = catalogInventoryIds([
    { id: "b", name: "B", slug: "b" },
    { id: "a", name: "A", slug: "a" },
    { id: "b", name: "B again", slug: "b2" },
    { name: "no id", slug: "c" },
  ]);
  assert.deepEqual(ids, ["a", "b"]);
});

test("numeric and missing ids are handled without producing empty keys", () => {
  assert.deepEqual(catalogInventoryIds([{ id: 12, name: "N", slug: "n" }]), ["12"]);
  assert.deepEqual(catalogInventoryIds([{ id: undefined, name: "U", slug: "u" }]), []);
  assert.deepEqual(catalogInventoryIds([]), []);
});
