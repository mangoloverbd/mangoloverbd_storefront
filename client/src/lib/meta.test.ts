import assert from "node:assert/strict";
import test from "node:test";
import { isMetaAllowedOnCurrentRoute, trackCapi, trackPixel } from "./meta.ts";

function installBrowser(pathname: string) {
  const fbqCalls: unknown[][] = [];
  const fetchCalls: unknown[][] = [];
  const storage = new Map<string, string>();
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      location: {
        pathname,
        search: "",
        href: `https://shop.test${pathname}`,
      },
      fbq: (...args: unknown[]) => fbqCalls.push(args),
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
      },
    },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { cookie: "" },
  });
  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: async (...args: unknown[]) => {
      fetchCalls.push(args);
      return new Response("{}", { status: 200 });
    },
  });
  return { fbqCalls, fetchCalls };
}

test("campaign landing and thank-you routes suppress direct Pixel and CAPI calls", async () => {
  for (const pathname of ["/step/sundarbans-honey", "/step/sundarbans-honey/", "/step/sundarbans-honey/thank-you"]) {
    const { fbqCalls, fetchCalls } = installBrowser(pathname);
    assert.equal(isMetaAllowedOnCurrentRoute(), false);
    trackPixel("Purchase", { value: 100 });
    await trackCapi("Purchase", { value: 100 });
    assert.equal(fbqCalls.length, 0);
    assert.equal(fetchCalls.length, 0);
  }
});

test("normal storefront routes retain direct Pixel and CAPI behavior", async () => {
  const { fbqCalls, fetchCalls } = installBrowser("/products");
  assert.equal(isMetaAllowedOnCurrentRoute(), true);
  trackPixel("ViewContent", { content_name: "Honey" }, "event-1");
  await trackCapi("ViewContent", { content_name: "Honey" }, "event-1");
  assert.deepEqual(fbqCalls, [["track", "ViewContent", { content_name: "Honey" }, { eventID: "event-1" }]]);
  assert.equal(fetchCalls.length, 1);
  assert.equal(fetchCalls[0][0], "/api/meta");
});
