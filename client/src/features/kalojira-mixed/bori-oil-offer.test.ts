import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  buildKalojiraOrderConfirmation,
  buildKalojiraOrderItems,
  buildKalojiraOrderPayload,
  calculateKalojiraOrder,
  getKalojiraAddOn,
  readKalojiraOrderConfirmation,
  writeKalojiraOrderConfirmation,
} from "./order.ts";

const BORI_ID = "db9134d3-4771-4f66-960c-7fac1fb782e1";
const bori = { id: BORI_ID, slug: "homemade-pumpkin-bori", name: "হোমমেড কুমড়ো বড়ি | Homemade Pumpkin Bori", available: true, variants: [] };
const pack = { variantId: "v1kg", label: "১ কেজি", unitPrice: 650 };
const offer = {
  id: "bori-mustard-oil",
  triggerProductId: BORI_ID,
  productId: "oil-id",
  productSlug: "mustard-oil",
  productName: "সরিষার তেল | Mustard Oil",
  imageUrl: "https://example.test/oil.webp",
  variantId: "oil-1l",
  variantLabel: "১ লিটার",
  regularPrice: 350,
  offerPrice: 280,
  maxQuantity: 1,
  available: true,
};
const customer = { customerName: "Test Customer", phone: "01712345678", address: "House 1, Road 2, Dhanmondi Dhaka" };

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
    removeItem: (key: string) => void values.delete(key),
  };
}

test("picks the live offer for the product being sold", () => {
  assert.deepEqual(getKalojiraAddOn([offer], bori), {
    offerId: "bori-mustard-oil",
    productId: "oil-id",
    variantId: "oil-1l",
    name: "সরিষার তেল",
    label: "১ লিটার",
    price: 280,
    regularPrice: 350,
    imageUrl: "https://example.test/oil.webp",
  });
});

test("shows no offer for other products, sold-out bottles or bad data", () => {
  assert.equal(getKalojiraAddOn([offer], { ...bori, id: "kalojira" }), null);
  assert.equal(getKalojiraAddOn([{ ...offer, available: false }], bori), null);
  assert.equal(getKalojiraAddOn([{ ...offer, offerPrice: 0 }], bori), null);
  assert.equal(getKalojiraAddOn([{ ...offer, offerPrice: 400 }], bori), null);
  assert.equal(getKalojiraAddOn(undefined, bori), null);
  assert.equal(getKalojiraAddOn([offer], null), null);
});

test("adds the oil to the total without changing the bori subtotal", () => {
  assert.deepEqual(calculateKalojiraOrder(650, 1, 100, 280), {
    unitPrice: 650, quantity: 1, subtotal: 650, deliveryCharge: 100, addOnPrice: 280, total: 1030,
  });
  assert.equal(calculateKalojiraOrder(650, 2, 100).total, 1400);
  assert.throws(() => calculateKalojiraOrder(650, 1, 100, -1));
});

test("sends the oil as a second line item with quantity 1", () => {
  const addOn = getKalojiraAddOn([offer], bori);
  assert.deepEqual(buildKalojiraOrderItems(BORI_ID, pack, 2, addOn), [
    { productId: BORI_ID, variantId: "v1kg", quantity: 2 },
    { productId: "oil-id", variantId: "oil-1l", quantity: 1 },
  ]);
  assert.deepEqual(buildKalojiraOrderItems(BORI_ID, pack, 2, null), [
    { productId: BORI_ID, variantId: "v1kg", quantity: 2 },
  ]);
});

test("names the oil in the order note", () => {
  const addOn = getKalojiraAddOn([offer], bori);
  const payload = buildKalojiraOrderPayload({ productName: bori.name, pack, quantity: 1, ...customer, deliveryCharge: 100, addOn });
  assert.equal(payload.bundleDetails, "১ কেজি + সরিষার তেল ১ লিটার");
  assert.equal(payload.bundlePrice, 650);
  const plain = buildKalojiraOrderPayload({ productName: bori.name, pack, quantity: 1, ...customer, deliveryCharge: 100 });
  assert.equal(plain.bundleDetails, "১ কেজি");
});

