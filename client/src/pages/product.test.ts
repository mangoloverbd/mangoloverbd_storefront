import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const productSource = readFileSync(new URL("./product.tsx", import.meta.url), "utf8");
const indexSource = readFileSync(new URL("../index.css", import.meta.url), "utf8");

test("uses distinct vibrant channel colors for phone and WhatsApp order actions", () => {
  assert.match(
    productSource,
    /href="tel:\+8801301636461"[\s\S]*?bg-\[#f26b4f\][\s\S]*?text-white[\s\S]*?hover:bg-\[#d9573d\]/,
  );
  assert.match(
    productSource,
    /href=\{`https:\/\/wa\.me[\s\S]*?bg-\[#25d366\][\s\S]*?text-white[\s\S]*?hover:bg-\[#1da851\]/,
  );
});

test("keeps channel buttons visually soft rather than heavily bordered or shadowed", () => {
  assert.match(productSource, /border-white\/20[\s\S]*?shadow-none/);
  assert.doesNotMatch(productSource, /shadow-sm|shadow-\[/);
});

test("uses Kaium Simanto for delivery timeline Bengali labels", () => {
  assert.match(productSource, /fontFamily: "'KaiumSimanto', serif"/);
  assert.match(indexSource, /font-family: 'KaiumSimanto'/);
  assert.match(indexSource, /kaium-simanto-unicode\.ttf/);
  assert.match(productSource, /className="h-5 w-5" weight="Filled"/);
  assert.match(productSource, /text-\[11px\] font-normal tracking-\[0\.03em\]/);
  assert.match(productSource, /text-\[14px\] font-normal leading-4/);
  assert.match(productSource, /অর্ডার গ্রহণ/);
  assert.match(productSource, /প্রসেসিং/);
  assert.match(productSource, /ডেলিভারি/);
});

test("uses shared sizing and IhtishamDeshlipi for product detail labels", () => {
  assert.match(productSource, /বিস্তারিত/);
  assert.match(productSource, /বৈশিষ্ট্য/);
  assert.match(productSource, /text-\[19px\] font-normal text-black/);
  assert.match(productSource, /text-\[19px\] font-normal text-black\/65/);
  assert.match(productSource, /fontFamily: "'IhtishamDeshlipi', serif"/);
  assert.match(productSource, /text-\[15px\] transition-colors md:text-\[17px\]/);
});

test("highlights the বৈশিষ্ট্য label with the existing yellow hand-drawn oval", () => {
  assert.match(
    productSource,
    /<span[\s\S]*?className="[^\"]*relative inline-block[^\"]*"[\s\S]*?বৈশিষ্ট্য[\s\S]*?stroke="#FBBB14"/,
  );
});

test("renders product reels as a smooth horizontal snap carousel", () => {
  assert.match(productSource, /const \[reelRef, reelApi\] = useEmblaCarousel/);
  assert.match(productSource, /ref=\{reelRef\}/);
  assert.match(productSource, /align: "center"/);
  assert.match(productSource, /loop: true/);
  assert.match(productSource, /duration: 35/);
  assert.match(productSource, /-mx-4[^"`]*md:mx-0/);
  assert.match(productSource, /gap-0 px-0 md:px-6/);
  assert.match(productSource, /mr-3[^"`]*md:mr-6/);
  assert.match(productSource, /max-w-none md:max-w-\[480px\]/);
  assert.match(productSource, /basis-\[60vw\][^"`]*md:basis-\[240px\]/);
  assert.match(productSource, /REEL_MEDIA = \[/);
  assert.match(productSource, /res\.cloudinary\.com\/n0d6bs08\/video\/upload/);
  assert.match(productSource, /<video/);
  assert.match(productSource, /controls=\{activeReelVideo === i\}/);
  // Only the active slide mounts a <video>, and it never preloads until played, so a
  // mobile drag moves one cheap layer instead of three decoding video layers.
  assert.match(productSource, /\{i === currentReel \? \(\s*<video/);
  assert.match(productSource, /preload="none"/);
  assert.doesNotMatch(productSource, /autoPlay=/);
  assert.match(productSource, /so_1,w_480,f_auto,q_auto/);
  assert.match(productSource, /Play className/);
  assert.match(productSource, /activeReelVideoRef/);
  assert.match(productSource, /src=\{poster\}[\s\S]*?pointer-events-none/);
  assert.match(productSource, /loading="lazy"/);
  assert.doesNotMatch(productSource, /video\.load\(\)/);
  assert.match(productSource, /will-change-transform/);
  assert.match(productSource, /video\.muted = false/);
  assert.doesNotMatch(productSource, /player\.cloudinary\.com\/embed/);
  assert.doesNotMatch(productSource, /pointer-events-none md:pointer-events-auto/);
  assert.match(productSource, /snapsave-app_1C33w5xnV7_hd/);
  assert.match(productSource, /snapsave-app_1700766014578997_hd/);
  assert.doesNotMatch(productSource, /snap-center/);
  assert.match(productSource, /\[touch-action:pan-y_pinch-zoom\]/);
  assert.doesNotMatch(productSource, /scale-\[0\.94\]/);
  assert.match(productSource, /reelApi\.scrollPrev\(\)/);
  assert.match(productSource, /reelApi\.scrollNext\(\)/);
  assert.match(productSource, /reelApi\.on\("pointerDown", pauseReelsDuringDrag\)/);
  assert.doesNotMatch(productSource, /wistia-player/);
});
