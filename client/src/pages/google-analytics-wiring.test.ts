import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const productPage = readFileSync(new URL("./product.tsx", import.meta.url), "utf8");
const homePage = readFileSync(new URL("./home.tsx", import.meta.url), "utf8");
const cartContext = readFileSync(new URL("../contexts/cart-context.tsx", import.meta.url), "utf8");
const cartDrawer = readFileSync(new URL("../components/cart-drawer.tsx", import.meta.url), "utf8");
const orderDialog = readFileSync(new URL("../components/order-dialog.tsx", import.meta.url), "utf8");

test("product page sends view_item and direct checkout item metadata", () => {
  assert.match(productPage, /trackGoogleEcommerceEvent\("view_item"/);
  assert.match(productPage, /analyticsItems: \[productAnalyticsItem\]/);
});

test("cart add sends add_to_cart with selected variant metadata", () => {
  assert.match(cartContext, /trackGoogleEcommerceEvent\("add_to_cart"/);
  assert.match(cartContext, /analyticsItem\?: GoogleAnalyticsItem/);
});

test("homepage add to cart passes real product metadata into cart analytics", () => {
  assert.match(homePage, /toGoogleAnalyticsItem/);
  assert.match(homePage, /analyticsItem: toGoogleAnalyticsItem\(\{/);
  assert.match(homePage, /id: product\.id \?\? product\.slug/);
});

test("cart checkout preserves every item for checkout and purchase analytics", () => {
  assert.match(cartDrawer, /analyticsItems: items\.map/);
  assert.match(cartDrawer, /toGoogleAnalyticsItem/);
});

test("order dialog sends begin_checkout and purchase after a successful order", () => {
  assert.match(orderDialog, /trackGoogleEcommerceEvent\("begin_checkout"/);
  assert.match(orderDialog, /trackGoogleEcommerceEvent\("purchase"/);
  assert.match(orderDialog, /transactionId: result\.orderRef \|\| result\.order_id/);
});
