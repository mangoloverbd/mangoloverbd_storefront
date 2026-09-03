import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const homeSource = readFileSync(new URL("./home.tsx", import.meta.url), "utf8");

test("renders a Just arrived section after Latest Drop", () => {
  const latestDropIndex = homeSource.indexOf("Latest <span");
  const justArrivedIndex = homeSource.indexOf("Just <span");

  assert.notEqual(latestDropIndex, -1);
  assert.notEqual(justArrivedIndex, -1);
  assert.ok(justArrivedIndex > latestDropIndex);
  assert.match(homeSource, /VIEW ALL/);
  assert.match(homeSource, /text-\[clamp\(2rem,5vw,2\.6rem\)\]/);
  assert.match(homeSource, /flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden \[touch-action:pan-x_pan-y\] overscroll-x-contain md:grid md:grid-cols-4 md:gap-4 md:overflow-visible/);
});

test("renders a What's New section after the hero", () => {
  const heroIndex = homeSource.indexOf("Hero Section");
  const whatsNewIndex = homeSource.indexOf("What's New Section");
  const latestDropIndex = homeSource.indexOf("Latest Drop Section");

  assert.notEqual(heroIndex, -1);
  assert.notEqual(whatsNewIndex, -1);
  assert.notEqual(latestDropIndex, -1);
  assert.ok(whatsNewIndex > heroIndex);
  assert.ok(whatsNewIndex < latestDropIndex);
  assert.match(homeSource, /WHAT'S NEW/);
});

test("uses the English Featured Categories heading", () => {
  assert.match(homeSource, /Featured[\s\S]*Categories/);
  assert.doesNotMatch(homeSource, /আমাদের[\s\S]*ক্যাটাগরিসমূহ/);
  assert.match(homeSource, /className="relative inline-block font-garet font-bold/);
});

test("labels the product section Top Selling Products without a purchase CTA", () => {
  const whatsNewSource = homeSource.slice(
    homeSource.indexOf("What's New Section"),
    homeSource.indexOf("Latest Drop Section"),
  );

  assert.match(whatsNewSource, /TOP SELLING[\s\S]*PRODUCTS/);
  assert.doesNotMatch(whatsNewSource, /এখনই কিনুন/);
  assert.doesNotMatch(whatsNewSource, /বাদাম ও বীজ[\s\S]*তেল ও ঘি[\s\S]*মধু/);
});

test("styles the Top Selling Products heading as a modern food feature", () => {
  const whatsNewSource = homeSource.slice(
    homeSource.indexOf("What's New Section"),
    homeSource.indexOf("Latest Drop Section"),
  );

  assert.match(whatsNewSource, /className="mb-7 flex items-center justify-between/);
  assert.match(whatsNewSource, /TOP SELLING[\s\S]*PRODUCTS/);
  assert.match(whatsNewSource, /text-\[clamp\(1\.5rem,4vw,2\.4rem\)\]/);
  assert.match(whatsNewSource, /className="ml-1 text-\[1\.85rem\] leading-none md:ml-0 md:text-\[inherit\]"/);
  assert.match(whatsNewSource, /View All/);
  assert.match(whatsNewSource, /border-b-2 border-black/);
  assert.doesNotMatch(whatsNewSource, /<svg/);
});

test("styles Latest Drop header like the Just arrived header", () => {
  const latestDropContainer = /Latest Drop Section[\s\S]*?<motion\.div[^>]*className="mx-auto max-w-\[1500px\] px-4 md:px-8 xl:px-12"/.test(homeSource);
  const latestDropHeading = /className="text-\[clamp\(2rem,5vw,2\.6rem\)\] font-bold leading-none tracking-\[-0\.04em\] text-black"[\s\S]*?>\s*Latest\s*<span[\s\S]*?Drop/.test(homeSource);
  const discoverMoreLink = /className="mt-1\.5 shrink-0 border-b-2 border-black pb-1 text-\[11px\] font-medium uppercase tracking-\[0\.2em\] text-black transition-opacity hover:opacity-60 md:mt-2 md:text-base md:tracking-\[0\.24em\]"[\s\S]*?>\s*Discover More/.test(homeSource);

  assert.equal(latestDropContainer, true);
  assert.equal(latestDropHeading, true);
  assert.equal(discoverMoreLink, true);
});

test("loads every homepage product section from the public catalog", () => {
  const whatsNewSource = homeSource.slice(
    homeSource.indexOf("What's New Section"),
    homeSource.indexOf("Latest Drop Section"),
  );
  const latestDropSource = homeSource.slice(
    homeSource.indexOf("Latest Drop Section"),
    homeSource.indexOf("Just Arrived Section"),
  );
  const justArrivedSource = homeSource.slice(
    homeSource.indexOf("Just Arrived Section"),
    homeSource.indexOf("Editorial Section"),
  );
  const specialSource = homeSource.slice(
    homeSource.indexOf("Special Collections Section"),
  );

  assert.match(homeSource, /import \{ useQuery \} from "@tanstack\/react-query";/);
  assert.match(homeSource, /fetchStorefrontProducts,/);
  assert.match(homeSource, /formatProductPriceRange,/);
  assert.match(homeSource, /getProductImage,/);
  assert.match(homeSource, /STOREFRONT_POLL_INTERVAL_MS,/);
  assert.match(homeSource, /data: catalogProducts = \[\]/);
  assert.match(homeSource, /queryKey: \["merchant-suite-products-listing"\],/);
  assert.match(homeSource, /queryFn: fetchStorefrontProducts,/);
  assert.match(homeSource, /refetchInterval: STOREFRONT_POLL_INTERVAL_MS,/);
  assert.doesNotMatch(homeSource, /const whatsNewProducts = \[/);
  assert.doesNotMatch(homeSource, /const justArrivedProducts = \[/);
  assert.doesNotMatch(homeSource, /const specialProducts = \[/);
  assert.match(homeSource, /useCart/);
  assert.match(homeSource, /Add to Cart/);
  assert.match(whatsNewSource, /getProductNumericId\(product\)/);
  assert.match(whatsNewSource, /className="mt-auto w-full border border-black\/15 bg-\[#FBBB14\]/);
  assert.match(whatsNewSource, /const firstVariant = product\.variants\?\.\[0\]/);
  assert.match(whatsNewSource, /compare_at_price/);
  assert.match(whatsNewSource, /Save/);
  assert.match(whatsNewSource, /bg-\[#FBBB14\]\/35/);
  assert.match(whatsNewSource, /className="group flex min-w-0 flex-col"/);
  assert.match(whatsNewSource, /line-clamp-1/);
  assert.match(whatsNewSource, /className="mt-auto w-full border/);
  assert.match(whatsNewSource, /topSellingProducts\.slice\(0, 6\)\.map/);
  assert.match(homeSource, /product\.compare_at_price == null && snapshotProduct\?\.compare_at_price != null/);
  assert.match(latestDropSource, /catalogProducts\.slice\(0, 4\)\.map/);
  assert.match(justArrivedSource, /catalogProducts\.slice\(0, 4\)\.map/);
  assert.match(specialSource, /catalogProducts\.slice\(0, 3\)\.map/);
});

test("uses the generated catalog while the live catalog revalidates", () => {
  assert.match(homeSource, /generatedStorefrontProducts/);
  assert.match(homeSource, /initialData: generatedStorefrontProducts/);
  assert.match(homeSource, /initialDataUpdatedAt: 0/);
});

test("prioritizes the first category images with lightweight thumbnails", () => {
  assert.match(homeSource, /image: "\/categories\/homemade-3-320\.webp"/);
  assert.match(homeSource, /loading=\{index < 4 \? "eager" : "lazy"\}/);
  assert.match(homeSource, /fetchPriority=\{index < 4 \? "high" : "auto"\}/);
});

test("uses the Mango Lover hero poster", () => {
  assert.match(homeSource, /src="\/hero-mango-lover\.webp"/);
  assert.doesNotMatch(homeSource, /hero1\.webp/);
});

test("renders a full-bleed editorial hero", () => {
  assert.match(homeSource, /className="w-full bg-\[#f6f6f6\] pt-0 pb-0"/);
  assert.match(homeSource, /className="w-full px-0"/);
  // Mobile crops ~8% of leaf off the top of the 940x1411 poster and leaves no
  // bare yellow band below it; desktop keeps the uncropped fixed-height hero.
  assert.match(homeSource, /className="relative aspect-\[940\/1298\] w-full overflow-hidden bg-\[#FBBB14\] md:aspect-auto md:min-h-\[760px\]"/);
  // Desktop contains the whole portrait poster so none of its baked-in Bangla
  // type is cropped. Mobile covers instead, anchored to the bottom so the only
  // thing the crop can eat is leaf at the top.
  assert.match(homeSource, /className="h-full w-full object-cover object-bottom md:object-contain md:object-center"/);
  assert.match(homeSource, /pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-end/);
  assert.match(homeSource, /pointer-events-auto inline-flex w-fit/);
  assert.match(homeSource, /md:px-7 md:py-3 md:text-base/);
  assert.match(homeSource, /DISCOVER MORE/);
  assert.doesNotMatch(homeSource, /SS26 STATEMENT PIECES/);
  assert.doesNotMatch(homeSource, /Bold by/);
  assert.doesNotMatch(homeSource, /Shop now/);
  assert.doesNotMatch(homeSource, /Discover New Arrival/);
});

test("uses reveal-style Framer animations on homepage sections", () => {
  assert.match(homeSource, /filter: "blur\(10px\)", transform: "translateY\(20%\)", opacity: 0/);
  assert.match(homeSource, /filter: "blur\(0\)", transform: "translateY\(0\)", opacity: 1/);
  assert.match(homeSource, /useReveal/);
  assert.match(homeSource, /animate=\{[^}]*InView \? "visible" : "hidden"\}/);
  assert.match(homeSource, /staggerChildren/);
});
