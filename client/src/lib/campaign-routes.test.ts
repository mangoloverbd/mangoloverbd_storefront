import assert from "node:assert/strict";
import test from "node:test";
import { isGoogleOnlyCampaignPath } from "./campaign-routes.ts";

test("recognizes campaign paths", () => {
  assert.equal(isGoogleOnlyCampaignPath("/step/sundarbans-natural-honey"), true);
  assert.equal(isGoogleOnlyCampaignPath("/step/sundarbans-natural-honey/"), true);
  assert.equal(isGoogleOnlyCampaignPath("/step/sundarbans-natural-honey/thank-you"), true);
});

test("keeps normal routes outside the policy", () => {
  assert.equal(isGoogleOnlyCampaignPath("/product/sundarbans-natural-honey"), false);
  assert.equal(isGoogleOnlyCampaignPath("/products"), false);
});
