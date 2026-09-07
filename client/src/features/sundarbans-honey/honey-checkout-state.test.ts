import assert from "node:assert/strict";
import test from "node:test";
import {
  getHoneyFocusTargetId,
  resolveHoneyCheckoutStatus,
} from "./honey-checkout-state.ts";

test("live query errors block stale snapshot pricing", () => {
  assert.equal(resolveHoneyCheckoutStatus({
    hasProduct: true,
    hasOrderablePacks: true,
    productIsPending: false,
    productIsError: true,
    inventoryIsError: false,
    inventoryIsFetched: true,
    hasInventory: true,
  }), "error");
});

test("missing live product or inventory and zero orderable packs are unavailable", () => {
  const ready = {
    hasProduct: true,
    hasOrderablePacks: true,
    productIsPending: false,
    productIsError: false,
    inventoryIsError: false,
    inventoryIsFetched: true,
    hasInventory: true,
  };

  assert.equal(resolveHoneyCheckoutStatus({ ...ready, hasProduct: false }), "unavailable");
  assert.equal(resolveHoneyCheckoutStatus({ ...ready, hasInventory: false }), "unavailable");
  assert.equal(resolveHoneyCheckoutStatus({ ...ready, hasOrderablePacks: false }), "unavailable");
});

test("snapshot first paint remains ready only while live queries have not failed", () => {
  assert.equal(resolveHoneyCheckoutStatus({
    hasProduct: true,
    hasOrderablePacks: true,
    productIsPending: false,
    productIsError: false,
    inventoryIsError: false,
    inventoryIsFetched: false,
    hasInventory: false,
  }), "ready");
});

test("focus follows visual DOM order rather than error insertion order", () => {
  assert.equal(getHoneyFocusTargetId({
    address: "required",
    phone: "invalid",
    quantity: "invalid",
  }, "pack-b", ["pack-a", "pack-b"]), "honey-quantity");
});

test("pack focus targets the selected radio or first rendered radio", () => {
  assert.equal(
    getHoneyFocusTargetId({ name: "invalid", pack: "unavailable" }, "pack-b", ["pack-a", "pack-b"]),
    "honey-pack-pack-b",
  );
  assert.equal(
    getHoneyFocusTargetId({ pack: "unavailable" }, "missing", ["pack-a", "pack-b"]),
    "honey-pack-pack-a",
  );
});
