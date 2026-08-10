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
  assert.match(homeSource, /Available in \{product\.sizes\} size/);
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
  assert.match(homeSource, /Jackets/);
  assert.match(homeSource, /Hoodies/);
  assert.match(homeSource, /T-Shirt/);
  assert.match(homeSource, /LAST FEW/);
  assert.match(homeSource, /const whatsNewProducts = \[/);
  assert.match(homeSource, /image: "\/new1\.webp"/);
  assert.match(homeSource, /image: "\/new2\.webp"/);
  assert.match(homeSource, /image: "\/new3\.webp"/);
  assert.match(homeSource, /image: "\/new4\.webp"/);
  assert.match(homeSource, /Quick add \$\{product\.title\} from What's New to cart/);
});

test("styles Latest Drop header like the Just arrived header", () => {
  const latestDropContainer = /Latest Drop Section[\s\S]*?<motion\.div[^>]*className="mx-auto max-w-\[1500px\] px-4 md:px-8 xl:px-12"/.test(homeSource);
  const latestDropHeading = /className="text-\[clamp\(2rem,5vw,2\.6rem\)\] font-bold leading-none tracking-\[-0\.04em\] text-black"[\s\S]*?>\s*Latest\s*<span[\s\S]*?Drop/.test(homeSource);
  const discoverMoreLink = /className="mt-1\.5 shrink-0 border-b-2 border-black pb-1 text-\[11px\] font-medium uppercase tracking-\[0\.2em\] text-black transition-opacity hover:opacity-60 md:mt-2 md:text-base md:tracking-\[0\.24em\]"[\s\S]*?>\s*Discover More/.test(homeSource);

  assert.equal(latestDropContainer, true);
  assert.equal(latestDropHeading, true);
  assert.equal(discoverMoreLink, true);
});

test("quick add button adds Just arrived products to cart without navigating", () => {
  assert.match(homeSource, /import \{ useCart \} from "@\/contexts\/cart-context";/);
  assert.match(homeSource, /const \{ addToCart \} = useCart\(\);/);
  assert.match(homeSource, /function quickAddJustArrived/);
  assert.match(homeSource, /event\.preventDefault\(\);/);
  assert.match(homeSource, /event\.stopPropagation\(\);/);
  assert.match(homeSource, /addToCart\(/);
  assert.match(homeSource, /type="button"/);
  assert.match(homeSource, /aria-label=\{`Quick add \$\{product\.title\} to cart`\}/);
  assert.match(homeSource, /h-10 w-10.*rounded-full.*md:h-12 md:w-12/);
});

test("uses the new public images for Just arrived products", () => {
  const justArrivedSource = homeSource.slice(
    homeSource.indexOf("const justArrivedProducts"),
    homeSource.indexOf("export default function Home"),
  );

  assert.match(justArrivedSource, /title: "Black Blazer Dress",[\s\S]*?image: "\/new1\.webp"/);
  assert.match(justArrivedSource, /title: "Black High Leggings",[\s\S]*?image: "\/new2\.webp"/);
  assert.match(justArrivedSource, /title: "Clean White Trouser",[\s\S]*?image: "\/new3\.webp"/);
  assert.match(justArrivedSource, /title: "Cocoa Brown Trouser",[\s\S]*?image: "\/new4\.webp"/);
});

test("uses the new public hero image", () => {
  assert.match(homeSource, /src="\/hero1\.webp"/);
});

test("renders a full-bleed editorial hero", () => {
  assert.match(homeSource, /className="w-full bg-\[#f6f6f6\] pt-0 pb-0"/);
  assert.match(homeSource, /className="w-full px-0"/);
  assert.match(homeSource, /className="relative min-h-\[640px\] w-full overflow-hidden bg-black md:min-h-\[760px\]"/);
  assert.match(homeSource, /md:items-center md:justify-center md:text-center/);
  assert.match(homeSource, /md:text-base md:tracking-\[0\.36em\]/);
  assert.match(homeSource, /md:text-\[clamp\(4rem,5vw,7rem\)\]/);
  assert.match(homeSource, /md:px-12 md:py-5 md:text-base/);
  assert.match(homeSource, /SS26 STATEMENT PIECES/);
  assert.match(homeSource, /Bold by<br \/>\n\s+<TypingEffect/);
  assert.match(homeSource, /DISCOVER MORE/);
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
