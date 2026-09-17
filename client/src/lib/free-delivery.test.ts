import assert from "node:assert/strict";
import { test } from "node:test";

import { bundleHasFreeDeliveryProduct } from "./free-delivery";

test("returns true for the Black Seed Flower Honey slug", () => {
  assert.equal(
    bundleHasFreeDeliveryProduct({ title: "anything", productSlug: "black-seed-flower-honey" }),
    true,
  );
});

test("returns true when the title is the honey name", () => {
  assert.equal(
    bundleHasFreeDeliveryProduct({ title: "কালোজিরা ফুলের মধু | Black Seed Flower Honey" }),
    true,
  );
});

test("returns false for other products", () => {
  assert.equal(
    bundleHasFreeDeliveryProduct({ title: "কালোজিরা মিক্সড | Kalojira Mixed", productSlug: "kalojira-mixed" }),
    false,
  );
});

test("returns false for null or empty bundles", () => {
  assert.equal(bundleHasFreeDeliveryProduct(null), false);
  assert.equal(bundleHasFreeDeliveryProduct({ title: "" }), false);
});
