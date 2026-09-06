import assert from "node:assert/strict";
import test from "node:test";
import { orderRequestSchema } from "./order-service.ts";

const validOrder = {
  bundleTitle: "Test bundle",
  bundleDetails: "Test details",
  bundlePrice: 500,
  quantity: 2,
  deliveryCharge: 100,
  customerName: "Test Customer",
  phone: "০১৭১২৩৪৫৬৭৮",
  address: "House 1 Road 2 Dhaka",
  paymentMethod: "cash_on_delivery" as const,
};
const validEnglishOrder = { ...validOrder, phone: "01712345678" };

test("accepts exactly 11 English phone digits", () => {
  const order = orderRequestSchema.parse(validEnglishOrder);

  assert.equal(order.phone, "01712345678");
});

test("rejects Bengali phone digits", () => {
  assert.throws(() => orderRequestSchema.parse(validOrder));
});

test("rejects an address with fewer than three words", () => {
  assert.throws(() => orderRequestSchema.parse({ ...validOrder, address: "Dhaka" }));
});

test("requires a positive whole-number quantity", () => {
  assert.equal(orderRequestSchema.parse(validEnglishOrder).quantity, 2);
  assert.throws(() => orderRequestSchema.parse({ ...validEnglishOrder, quantity: 0 }));
  assert.throws(() => orderRequestSchema.parse({ ...validEnglishOrder, quantity: 1.5 }));

  const { quantity: _quantity, ...withoutQuantity } = validEnglishOrder;
  assert.throws(() => orderRequestSchema.parse(withoutQuantity));
});
