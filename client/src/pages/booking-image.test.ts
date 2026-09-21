import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const bookingSource = readFileSync(new URL("./booking.tsx", import.meta.url), "utf8");

test("serves the booking photo as responsive WebP variants", () => {
  assert.match(bookingSource, /booking-studio-640\.webp/);
  assert.match(bookingSource, /booking-studio-1280\.webp/);
  assert.match(bookingSource, /booking-studio-1638\.webp/);
  assert.match(bookingSource, /srcSet=\{`\$\{studioImage640\} 640w, \$\{studioImage1280\} 1280w, \$\{studioImage1638\} 1638w`\}/);
  assert.match(bookingSource, /sizes="\(min-width: 1024px\) 42vw, 100vw"/);
});

test("reserves the photo dimensions and does not bundle the old PNG", () => {
  assert.match(bookingSource, /width=\{1638\}/);
  assert.match(bookingSource, /height=\{2048\}/);
  assert.match(bookingSource, /decoding="async"/);
  assert.doesNotMatch(bookingSource, /image_1768632360954\.png/);
});
