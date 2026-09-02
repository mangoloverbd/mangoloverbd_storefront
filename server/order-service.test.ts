import assert from "node:assert/strict";
import test from "node:test";
import { orderRequestSchema } from "./order-service";

const validOrder = {
  bundleTitle: "Test bundle",
  bundleDetails: "Test details",
  bundlePrice: 500,
  deliveryCharge: 100,
  customerName: "Test Customer",
  phone: "০১৭১২৩৪৫৬৭৮",
  address: "House 1 Road 2 Dhaka",
  paymentMethod: "cash_on_delivery" as const,
};

test("accepts exactly 11 English phone digits", () => {
  const order = orderRequestSchema.parse({ ...validOrder, phone: "01712345678" });

  assert.equal(order.phone, "01712345678");
});

test("rejects Bengali phone digits", () => {
  assert.throws(() => orderRequestSchema.parse(validOrder));
});

test("rejects an address with fewer than three words", () => {
  assert.throws(() => orderRequestSchema.parse({ ...validOrder, address: "Dhaka" }));
});
