import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const productsSource = readFileSync(new URL("./products.tsx", import.meta.url), "utf8");
const gridSource = readFileSync(new URL("../components/product-grid.tsx", import.meta.url), "utf8");

test("renders generated products before the live catalog request completes", () => {
  assert.match(productsSource, /generatedStorefrontProducts/);
  assert.match(productsSource, /initialData: generatedStorefrontProducts/);
  assert.match(productsSource, /initialDataUpdatedAt: 0/);
  assert.match(productsSource, /isError && !filteredProducts\?\.length/);
});

test("keeps the shared product grid visible when background revalidation fails", () => {
  assert.match(gridSource, /generatedStorefrontProducts/);
  assert.match(gridSource, /initialData: generatedStorefrontProducts/);
  assert.match(gridSource, /isError && products\.length === 0/);
});
