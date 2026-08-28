import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const config = JSON.parse(
  readFileSync(new URL("../vercel.json", import.meta.url), "utf8"),
);

const spaRewrite = config.rewrites.find(
  (rewrite) => rewrite.destination === "/",
);

test("SPA fallback handles app routes without swallowing assets or API requests", () => {
  assert.ok(spaRewrite, "expected an SPA fallback rewrite");

  const matchesFallback = new RegExp(`^${spaRewrite.source}$`);

  for (const route of ["/", "/products", "/booking", "/product/honey"]) {
    assert.equal(matchesFallback.test(route), true, `${route} should reach the SPA`);
  }

  for (const resource of [
    "/assets/index-stale.js",
    "/assets/index-stale.css",
    "/favicon.ico",
    "/api/meta",
  ]) {
    assert.equal(
      matchesFallback.test(resource),
      false,
      `${resource} must not be rewritten to HTML`,
    );
  }
});

test("HTML shell is never stored by browser caches", () => {
  const spaHeaders = config.headers.find(
    (entry) => entry.source === spaRewrite.source,
  );
  const spaCacheControl = spaHeaders?.headers.find(
    (header) => header.key.toLowerCase() === "cache-control",
  )?.value;
  const matchesSpaHeaders = new RegExp(`^${spaHeaders?.source ?? "$a"}$`);

  assert.match(spaCacheControl ?? "", /no-store/);
  for (const route of ["/", "/products", "/booking", "/product/honey"]) {
    assert.equal(matchesSpaHeaders.test(route), true, `${route} must be no-store`);
  }

  const indexHeaders = config.headers.find(
    (entry) => entry.source === "/index.html",
  );
  const indexCacheControl = indexHeaders?.headers.find(
    (header) => header.key.toLowerCase() === "cache-control",
  )?.value;
  assert.match(indexCacheControl ?? "", /no-store/);
});
