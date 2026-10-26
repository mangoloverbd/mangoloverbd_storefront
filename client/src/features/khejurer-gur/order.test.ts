import assert from "node:assert/strict";
import test from "node:test";
import type { StorefrontProduct } from "../../lib/storefront-products.ts";
import {
  KHEJUR_CONFIRMATION_KEY,
  buildKhejurConfirmation,
  buildKhejurOrderPayload,
  calculateKhejurTotals,
  displayProductName,
  getKhejurLines,
  readKhejurConfirmation,
  writeKhejurConfirmation,
} from "./order.ts";

const product = (slug: string, id: string, variantId: string, price: number, compare: number | null, extra: Partial<StorefrontProduct> = {}): StorefrontProduct => ({
  id,
  slug,
  name: `খেজুরের ${slug} গুড় | Date Palm ${slug}`,
  price,
  compare_at_price: compare,
  available: true,
  variants: [{ id: variantId, price, available: true, stock_quantity: 50, attributes: { size: "১ কেজি" } }],
  ...extra,
});

const catalog = [
  product("patali", "p3", "v3", 420, 520),
  product("jhola", "p1", "v1", 420, 520),
  product("bij", "p2", "v2", 520, 620),
];

test("builds one line per orderable variant in the page's slug order", () => {
  const lines = getKhejurLines(catalog, ["jhola", "bij", "patali"]);
  assert.deepEqual(lines.map((line) => [line.slug, line.variantId, line.unitPrice, line.comparePrice]), [
    ["jhola", "v1", 420, 520],
    ["bij", "v2", 520, 620],
    ["patali", "v3", 420, 520],
  ]);
});

test("skips missing and sold-out products instead of inventing prices", () => {
  const soldOut = product("bij", "p2", "v2", 520, 620, { available: false });
  const lines = getKhejurLines([catalog[1], soldOut, null], ["jhola", "bij", "patali"]);
  assert.deepEqual(lines.map((line) => line.slug), ["jhola"]);
});

test("charges ৳100 delivery below ৳2600 and ships free from ৳2600", () => {
  const lines = getKhejurLines(catalog, ["jhola", "bij", "patali"]);
  const small = calculateKhejurTotals(lines, { v1: 1, v2: 1 });
  assert.deepEqual([small.units, small.subtotal, small.deliveryCharge, small.total], [2, 940, 100, 1040]);
  const large = calculateKhejurTotals(lines, { v2: 5 });
  assert.deepEqual([large.subtotal, large.deliveryCharge, large.total], [2600, 0, 2600]);
  assert.equal(calculateKhejurTotals(lines, {}).total, 0);
});

test("ignores quantities above the per-line cap", () => {
  const lines = getKhejurLines(catalog, ["jhola"]);
  assert.equal(calculateKhejurTotals(lines, { v1: 11 }).units, 0);
});

test("sends every selected gur as its own order item", () => {
  const lines = getKhejurLines(catalog, ["jhola", "bij", "patali"]);
  const totals = calculateKhejurTotals(lines, { v1: 2, v3: 1 });
  const payload = buildKhejurOrderPayload({ totals, customerName: "Rahim Uddin", phone: "01712345678", address: "House 1, Road 2, Dhaka" });
  assert.deepEqual(payload.items, [
    { productId: "p1", variantId: "v1", quantity: 2 },
    { productId: "p3", variantId: "v3", quantity: 1 },
  ]);
  assert.equal(payload.bundlePrice, 1260);
  assert.equal(payload.quantity, 3);
  assert.equal(payload.deliveryCharge, 100);
  assert.match(payload.bundleDetails, /খেজুরের jhola গুড় ১ কেজি × 2/);
});

test("refuses an empty order or an invalid phone", () => {
  const lines = getKhejurLines(catalog, ["jhola"]);
  assert.throws(() => buildKhejurOrderPayload({ totals: calculateKhejurTotals(lines, {}), customerName: "Rahim", phone: "01712345678", address: "House 1 Dhaka" }));
  assert.throws(() => buildKhejurOrderPayload({ totals: calculateKhejurTotals(lines, { v1: 1 }), customerName: "Rahim", phone: "12345678901", address: "House 1 Dhaka" }));
});

test("round-trips the confirmation through storage and rejects tampered totals", () => {
  const store = new Map<string, string>();
  const storage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k) };
  const lines = getKhejurLines(catalog, ["jhola", "bij"]);
  const totals = calculateKhejurTotals(lines, { v1: 1, v2: 1 });
  const payload = buildKhejurOrderPayload({ totals, customerName: "Rahim Uddin", phone: "01712345678", address: "House 1, Road 2, Dhaka" });
  assert.equal(writeKhejurConfirmation(storage, buildKhejurConfirmation("ML-1001", totals, payload)), true);
  assert.equal(readKhejurConfirmation(storage)?.total, 1040);

  const tampered = JSON.parse(store.get(KHEJUR_CONFIRMATION_KEY)!);
  tampered.total = 1;
  store.set(KHEJUR_CONFIRMATION_KEY, JSON.stringify(tampered));
  assert.equal(readKhejurConfirmation(storage), null);
});

test("shows the Bangla half of a bilingual product name", () => {
  assert.equal(displayProductName("খেজুরের পাটালী গুড় | Date Palm Patali Gur"), "খেজুরের পাটালী গুড়");
  assert.equal(displayProductName("Plain"), "Plain");
});
