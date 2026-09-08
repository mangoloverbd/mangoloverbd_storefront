import assert from "node:assert/strict";
import test from "node:test";

import {
  createSitemapXml,
  injectProductMeta,
  resolveStorefrontBuildCatalog,
} from "./storefront-seo-artifacts.ts";

const baseHtml = `<!doctype html>
<html><head>
  <title>ম্যাংগো লাভার - Mango Lover</title>
  <meta name="description" content="Default description" />
  <meta property="og:title" content="Default title" />
  <meta property="og:description" content="Default description" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://www.mangolover.com.bd/" />
  <meta property="og:image" content="https://www.mangolover.com.bd/opengraph.jpg" />
  <link rel="canonical" href="https://www.mangolover.com.bd/" />
</head><body></body></html>`;

test("uses an empty successful public catalog as an empty catalog", async () => {
  const result = await resolveStorefrontBuildCatalog({
    storefrontProductsUrl: "https://suite.test/products",
    production: true,
    fetchImpl: async () => new Response(JSON.stringify({ products: [] }), { status: 200 }),
    readFallbackProducts: async () => [{ name: "Old", slug: "old" }],
  });

  assert.deepEqual(result, { products: [], source: "live" });
});

test("fails a production build rather than returning stale product SEO files", async () => {
  await assert.rejects(
    () => resolveStorefrontBuildCatalog({
      storefrontProductsUrl: "https://suite.test/products",
      production: true,
      fetchImpl: async () => new Response("down", { status: 503 }),
      readFallbackProducts: async () => [{ name: "Old", slug: "old" }],
    }),
    /Could not refresh storefront SEO catalog/,
  );
});

test("uses the previous snapshot only outside production", async () => {
  const result = await resolveStorefrontBuildCatalog({
    storefrontProductsUrl: "https://suite.test/products",
    production: false,
    fetchImpl: async () => {
      throw new Error("offline");
    },
    readFallbackProducts: async () => [{ name: "Cached", slug: "cached" }],
  });

  assert.deepEqual(result, {
    products: [{ name: "Cached", slug: "cached" }],
    source: "fallback",
  });
});

test("escapes untrusted product metadata and JSON-LD", () => {
  const html = injectProductMeta(baseHtml, {
    name: "Mango </script><script>bad()</script>",
    slug: "raw mango/2026",
    description: '" onmouseover="bad()',
    image_url: 'https://images.test/x" onerror="bad()',
    price: 1200,
  });

  assert.match(html, /raw%20mango%2F2026/);
  assert.match(html, /\\u003c\/script\\u003e/);
  assert.doesNotMatch(html, /<script>bad\(\)<\/script>/);
  assert.match(html, /&quot; onerror=&quot;bad\(\)/);
  assert.doesNotMatch(html, /"availability"/);
  assert.match(html, /<link[^>]+data-seo="canonical"/);
  assert.match(html, /<script[^>]+data-seo="product"/);
});

test("uses the fixed Open Graph image for an unsafe product image URL", () => {
  const html = injectProductMeta(baseHtml, {
    name: "Mango",
    slug: "mango",
    image_url: "javascript:alert(1)",
  });

  assert.match(html, /https:\/\/www\.mangolover\.com\.bd\/opengraph\.jpg/);
  assert.doesNotMatch(html, /javascript:alert/);
});

test("creates a sitemap only for supplied, unique product slugs", () => {
  const sitemap = createSitemapXml([
    { slug: "active", name: "Active" },
    { slug: "raw mango/2026", name: "Raw Mango" },
    { slug: "active", name: "Duplicate" },
  ]);

  assert.match(sitemap, /\/product\/active/);
  assert.match(sitemap, /\/product\/raw%20mango%2F2026/);
  assert.equal((sitemap.match(/\/product\/active/g) || []).length, 1);
  assert.doesNotMatch(createSitemapXml([]), /\/product\//);
});
