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

test("returns true for the Litchi Flower Honey slug", () => {
  assert.equal(
    bundleHasFreeDeliveryProduct({ title: "anything", productSlug: "litchi-flower-honey" }),
    true,
  );
});

test("returns true when the title is the Litchi Flower Honey name", () => {
  assert.equal(
    bundleHasFreeDeliveryProduct({ title: "লিচু ফুলের মধু | Litchi Flower Honey" }),
    true,
  );
});

test("returns true when a cart checkout contains Litchi Flower Honey", () => {
  assert.equal(
    bundleHasFreeDeliveryProduct({
      title: "Cart Checkout",
      captureItems: [{ productName: "লিচু ফুলের মধু | Litchi Flower Honey", quantity: 1, unitPrice: 700 }],
    }),
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
