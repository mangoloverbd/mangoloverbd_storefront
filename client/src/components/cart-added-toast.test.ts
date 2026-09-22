import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const toastPath = new URL("./cart-added-toast.tsx", import.meta.url);
const toastSource = existsSync(toastPath) ? readFileSync(toastPath, "utf8") : "";
const cssSource = readFileSync(new URL("../index.css", import.meta.url), "utf8");

test("the toast announces the addition without blocking the page", () => {
  assert.match(toastSource, /role="status"/);
  assert.match(toastSource, /aria-live="polite"/);
  assert.match(toastSource, /<AnimatePresence>/);
  assert.match(toastSource, /NOTICE_DURATION_MS = 3500/);
  assert.doesNotMatch(toastSource, /fixed inset-0/);
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
