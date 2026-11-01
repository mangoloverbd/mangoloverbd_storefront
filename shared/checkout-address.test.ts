import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { ADDRESS_ERROR, addressWordCount, isCompleteAddress } from "./checkout-address.ts";
import { buildKalojiraOrderPayload } from "../client/src/features/kalojira-mixed/order.ts";
import { buildHoneyNutOrderPayload } from "../client/src/features/honey-nut/order.ts";
import { buildHoneyOrderPayload } from "../client/src/features/sundarbans-honey/order.ts";

const addresses = [
  ["Dhaka", false],
  ["Mirpur 10", false],
  ["Uttara, Dhaka", false],
  ["Dhanmondi lake dhaka", true],
  ["House 12, Road 5, Mirpur, Dhaka", true],
  ["Mirpur,Section 10,Dhaka", true],
  ["   ", false],
  ["Road 1 Dhaka " + "x".repeat(300), false],
] as const;

test("an address needs 5+ characters and house/road, area and district (3 words)", () => {
  for (const [address, complete] of addresses) {
    assert.equal(isCompleteAddress(address), complete, address);
  }
  assert.equal(addressWordCount("Mirpur,Dhaka"), 2);
  assert.ok(ADDRESS_ERROR.length > 10);
});

const pack = { variantId: "v1", label: "1kg", unitPrice: 650 };
const base = { productName: "Pumpkin Bori", pack, quantity: 1, customerName: "Test Customer", phone: "01712345678" };
const builders = {
  kalojira: (address: string) => buildKalojiraOrderPayload({ ...base, address }),
  honeyNut: (address: string) => buildHoneyNutOrderPayload({ ...base, address }),
  sundarbansHoney: (address: string) => buildHoneyOrderPayload({ ...base, address }),
};

test("every order builder accepts exactly the addresses the address box accepts", () => {
  for (const [name, build] of Object.entries(builders)) {
    for (const [address, complete] of addresses) {
      if (address.trim().length > 300) continue; // the box's maxLength stops longer input
      const accepted = (() => { try { build(address); return true; } catch { return false; } })();
      assert.equal(accepted, complete, `${name}: ${JSON.stringify(address)}`);
    }
  }
});

test("all five checkouts use the shared address rule and failure messages", () => {
  const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
  const checkouts = [
    "client/src/features/kalojira-mixed/kalojira-checkout.tsx",
    "client/src/features/honey-nut/honey-nut-checkout.tsx",
    "client/src/features/sundarbans-honey/honey-checkout.tsx",
    "client/src/features/khejurer-gur/khejur-checkout.tsx",
    "client/src/components/order-dialog.tsx",
  ];
  for (const path of checkouts) {
    const source = read(path);
    assert.match(source, /isCompleteAddress\(/, path);
    assert.match(source, /ADDRESS_ERROR/, path);
    assert.match(source, /checkoutFailureMessage\(error\)/, path);
    assert.doesNotMatch(source, /"refresh-failed"/, path);
  }
  assert.match(read("client/src/features/khejurer-gur/order.ts"), /addressWordCount\(address\) < ADDRESS_MIN_WORDS/);
  assert.match(read("client/src/pages/khejurer-gur.tsx"), /throw new CheckoutConnectionError\(\)/);
});
