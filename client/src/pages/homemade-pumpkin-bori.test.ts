import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => {
  const url = new URL(path, import.meta.url);
  return existsSync(url) ? readFileSync(url, "utf8") : "";
};
const contentSource = read("../features/kalojira-mixed/bori-content.ts");
const checkoutSource = read("../features/kalojira-mixed/kalojira-checkout.tsx");

test("bori WhatsApp href uses the exact Bengali order message", () => {
  assert.match(contentSource, /হোমমেড কুমড়ো বড়ি \| Homemade Pumpkin Bori অর্ডার করতে চাই/);
  assert.match(contentSource, /https:\/\/wa\.me\/8801301636461\?text=\$\{encodeURIComponent\(BORI_CAMPAIGN_WHATSAPP_MESSAGE\)\}/);
});

test("bori image slots are named constants", () => {
  for (const name of ["BORI_PACK_500G_IMAGE", "BORI_PACK_1KG_IMAGE", "BORI_STRIP_IMAGE", "BORI_QUOTE_IMAGE", "BORI_BANNER_IMAGE", "BORI_HERO_FALLBACK_IMAGE"]) {
    assert.match(contentSource, new RegExp(`export const ${name} =`));
  }
});

test("shared checkout uses the bori WhatsApp href for the bori product", () => {
  assert.match(checkoutSource, /import \{ BORI_CAMPAIGN_WHATSAPP_HREF \} from "\.\/bori-content";/);
  assert.match(checkoutSource, /product\?\.slug === "homemade-pumpkin-bori" \? BORI_CAMPAIGN_WHATSAPP_HREF/);
  assert.match(checkoutSource, /product\?\.slug === "katimon-mango" \? KATIMON_CAMPAIGN_WHATSAPP_HREF/);
});
