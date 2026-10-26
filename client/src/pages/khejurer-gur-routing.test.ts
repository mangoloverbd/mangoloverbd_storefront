import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const app = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
const page = readFileSync(new URL("./khejurer-gur.tsx", import.meta.url), "utf8");
const content = readFileSync(new URL("../features/khejurer-gur/content.ts", import.meta.url), "utf8");

test("registers the খেজুরের গুড় landing and thank-you routes in specific-first order", () => {
  const thankYouRoute = app.indexOf('path="/step/khejurer-gur/thank-you"');
  const landingRoute = app.indexOf('path="/step/khejurer-gur"');
  const productRoute = app.indexOf('path="/product/:id"');
  assert.ok(thankYouRoute >= 0);
  assert.ok(landingRoute >= 0);
  assert.ok(thankYouRoute < landingRoute);
  assert.ok(landingRoute < productRoute);
  assert.match(app, /খেজুরের গুড় \| ম্যাংগো লাভার/);
  assert.match(app, /খেজুরের গুড় অর্ডারের জন্য ধন্যবাদ \| ম্যাংগো লাভার/);
});

test("reads all three gur products from the live catalog instead of hardcoding prices", () => {
  for (const slug of ["date-palm-jhola-gur", "date-palm-bij-gur", "date-palm-patali-gur"]) assert.match(content, new RegExp(`slug: "${slug}"`));
  assert.match(page, /fetchStorefrontProduct\(slug\)/);
  assert.match(page, /fetchStorefrontProductInventory\(slug\)/);
  assert.doesNotMatch(content, /\b(unitPrice|selling_price|compare_at_price)\b/);
});
