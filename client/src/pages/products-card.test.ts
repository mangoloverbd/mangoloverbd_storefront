import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const productsSource = readFileSync(new URL("./products.tsx", import.meta.url), "utf8");
const cardSource = readFileSync(new URL("../components/storefront-product-card.tsx", import.meta.url), "utf8");

test("uses the shared styled card for the all-products catalog", () => {
  assert.match(productsSource, /import StorefrontProductCard from "@\/components\/storefront-product-card"/);
  assert.match(productsSource, /<StorefrontProductCard key=\{product\.slug\} product=\{product\} index=\{index\} \/>/);
  assert.match(cardSource, /<HomeProductCard product=\{merged\} \/>/);
  assert.match(cardSource, /mergeInventory\(product, inventory\?\.inventory\)/);
});