test("thank-you data keeps the oil line and the full total", () => {
  const addOn = getKalojiraAddOn([offer], bori);
  const payload = buildKalojiraOrderPayload({ productName: bori.name, pack, quantity: 1, ...customer, deliveryCharge: 100, addOn });
  const confirmation = buildKalojiraOrderConfirmation("ML-1", payload, addOn);
  assert.equal(confirmation.variantLabel, "১ কেজি");
  assert.deepEqual(confirmation.addOn, { name: "সরিষার তেল", label: "১ লিটার", price: 280 });
  assert.equal(confirmation.total, 1030);

  const storage = memoryStorage();
  assert.equal(writeKalojiraOrderConfirmation(storage, confirmation), true);
  assert.deepEqual(readKalojiraOrderConfirmation(storage), confirmation);
});

test("thank-you data without the oil is unchanged", () => {
  const payload = buildKalojiraOrderPayload({ productName: bori.name, pack, quantity: 1, ...customer, deliveryCharge: 100 });
  const confirmation = buildKalojiraOrderConfirmation("ML-2", payload);
  assert.equal(confirmation.addOn, undefined);
  assert.equal(confirmation.total, 750);
  const storage = memoryStorage();
  writeKalojiraOrderConfirmation(storage, confirmation);
  assert.deepEqual(readKalojiraOrderConfirmation(storage), confirmation);
});

test("rejects stored thank-you data whose total does not add up", () => {
  const storage = memoryStorage();
  storage.setItem("kalojira-mixed-order-confirmation-v1", JSON.stringify({
    orderRef: "ML-3", productName: "Bori", variantLabel: "১ কেজি", quantity: 1, unitPrice: 650, subtotal: 650,
    deliveryCharge: 100, total: 750, customerName: "Test Customer", phone: "01712345678", address: "Dhaka",
    addOn: { name: "সরিষার তেল", label: "১ লিটার", price: 280 },
  }));
  assert.equal(readKalojiraOrderConfirmation(storage), null);
});

const checkout = readFileSync(new URL("./kalojira-checkout.tsx", import.meta.url), "utf8");
const card = readFileSync(new URL("./bori-oil-offer.tsx", import.meta.url), "utf8");
const page = readFileSync(new URL("../../pages/homemade-pumpkin-bori.tsx", import.meta.url), "utf8");
const products = readFileSync(new URL("../../lib/storefront-products.ts", import.meta.url), "utf8");
const thankYou = readFileSync(new URL("../../pages/kalojira-mixed-thank-you.tsx", import.meta.url), "utf8");

test("offer is loaded from the Suite, never hardcoded in the storefront", () => {
  assert.match(products, /export async function fetchStorefrontOrderOffers/);
  assert.match(products, /\$\{STOREFRONT_API_BASE\}\/order-offers/);
  assert.match(page, /fetchStorefrontOrderOffers/);
  assert.match(page, /orderOffers=\{/);
  assert.doesNotMatch(card + checkout + page, /\b280\b|\b350\b/);
});

test("card asks the question centered with two choice rows", () => {
  assert.match(card, /বড়ির সাথে সরিষার তেল নেবেন\?/);
  assert.match(card, /কাঠের ঘানির/);
  assert.match(card, /কোল্ড প্রেসড সরিষার তেল/);
  assert.match(card, /বড়ির স্বাদ আরও দ্বিগুণ করে দেয়/);
  assert.match(card, /হ্যাঁ, তেল নেব/);
  assert.match(card, /না, শুধু বড়ি/);
  assert.match(card, /type="radio"/);
  assert.match(card, /name="bori-oil-offer"/);
  assert.match(card, /\/bori-mustard-oil\.webp/);
  assert.doesNotMatch(card, /@phosphor-icons/);
});

test("checkout only shows the card when an offer exists and sends the oil when chosen", () => {
  assert.match(checkout, /getKalojiraAddOn\(orderOffers, product\)/);
  assert.match(checkout, /addOn \? <BoriOilOffer/);
  assert.match(checkout, /buildKalojiraOrderItems\(/);
  assert.match(checkout, /সরিষার তেল/);
  assert.match(checkout, /orderOffersQuery/);
});

test("thank-you page lists the oil when it was ordered", () => {
  assert.match(thankYou, /confirmation\.addOn/);
});
