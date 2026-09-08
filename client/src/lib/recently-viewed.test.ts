import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getRecentlyViewedProducts,
  MAX_RECENTLY_VIEWED,
  readRecentlyViewedSlugs,
  recordRecentlyViewedSlug,
  RECENTLY_VIEWED_STORAGE_KEY,
} from "./recently-viewed.ts";

function createStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

test("records a slug at the front and removes duplicate history", () => {
  const storage = createStorage({ [RECENTLY_VIEWED_STORAGE_KEY]: JSON.stringify(["older", "current"]) });

  const result = recordRecentlyViewedSlug(storage, "older");

  assert.deepEqual(result, ["older", "current"]);
});

test("limits the history to the configured maximum", () => {
  const storage = createStorage({
    [RECENTLY_VIEWED_STORAGE_KEY]: JSON.stringify(Array.from({ length: MAX_RECENTLY_VIEWED }, (_, index) => `old-${index}`)),
  });

  const result = recordRecentlyViewedSlug(storage, "new-product");

  assert.equal(result.length, MAX_RECENTLY_VIEWED);
  assert.equal(result[0], "new-product");
  assert.equal(result.includes(`old-${MAX_RECENTLY_VIEWED - 1}`), false);
});

test("ignores malformed and invalid stored values", () => {
  assert.deepEqual(readRecentlyViewedSlugs(createStorage({ [RECENTLY_VIEWED_STORAGE_KEY]: "not json" })), []);
  assert.deepEqual(
    readRecentlyViewedSlugs(createStorage({ [RECENTLY_VIEWED_STORAGE_KEY]: JSON.stringify(["valid", 42, "", null]) })),
    ["valid"],
  );
});

test("maps current catalog products in stored order and excludes the open product", () => {
  const products = [{ slug: "new" }, { slug: "open" }, { slug: "old" }] as Array<{ slug: string }>;

  assert.deepEqual(
    getRecentlyViewedProducts(products, ["old", "missing", "open", "new"], "open").map((product) => product.slug),
    ["old", "new"],
  );
});
