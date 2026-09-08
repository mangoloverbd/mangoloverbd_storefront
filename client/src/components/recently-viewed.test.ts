import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const componentSource = readFileSync(new URL("./recently-viewed.tsx", import.meta.url), "utf8");

test("renders the shared card carousel with Swiss-style controls", () => {
  assert.match(componentSource, /useRecentlyViewedSlugs/);
  assert.match(componentSource, /getRecentlyViewedProducts/);
  assert.match(componentSource, /<HomeProductCard/);
  assert.match(componentSource, /Recently.*Viewed/);
  assert.match(componentSource, /aria-label=\{?"Previous recently viewed products"/);
  assert.match(componentSource, /aria-label=\{?"Next recently viewed products"/);
  assert.match(componentSource, /basis-\[calc\(\(100%_-_0\.5rem\)_\/_2\)\]/);
  assert.match(componentSource, /basis-\[calc\(\(100%_-_3rem\)_\/_4\)\]/);
});
