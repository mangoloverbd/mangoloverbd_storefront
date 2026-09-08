import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function readSource(path: string) {
  try {
    return readFileSync(new URL(path, import.meta.url), "utf8");
  } catch {
    return "";
  }
}

const pageSource = readSource("./honey-nut.tsx");
const sectionsSource = readSource("../features/honey-nut/documentary-sections.tsx");
const contentSource = readSource("../features/honey-nut/content.ts");
const campaignSource = `${sectionsSource}\n${contentSource}`;

const requiredAssets = [
  "honey-nut-hero-v1.webp",
  "honey-nut-nutrition-flatlay-v1.webp",
  "honey-nut-ingredient-honey-v1.webp",
  "honey-nut-ingredient-almond-v1.webp",
  "honey-nut-ingredient-cashew-v1.webp",
  "honey-nut-ingredient-walnut-v1.webp",
  "honey-nut-ingredient-pistachio-v1.webp",
  "honey-nut-ingredient-thai-almond-v1.webp",
  "honey-nut-ingredient-sunflower-seed-v1.webp",
  "honey-nut-ingredient-black-raisin-v1.webp",
  "honey-nut-ingredient-white-sesame-v1.webp",
  "honey-nut-gallery-open-jar-v1.webp",
  "honey-nut-gallery-spoon-v1.webp",
  "honey-nut-gallery-mix-v1.webp",
  "honey-nut-routine-v1.webp",
  "honey-nut-quality-packaging-v1.webp",
] as const;

const ingredients = ["লিচুফুলের মধু", "কাঠবাদাম", "কাজুবাদাম", "আখরোট", "পেস্তা বাদাম", "থাই বাদাম", "সূর্যমুখী বীজ", "কালো কিসমিস", "সাদা তিল"];

test("Honey Nut campaign uses the live product and inventory APIs", () => {
  assert.match(pageSource, /const slug = "honey-nut"/);
  assert.match(pageSource, /fetchStorefrontProduct\(slug\)/);
  assert.match(pageSource, /fetchStorefrontProductInventory\(slug\)/);
  assert.match(pageSource, /mergeInventory\(productQuery\.data, inventoryQuery\.data\?\.inventory\)/);
  assert.match(pageSource, /id="honey-nut-checkout"/);
});

test("Honey Nut campaign renders all supplied assets and ingredients", () => {
  for (const asset of requiredAssets) {
    assert.match(campaignSource, new RegExp(asset.replaceAll(".", "\\.")), `missing asset: ${asset}`);
  }
  for (const ingredient of ingredients) {
    assert.ok(contentSource.includes(ingredient), `missing ingredient: ${ingredient}`);
  }
  assert.match(sectionsSource, /murad-parvez/);
  assert.match(sectionsSource, /TestimonialsSection/);
});

test("Honey Nut campaign keeps FAQ and CTA interactions accessible", () => {
  assert.match(sectionsSource, /aria-expanded=\{open\}/);
  assert.match(sectionsSource, /aria-controls=\{answerId\}/);
  assert.match(sectionsSource, /prefers-reduced-motion/);
  assert.match(pageSource, /honey-nut-checkout/);
});

test("Honey Nut campaign uses responsible food positioning and guide FAQs", () => {
  assert.match(contentSource, /ওষুধ নয়/);
  assert.match(contentSource, /অ্যালার্জি/);
  assert.match(contentSource, /ঠান্ডা ও শুষ্ক স্থানে/);
  assert.match(contentSource, /১ কেজি/);
});
