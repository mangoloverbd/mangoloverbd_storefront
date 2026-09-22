import assert from "node:assert/strict";
import { test } from "node:test";

import { getDefaultBundleIndex } from "./product-selection.ts";

test("selects the ২ কেজি bundle for Litchi Flower Honey", () => {
  assert.equal(getDefaultBundleIndex("litchi-flower-honey", [
    { title: "১ কেজি" },
    { title: "২ কেজি" },
  ]), 1);
});

test("keeps the first bundle for other products", () => {
  assert.equal(getDefaultBundleIndex("sundarbans-natural-honey", [
    { title: "৫০০ গ্রাম" },
    { title: "১ কেজি" },
  ]), 0);
});

test("falls back to the first Litchi bundle when ২ কেজি is unavailable", () => {
  assert.equal(getDefaultBundleIndex("litchi-flower-honey", [{ title: "১ কেজি" }]), 0);
});

test("selects the ১ কেজি bundle for Homemade Pumpkin Bori", () => {
  assert.equal(getDefaultBundleIndex("homemade-pumpkin-bori", [
    { title: "৫০০ গ্রাম" },
    { title: "১ কেজি" },
  ]), 1);
});

test("falls back to the first Bori bundle when ১ কেজি is unavailable", () => {
  assert.equal(getDefaultBundleIndex("homemade-pumpkin-bori", [{ title: "৫০০ গ্রাম" }]), 0);
});
