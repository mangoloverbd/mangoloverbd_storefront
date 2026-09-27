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

const pageSource = read("./homemade-pumpkin-bori.tsx");
const appSource = read("../App.tsx");

test("bori route and title are registered", () => {
  assert.match(appSource, /import HomemadePumpkinBoriPage from "@\/pages\/homemade-pumpkin-bori";/);
  assert.match(appSource, /"\/step\/homemade-pumpkin-bori": "কুমড়ো বড়ি \| ম্যাংগো লাভার"/);
  assert.match(appSource, /<Route path="\/step\/homemade-pumpkin-bori">\s*<PageTransition><HomemadePumpkinBoriPage \/><\/PageTransition>/);
});

test("bori page loads the bori product and checks out with ৳100 delivery", () => {
  assert.match(pageSource, /const slug = "homemade-pumpkin-bori";/);
  assert.match(pageSource, /deliveryCharge=\{100\}/);
});

test("every bori WhatsApp entry point uses the bori href", () => {
  assert.match(pageSource, /window\.open\(BORI_CAMPAIGN_WHATSAPP_HREF, "_blank"/);
  assert.match(pageSource, /<MobileOrderBar checkoutId="order" whatsappHref=\{BORI_CAMPAIGN_WHATSAPP_HREF\}/);
  assert.ok((pageSource.match(/href=\{BORI_CAMPAIGN_WHATSAPP_HREF\}/g) ?? []).length >= 2, "header and footer WhatsApp links");
  assert.doesNotMatch(pageSource, /KATIMON_CAMPAIGN_WHATSAPP_HREF|katimon-mango/);
});

test("bori hero and pack copy match the spec", () => {
  for (const text of ["ঐতিহ্যবাহী ঘরোয়া স্বাদ", "ঘরে তৈরি, রোদে শুকানো", "কুমড়ো বড়ি", "৳400", "৳650", "৳700", "৳1,300", "500G", "1KG", "ছোট পরিবারের জন্য উপযুক্ত", "বড় পরিবার বা উপহারের জন্য পারফেক্ট"]) {
    assert.ok(pageSource.includes(text), `missing: ${text}`);
  }
});

test("bori story, quote, and image slots are present", () => {
  for (const text of ["ঘরোয়া পদ্ধতিতে তৈরি", "বাছাই করা মাষকলাইয়ের ডাল", "টাটকা চালকুমড়ো", "রোদে শুকানো", "ঐতিহ্যবাহী বাঙালি স্বাদ", "কুমড়ো বড়ির স্বাদ ও রান্নার ধারণা", "— পুষ্টিবিদ মুরাদ পারভেজ"]) {
    assert.ok(pageSource.includes(text), `missing: ${text}`);
  }
  for (const name of ["BORI_PACK_500G_IMAGE", "BORI_PACK_1KG_IMAGE", "BORI_STRIP_IMAGE", "BORI_QUOTE_IMAGE", "BORI_BANNER_IMAGE", "BORI_HERO_FALLBACK_IMAGE"]) {
    assert.ok(pageSource.includes(name), `missing image slot: ${name}`);
  }
});

test("bori order CTAs scroll to checkout", () => {
  assert.ok((pageSource.match(/href="#order" onClick=\{handleOrderClick\}/g) ?? []).length >= 3);
});

test("bori WhatsApp href encodes the exact message", async () => {
  const { BORI_CAMPAIGN_WHATSAPP_HREF } = await import("../features/kalojira-mixed/bori-content.ts");
  assert.equal(BORI_CAMPAIGN_WHATSAPP_HREF, `https://wa.me/8801301636461?text=${encodeURIComponent("হোমমেড কুমড়ো বড়ি | Homemade Pumpkin Bori অর্ডার করতে চাই")}`);
});
