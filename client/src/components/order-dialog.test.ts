import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const dialogSource = readFileSync(new URL("./order-dialog.tsx", import.meta.url), "utf8");
const cssSource = readFileSync(new URL("../index.css", import.meta.url), "utf8");

test("a floating Place Order button submits the same checkout form", () => {
  assert.match(dialogSource, /<form\s+id="order-dialog-form"/);
  assert.match(dialogSource, /type="submit"\s+form="order-dialog-form"/);
  // DialogContent hides direct child buttons ([&>button]:hidden), so the
  // button must sit inside a wrapper element, never be a bare child button.
  assert.match(dialogSource, /<motion\.div\n\s+key="order-floating-cta"/);
  assert.match(dialogSource, /className="order-floating-cta /);
  // The button carries the live total so customers see the final price.
  assert.match(dialogSource, /tabular-nums">\n\s+৳\{\(bundle\.price \+ deliveryCharge\)\.toLocaleString\(\)\}/);
  // A rounded rectangle, not a pill.
  assert.doesNotMatch(dialogSource, /order-floating-cta[\s\S]{0,1200}rounded-full/);
});

test("the floating button hides while the real button is visible or the keyboard is open", () => {
  assert.match(dialogSource, /new IntersectionObserver/);
  assert.match(dialogSource, /const showFloatingCta = !submitButtonVisible && !fieldFocused/);
  assert.match(dialogSource, /onFocusCapture=\{handleFormFocus\}/);
});

test("the floating button lifts above Meta's in-app contact bar", () => {
  assert.match(dialogSource, /isMetaInAppBrowser\(navigator\.userAgent\)/);
  assert.match(dialogSource, /data-meta-in-app=/);
  assert.match(cssSource, /\.order-floating-cta \{\n\s+bottom: calc\(env\(safe-area-inset-bottom\) \+ 36px\);/);
  assert.match(cssSource, /\[data-meta-in-app="true"\] \.order-floating-cta \{\n\s+bottom: calc\(env\(safe-area-inset-bottom\) \+ 104px\);/);
  // On mobile the form leaves room to scroll its last buttons above
  // browser toolbars; Meta's in-app browser needs a little more.
  assert.match(cssSource, /@media \(max-width: 767px\) \{\n\s+\.order-dialog-form \{\n\s+padding-bottom: calc\(env\(safe-area-inset-bottom\) \+ 96px\);/);
  assert.match(cssSource, /\[data-meta-in-app="true"\] \.order-dialog-form \{\n\s+padding-bottom: 120px;/);
});

test("validation errors move the customer to the field that needs fixing", () => {
  assert.match(dialogSource, /const failField = /);
  assert.match(dialogSource, /failField\("name", "Please enter your full name\."\)/);
  assert.match(dialogSource, /failField\("phone", "Please enter your phone number\."\)/);
  assert.match(dialogSource, /failField\("address", "Please enter your delivery address\."\)/);
});

const cartDrawerSource = readFileSync(new URL("./cart-drawer.tsx", import.meta.url), "utf8");

test("the order summary lists every item with its own image, name, quantity and price", () => {
  assert.match(dialogSource, /lineItems\?: OrderDialogLineItem\[\]/);
  // Single-product checkout falls back to one line built from the bundle.
  assert.match(dialogSource, /const lineItems: OrderDialogLineItem\[\] = bundle\?\.lineItems\?\.length/);
  assert.match(dialogSource, /\{lineItems\.map\(\(item, index\) => \(/);
  assert.match(dialogSource, /src=\{item\.image\}/);
  assert.match(dialogSource, /Qty \{item\.quantity\}/);
  assert.match(dialogSource, /৳\{\(item\.unitPrice \* item\.quantity\)\.toLocaleString\(\)\}/);
  // No more collapsed "Cart Checkout" card with one image.
  assert.doesNotMatch(dialogSource, /src=\{bundle\.images\[0\]\.src\}/);
});

test("cart checkout passes each cart item as its own line", () => {
  assert.match(cartDrawerSource, /lineItems: items\.map\(\(item\) => \(\{\n\s+\/\/ .*\n\s+name: item\.title\.replace\(` \(\$\{item\.size\}\)`, ""\),\n\s+details: item\.size,\n\s+quantity: item\.quantity,\n\s+unitPrice: parseCurrencyAmount\(item\.price\),\n\s+image: item\.image,/);
});

test("phone and WhatsApp order options sit below the Place Order button", () => {
  const submitIndex = dialogSource.indexOf('"Place Order - অর্ডার করুন"');
  const helpIndex = dialogSource.indexOf("আমরা সবসময় আপনাকে সাহায্য করতে প্রস্তুত");
  const phoneIndex = dialogSource.indexOf('href="tel:+8801301636461"');
  const whatsappIndex = dialogSource.indexOf("https://wa.me/8801301636461");
  assert.ok(submitIndex > 0 && helpIndex > submitIndex, "help message follows the submit button");
  assert.ok(phoneIndex > helpIndex && whatsappIndex > phoneIndex, "phone then WhatsApp follow the message");
  assert.match(dialogSource, /অর্ডার করতে সমস্যা হচ্ছে\?/);
  assert.match(dialogSource, /ফোনে অর্ডার/);
  assert.match(dialogSource, /হোয়াটসএপ-এ অর্ডার/);
  // WhatsApp opens with the customer's items already filled in.
  assert.match(dialogSource, /const whatsappOrderText = /);
  assert.match(dialogSource, /encodeURIComponent\(whatsappOrderText\)/);
});
