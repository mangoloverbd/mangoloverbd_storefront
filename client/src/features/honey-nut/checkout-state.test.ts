import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("Honey Nut checkout state exposes live-data recovery states and DOM focus helpers", () => {
  let source = "";
  try {
    source = readFileSync(new URL("./checkout-state.ts", import.meta.url), "utf8");
  } catch {
    // The source assertion should fail until the contract exists.
  }
  assert.match(source, /resolveHoneyNutCheckoutStatus/);
  assert.match(source, /getFirstHoneyNutInvalidField/);
  assert.match(source, /getHoneyNutFocusTargetId/);
  assert.match(source, /honey-nut-pack/);
  assert.match(source, /honey-nut-\$\{firstField\}/);
});
