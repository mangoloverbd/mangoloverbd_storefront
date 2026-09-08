import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const heroSource = readFileSync(fileURLToPath(new URL("./hero.tsx", import.meta.url)), "utf8");
const heroAsset = fileURLToPath(
  new URL("../../public/ChatGPT Image Sep 8, 2026, 02_08_34 PM.webp", import.meta.url),
);

test("uses the supplied hero image without decorative framing", () => {
  assert.equal(existsSync(heroAsset), true);
  assert.match(heroSource, /\/ChatGPT Image Sep 8, 2026, 02_08_34 PM\.webp/);
  assert.doesNotMatch(heroSource, /bg-brand-ivory/);
  assert.doesNotMatch(heroSource, /bg-\[#f6f6f6\]/);
  assert.doesNotMatch(heroSource, /border border-black\/10/);
  assert.doesNotMatch(heroSource, /bg-gradient-to-t/);
});
