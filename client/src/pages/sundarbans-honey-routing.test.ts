import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const app = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
const landingPage = readFileSync(new URL("./sundarbans-honey.tsx", import.meta.url), "utf8");
const thankYouPage = readFileSync(new URL("./sundarbans-honey-thank-you.tsx", import.meta.url), "utf8");
const staticServer = readFileSync(new URL("../../../server/static.ts", import.meta.url), "utf8");
const vercelConfig = JSON.parse(
  readFileSync(new URL("../../../vercel.json", import.meta.url), "utf8"),
) as {
  headers?: Array<{
    source: string;
    headers: Array<{ key: string; value: string }>;
  }>;
};

test("registers the isolated campaign routes in specific-first order", () => {
  const thankYouRoute = app.indexOf('path="/step/sundarbans-natural-honey/thank-you"');
  const landingRoute = app.indexOf('path="/step/sundarbans-natural-honey"');

  assert.ok(thankYouRoute >= 0, "thank-you campaign route should exist");
  assert.ok(landingRoute >= 0, "landing campaign route should exist");
  assert.ok(thankYouRoute < landingRoute, "thank-you route should precede landing route");
  assert.doesNotMatch(
    app.slice(thankYouRoute, app.indexOf("</Route>", landingRoute) + "</Route>".length),
    /<Layout\b/,
    "campaign routes should not use the storefront Layout",
  );
  assert.match(landingPage, /<main\b/);
  assert.match(thankYouPage, /<main\b/);
  assert.doesNotMatch(landingPage, /\bLayout\b/);
  assert.doesNotMatch(thankYouPage, /\bLayout\b/);
});

test("suppresses Meta initialization and PageView tracking on campaign paths", () => {
  assert.match(app, /isGoogleOnlyCampaignPath\(location\)/);
  assert.match(app, /if \(!googleOnlyCampaign\) \{\s*initMetaPixel\(\);\s*\}/);
  assert.match(
    app,
    /if \(!googleOnlyCampaign\) \{\s*trackMetaEvent\(\{ eventName: "PageView", eventId: createEventId\(\), capi: true \}\);\s*\}/,
  );
});

test("sets and restores campaign-specific title and robots metadata", () => {
  for (const page of [landingPage, thankYouPage]) {
    assert.match(page, /const previousTitle = document\.title/);
    assert.match(page, /document\.title = PAGE_TITLE/);
    assert.match(page, /robots\.content = "noindex, nofollow"/);
    assert.match(page, /document\.title = previousTitle/);
    assert.match(page, /robots\.content = previousRobotsContent/);
  }

  assert.match(landingPage, /সুন্দরবনের প্রাকৃতিক মধু \| ম্যাংগো লাভার/);
  assert.match(thankYouPage, /অর্ডারের জন্য ধন্যবাদ \| ম্যাংগো লাভার/);
});

test("sets noindex headers for campaign paths on both hosts", () => {
  assert.match(
    staticServer,
    /req\.path === "\/step" \|\| req\.path\.startsWith\("\/step\/"\)/,
  );
  assert.match(staticServer, /res\.setHeader\("X-Robots-Tag", "noindex, nofollow"\)/);

  assert.deepEqual(vercelConfig.headers?.[0], {
    source: "/step/(.*)",
    headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
  });
});
