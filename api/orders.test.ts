import assert from "node:assert/strict";
import test from "node:test";
import { validateOrder } from "./orders.ts";

const validOrder = {
  bundleTitle: "Test product",
  bundleDetails: "1 kg",
  bundlePrice: 1500,
  quantity: 3,
  deliveryCharge: 100,
  customerName: "Test Customer",
  phone: "01712345678",
  address: "House 1 Road 2 Dhaka",
  paymentMethod: "cash_on_delivery",
};

test("retains a positive whole-number quantity", () => {
  assert.equal(validateOrder(validOrder).quantity, 3);
});

test("rejects invalid quantities", () => {
  const { quantity: _quantity, ...withoutQuantity } = validOrder;
  assert.throws(() => validateOrder(withoutQuantity));

  for (const quantity of [0, -1, 1.5]) {
    assert.throws(() => validateOrder({ ...validOrder, quantity }));
  }
});
