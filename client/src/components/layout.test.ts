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

test("uses visible Featured Categories for menu navigation", () => {
  assert.match(layoutSource, /getVisibleFeaturedCollections/);
  assert.match(layoutSource, /getVisibleFeaturedCollections\(searchableProducts\)/);
  assert.match(layoutSource, /\/collection\/\$\{slug\}/);
  assert.match(layoutSource, /visibleCollections\.map/);
});

test("does not expose obsolete menu categories", () => {
  for (const label of ["Organic", "Spices", "Beverage", "Rice", "Flours & lentils"]) {
    assert.doesNotMatch(layoutSource, new RegExp(label.replace(/&/g, "\\&")));
  }
});

test("connects footer information and support links to real pages", () => {
  for (const path of [
    "/about-us",
    "/contact-us",
    "/how-to-order",
    "/shipping-policy",
    "/payment-policy",
    "/terms-and-conditions",
    "/privacy-policy",
    "/refund-return-exchange",
    "/cancellation-policy",
    "/faq",
    "/track-order",
  ]) {
    assert.match(layoutSource, new RegExp(path));
  }
  assert.doesNotMatch(layoutSource, /href="#"/);
});
