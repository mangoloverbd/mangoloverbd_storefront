import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const homeSource = readFileSync(new URL("../pages/home.tsx", import.meta.url), "utf8");
const cardPath = new URL("./home-product-card.tsx", import.meta.url);
const cardSource = existsSync(cardPath) ? readFileSync(cardPath, "utf8") : "";

test("uses one styled product card across all homepage catalog sections", () => {
  assert.match(homeSource, /import HomeProductCard from "@\/components\/home-product-card"/);
  assert.equal((homeSource.match(/<HomeProductCard\b/g) ?? []).length, 4);
  assert.match(cardSource, /Save/);
  assert.match(cardSource, /compareAtPrice/);
  assert.match(cardSource, /Add to Cart/);
  assert.match(cardSource, /addToCart/);
  // The button is disabled when the product is unavailable and also when the
  // card cannot resolve the ids checkout needs, so it can never add an item
  // the Suite would reject.
  assert.match(cardSource, /disabled=\{!canAddToCart\}/);
  assert.match(cardSource, /product\.available !== false && Boolean\(productUuid\) && Boolean\(variantId\)/);
});
