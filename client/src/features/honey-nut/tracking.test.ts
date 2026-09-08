import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("Honey Nut tracking is campaign-scoped and excludes customer fields", () => {
  let source = "";
  try {
    source = readFileSync(new URL("./tracking.ts", import.meta.url), "utf8");
  } catch {
    // The source assertion should fail until the contract exists.
  }
  assert.match(source, /trackHoneyNutCampaignEvent/);
  assert.match(source, /honey_nut/);
  assert.match(source, /markHoneyNutPurchaseTracked/);
  assert.doesNotMatch(source, /customerName|customerPhone|customerAddress/);
});
