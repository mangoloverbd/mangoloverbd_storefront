import assert from "node:assert/strict";
import { test } from "node:test";
import { getMerchantSuiteTrackerUrl } from "./tracker.ts";

const storefrontId = "3cd26e57-85ef-4970-94a4-cd99c0f1b554";

test("does not inject a tracker from a free ngrok tunnel", () => {
  assert.equal(
    getMerchantSuiteTrackerUrl(
      "https://sulfite-steerable-purgatory.ngrok-free.dev",
      storefrontId,
    ),
    null,
  );
});

test("builds the tracker URL for a stable Merchant Suite origin", () => {
  assert.equal(
    getMerchantSuiteTrackerUrl("https://suite.mangoloverbd.com/", storefrontId),
    `https://suite.mangoloverbd.com/api/tracker.js?org=${storefrontId}`,
  );
});

test("does not inject a tracker for invalid configuration", () => {
  assert.equal(getMerchantSuiteTrackerUrl("", storefrontId), null);
  assert.equal(getMerchantSuiteTrackerUrl("not a url", storefrontId), null);
  assert.equal(getMerchantSuiteTrackerUrl("https://suite.example.com", ""), null);
});
