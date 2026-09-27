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
  for (const name of ["BORI_PACK_500G_IMAGE", "BORI_PACK_1KG_IMAGE", "BORI_STRIP_IMAGE", "BORI_QUOTE_IMAGE", "BORI_HERO_FALLBACK_IMAGE"]) {
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
  for (const name of ["BORI_PACK_500G_IMAGE", "BORI_PACK_1KG_IMAGE", "BORI_STRIP_IMAGE", "BORI_QUOTE_IMAGE", "BORI_HERO_FALLBACK_IMAGE"]) {
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

test("bori cooking timeline replaces the bottom banner", () => {
  for (const text of ["যেভাবে রান্না করবেন", "রান্নার সহজ ধাপগুলো", "হালকা ভেজে নিন", "তরকারিতে দিন", "গরম গরম পরিবেশন করুন", "রান্না শেষ হওয়ার ৫–৭ মিনিট আগে ভাজা বড়ি মাছ বা সবজির ঝোলে দিন।"]) {
    assert.ok(pageSource.includes(text), `missing: ${text}`);
  }
  for (const n of [1, 2, 3]) {
    assert.ok(pageSource.includes(`/bori-cook-step-${n}.webp`), `missing step image ${n}`);
    assert.ok(existsSync(new URL(`../../public/bori-cook-step-${n}.webp`, import.meta.url)), `missing public asset ${n}`);
  }
  assert.doesNotMatch(pageSource, /BORI_BANNER_IMAGE/);
  assert.doesNotMatch(contentSource, /BORI_BANNER_IMAGE/);
  assert.ok(pageSource.indexOf("রান্নার সহজ ধাপগুলো") < pageSource.indexOf('id="order"'), "timeline sits above checkout");
});

test("bori cooking time is 5–7 minutes everywhere on the page", () => {
  assert.doesNotMatch(pageSource, /১৫–২০/);
  assert.ok((pageSource.match(/৫–৭ মিনিট/g) ?? []).length >= 2, "timeline step and quote card");
});

const cookingPathSource = read("../features/kalojira-mixed/bori-cooking-path.tsx");

test("cooking timeline is a winding path on mobile and desktop", () => {
  assert.match(pageSource, /import \{ BoriCookingPath \} from "@\/features\/kalojira-mixed\/bori-cooking-path";/);
  assert.match(pageSource, /<BoriCookingPath steps=\{COOKING_STEPS\} \/>/);
  assert.doesNotMatch(pageSource, /<ol className="relative/, "old desktop list removed");
  assert.match(cookingPathSource, /className="mx-auto max-w-\[480px\] lg:hidden"/);
  assert.match(cookingPathSource, /className="hidden lg:block"/);
  assert.match(cookingPathSource, /const MOBILE_LAYOUT: PathLayout/);
  assert.match(cookingPathSource, /const DESKTOP_LAYOUT: PathLayout/);
  for (const label of ["ভাজুন", "মেশান", "পরিবেশন"]) assert.ok(cookingPathSource.includes(label), `missing label: ${label}`);
  for (const numeral of ["০১", "০২", "০৩"]) assert.ok(cookingPathSource.includes(numeral), `missing numeral: ${numeral}`);
  assert.match(cookingPathSource, /pathLength/);
  assert.match(cookingPathSource, /<textPath/);
});

test("bori quote card uses the nutritionist cutout", () => {
  assert.match(contentSource, /export const BORI_QUOTE_IMAGE = "\/bori-nutritionist\.webp";/);
  assert.ok(existsSync(new URL("../../public/bori-nutritionist.webp", import.meta.url)), "missing nutritionist asset");
  assert.match(pageSource, /aspect-square min-h-0 bg-contain bg-bottom bg-no-repeat md:aspect-auto md:min-h-full/);
});

test("mobile cooking path runs straight into checkout", () => {
  assert.match(cookingPathSource, /viewH: 1040,/);
  assert.match(cookingPathSource, /C 190 925 200 990 195 1040"/);
  assert.match(pageSource, /aria-labelledby="bori-cooking-heading" className="mx-auto max-w-5xl px-5 pb-0 pt-4 md:pt-8 lg:pb-20"/);
});

test("bori mobile header is minimal: logo left, WhatsApp order pill right", () => {
  const header = pageSource.slice(pageSource.indexOf("<header"), pageSource.indexOf("</header>"));
  assert.match(header, /<header className="sticky top-0 z-40 bg-white\/90 backdrop-blur md:border-b md:border-black\/10 md:bg-white\/95">/);
  assert.match(header, /className="flex items-center md:absolute md:left-1\/2 md:-translate-x-1\/2"/);
  assert.match(header, /aria-label="ফোনে অর্ডার করুন" className="hidden min-h-11/);
  assert.match(header, /href=\{BORI_CAMPAIGN_WHATSAPP_HREF\}[^>]*className="inline-flex min-h-10 items-center gap-1\.5 rounded-full bg-\[#25d366\][^"]*md:hidden"/);
  assert.match(header, /<WhatsAppBrandIcon className="size-4" \/>অর্ডার করুন<\/a>/);
  assert.doesNotMatch(header, /shadow-/);
  assert.match(header, /href=\{BORI_CAMPAIGN_WHATSAPP_HREF\}[^>]*className="hidden min-h-11 min-w-11 items-center justify-center gap-2 rounded-\[4px\] border border-\[#25d366\]\/50[^"]*md:inline-flex"/);
});
