import assert from "node:assert/strict";
import { test } from "node:test";

import { isMetaInAppBrowser } from "./in-app-browser.ts";

test("detects the Facebook in-app browser", () => {
  assert.equal(isMetaInAppBrowser(
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/22F76 [FBAN/FBIOS;FBAV/512.0.0.44.106;FBBV/736478214]",
  ), true);
  assert.equal(isMetaInAppBrowser(
    "Mozilla/5.0 (Linux; Android 14; SM-A155F Build/UP1A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/138.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/512.0.0.51.109;]",
  ), true);
});

test("detects the Instagram in-app browser", () => {
  assert.equal(isMetaInAppBrowser(
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/22F76 Instagram 390.0.0.28.85 (iPhone15,2; iOS 18_5; en_US)",
  ), true);
});

test("ignores regular mobile browsers", () => {
  assert.equal(isMetaInAppBrowser(
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1",
  ), false);
  assert.equal(isMetaInAppBrowser(
    "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0 Mobile Safari/537.36",
  ), false);
  assert.equal(isMetaInAppBrowser(""), false);
});
