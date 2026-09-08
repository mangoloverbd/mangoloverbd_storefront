import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const productSource = readFileSync(new URL("./product.tsx", import.meta.url), "utf8");

test("uses the shared styled card for product-page recommendations", () => {
  assert.match(productSource, /import HomeProductCard from "@\/components\/home-product-card"/);
  assert.match(productSource, /relatedProducts\.map\(\(p\) => \(/);
  assert.match(productSource, /<HomeProductCard key=\{p\.slug\} product=\{p\} \/>/);
});
