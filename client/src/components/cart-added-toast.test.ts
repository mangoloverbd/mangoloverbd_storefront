import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const toastPath = new URL("./cart-added-toast.tsx", import.meta.url);
const toastSource = existsSync(toastPath) ? readFileSync(toastPath, "utf8") : "";
const cssSource = readFileSync(new URL("../index.css", import.meta.url), "utf8");

test("the toast floats above the mobile dock with an explicit offset", () => {
  // Placement lives in plain CSS, not a Tailwind arbitrary class, so it
  // cannot be purged and the toast can never drop into page flow. 96px
  // clears the 76px mobile dock (bottom-3 + h-16) with a 20px gap.
  assert.match(toastSource, /className="cart-added-toast fixed/);
  assert.match(cssSource, /\.cart-added-toast \{\n\s+bottom: calc\(env\(safe-area-inset-bottom\) \+ 96px\);/);
  assert.match(cssSource, /@media \(min-width: 768px\) \{\n\s+\.cart-added-toast \{\n\s+bottom: 1\.5rem;/);
  assert.doesNotMatch(toastSource, /bottom-\[calc/);
});
test("the toast announces the addition without blocking the page", () => {
  assert.match(toastSource, /role="status"/);
  assert.match(toastSource, /aria-live="polite"/);
  assert.match(toastSource, /<AnimatePresence>/);
  assert.match(toastSource, /NOTICE_DURATION_MS = 3500/);
  assert.doesNotMatch(toastSource, /fixed inset-0/);
  // Pure black capsule, no blur: maximum contrast behind white text.
  assert.match(toastSource, /rounded-full bg-black py-2/);
  assert.doesNotMatch(toastSource, /bg-black\//);
  assert.doesNotMatch(toastSource, /backdrop-blur-md/);
  assert.doesNotMatch(toastSource, /rounded-full bg-\[#163B33\]/);
});

test("viewing the cart opens the existing drawer and skips the dock handoff", () => {
  assert.match(toastSource, /dismissNotice\(\);\n\s+setIsOpen\(true\)/);
  assert.match(toastSource, /if \(window\.innerWidth < 768\) signalCartPulse\(\);/);
});

test("hover and keyboard focus pause the dismissal timer", () => {
  assert.match(toastSource, /onMouseEnter=\{\(\) => setPaused\(true\)\}/);
  assert.match(toastSource, /onMouseLeave=\{\(\) => setPaused\(false\)\}/);
  assert.match(toastSource, /onFocus=\{\(\) => setPaused\(true\)\}/);
  assert.match(toastSource, /onBlur=\{\(\) => setPaused\(false\)\}/);
  assert.match(toastSource, /remaining\.current -= Date\.now\(\) - startedAt\.current/);
});

test("reduced-motion shoppers get an opacity-only toast", () => {
  assert.match(toastSource, /useReducedMotion/);
  assert.match(toastSource, /reduceMotion \? \{ opacity: 0 \}/);
});

test("the toast progress and dock pulse animations exist and honor reduced motion", () => {
  assert.match(cssSource, /@keyframes cart-toast-progress/);
  assert.match(cssSource, /@keyframes cart-dock-pulse/);
  assert.match(cssSource, /prefers-reduced-motion: reduce/);
});
