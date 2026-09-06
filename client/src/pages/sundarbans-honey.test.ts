import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const pagePath = new URL("./sundarbans-honey.tsx", import.meta.url);
const checkoutPath = new URL("../features/sundarbans-honey/honey-checkout.tsx", import.meta.url);
const pageSource = readFileSync(pagePath, "utf8");
const checkoutSource = (() => {
  try {
    return readFileSync(checkoutPath, "utf8");
  } catch {
    return "";
  }
})();

test("campaign checkout polls the fixed live product and inventory with snapshot first paint", () => {
  assert.match(pageSource, /const slug = "sundarbans-natural-honey"/);
  assert.match(pageSource, /fetchStorefrontProduct\(slug\)/);
  assert.match(pageSource, /fetchStorefrontProductInventory\(slug\)/);
  assert.match(pageSource, /refetchInterval: STOREFRONT_POLL_INTERVAL_MS/);
  assert.match(pageSource, /generatedStorefrontProducts/);
  assert.match(pageSource, /findGeneratedStorefrontProduct/);
  assert.match(pageSource, /mergeInventory\(productQuery\.data, inventoryQuery\.data\?\.inventory\)/);
  assert.match(pageSource, /resolveHoneyCheckoutStatus/);
  assert.doesNotMatch(pageSource, /\{product \? \(/);
  assert.match(pageSource, /<HoneyCheckout[\s\S]*status=\{checkoutStatus\}/);
  assert.doesNotMatch(pageSource, /unitPrice:\s*(?:800|1600)/);
});

test("embedded checkout has pack, quantity, local location, and accessible Bangla validation controls", () => {
  assert.match(checkoutSource, /export function HoneyCheckout/);
  assert.match(checkoutSource, /type="radio"/);
  assert.match(checkoutSource, /name="quantity"/);
  assert.equal((checkoutSource.match(/<LocationCombobox/g) ?? []).length, 2);
  assert.match(checkoutSource, /getUpazilas\(districtId\)/);
  assert.match(checkoutSource, /\^\\d\{11\}\$/);
  assert.match(checkoutSource, /aria-describedby/);
  assert.match(checkoutSource, /aria-live="polite"/);
  assert.match(checkoutSource, /ফোন নম্বর/);
  assert.match(checkoutSource, /ডেলিভারি ঠিকানা/);
  assert.match(checkoutSource, /ক্যাশ অন ডেলিভারি/);
  assert.doesNotMatch(checkoutSource, /Dialog/);
});

test("submission revalidates the exact pack and sends only the Google-only COD contract", () => {
  assert.match(checkoutSource, /await Promise\.all/);
  assert.match(checkoutSource, /productQuery\.refetch\(\)/);
  assert.match(checkoutSource, /inventoryQuery\.refetch\(\)/);
  assert.match(checkoutSource, /variantId === selectedVariantId/);
  assert.match(checkoutSource, /এই প্যাকটি এখন অর্ডারের জন্য পাওয়া যাচ্ছে না। অন্য প্যাক বেছে নিন বা আমাদের কল করুন।/);
  assert.match(checkoutSource, /HONEY_DELIVERY_CHARGE/);
  assert.match(checkoutSource, /paymentMethod: "cash_on_delivery"/);
  assert.match(checkoutSource, /trackingMode: "google_only"/);
  assert.match(checkoutSource, /apiRequest\("POST", "\/api\/orders", payload\)/);
  assert.match(checkoutSource, /disabled=\{isPending \|\| status !== "ready"\}/);
  assert.match(checkoutSource, /setLocation\("\/step\/sundarbans-natural-honey\/thank-you"\)/);
  assert.doesNotMatch(checkoutSource, /trackGoogleEcommerceEvent\("purchase"/);
});

test("availability failures preserve the mounted form and provide exact recovery actions", () => {
  assert.doesNotMatch(checkoutSource, /if \(!packs\.length\) \{/);
  assert.match(checkoutSource, /status: HoneyCheckoutStatus/);
  assert.match(checkoutSource, /AVAILABILITY_ERROR/);
  assert.match(checkoutSource, /onRetry/);
  assert.match(checkoutSource, /<SupportActions placement="checkout_availability_error"/);
  assert.match(checkoutSource, /status === "ready" \? selectedPack : null/);
});

test("validation focuses controls in explicit DOM order and gives every pack radio an id", () => {
  assert.match(checkoutSource, /getHoneyFocusTargetId/);
  assert.match(checkoutSource, /id=\{`honey-pack-\$\{pack\.variantId\}`\}/);
  assert.doesNotMatch(checkoutSource, /Object\.keys\(fieldErrors\)/);
});

test("checkout analytics use product data but never customer fields", () => {
  assert.match(checkoutSource, /trackGoogleEcommerceEvent\("view_item"/);
  assert.match(checkoutSource, /trackGoogleEcommerceEvent\("select_item"/);
  assert.match(checkoutSource, /trackGoogleEcommerceEvent\("begin_checkout"/);
  assert.match(checkoutSource, /trackHoneyCampaignEvent\("checkout_error", \{ error_type: type \}\)/);
  assert.match(checkoutSource, /items: \[analyticsItem\(initialPack, 1\)\]/);
  assert.match(checkoutSource, /items: \[analyticsItem\(pack, quantity\)\]/);
  assert.doesNotMatch(checkoutSource, /trackHoneyCampaignEvent\("checkout_error", \{[^}]*?(?:name|phone|address|district|upazila)/);
});
