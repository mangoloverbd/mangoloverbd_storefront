import assert from "node:assert/strict";
import test from "node:test";
import { getKalojiraFocusTargetId, resolveKalojiraCheckoutStatus } from "./checkout-state.ts";

test("live product or inventory errors block stale checkout data", () => {
  assert.equal(resolveKalojiraCheckoutStatus({
    hasProduct: true,
    hasOrderablePacks: true,
    productIsPending: false,
    productIsError: true,
    inventoryIsError: false,
    inventoryIsFetched: true,
    hasInventory: true,
  }), "error");
});

test("focus target follows the checkout DOM order", () => {
  assert.equal(getKalojiraFocusTargetId({ address: "required", phone: "invalid" }, "v1kg", ["v500", "v1kg"]), "kalojira-phone");
});
