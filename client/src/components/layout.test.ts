import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const layoutSource = readFileSync(new URL("./layout.tsx", import.meta.url), "utf8");

test("uses a compact announcement bar on mobile and restores desktop spacing", () => {
  assert.match(
    layoutSource,
    /min-h-\[34px\][^\n]*py-1\.5[^\n]*sm:min-h-\[42px\][^\n]*sm:py-2\.5/,
  );
});
