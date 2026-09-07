import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildGoogleEcommercePayload,
  parseCurrencyAmount,
  toGoogleAnalyticsItem,
  trackGoogleEcommerceEvent,
  trackGoogleInteractionEvent,
  type GoogleAnalyticsWindow,
  type GoogleEcommerceEventName,
} from "./google-analytics.ts";

test("normalizes storefront items into the merchant team's GA4 item shape", () => {
  assert.deepEqual(
    toGoogleAnalyticsItem({
      id: "mango-himsagar",
      name: "Himsagar Mango",
      variant: "10kg",
      price: 1850,
      quantity: 2,
    }),
    {
      item_id: "mango-himsagar",
      item_name: "Himsagar Mango — 10kg",
      item_brand: "Mango Lover BD",
      item_variant: "10kg",
      price: 1850,
      quantity: 2,
    },
  );
});

test("builds a flat dataLayer event with page metadata", () => {
  const payload = buildGoogleEcommercePayload({
    event: "view_item",
    pageType: "product",
    title: "Himsagar Mango | Mango Lover BD",
    url: "https://mangoloverbd.vercel.app/product/himsagar-mango?utm=1",
    language: "en",
    value: 1850,
    items: [
      toGoogleAnalyticsItem({
        id: "mango-himsagar",
        name: "Himsagar Mango",
        variant: "10kg",
        price: 1850,
        quantity: 1,
      }),
    ],
  });

  assert.deepEqual(payload, {
    event: "view_item",
    page_type: "product",
    page_title: "Himsagar Mango | Mango Lover BD",
    page_url: "https://mangoloverbd.vercel.app/product/himsagar-mango?utm=1",
    page_path: "/product/himsagar-mango",
    page_language: "en",
    logged_in: false,
    customer_id: null,
    currency: "BDT",
    value: 1850,
    items: [
      {
        item_id: "mango-himsagar",
        item_name: "Himsagar Mango — 10kg",
        item_brand: "Mango Lover BD",
        item_variant: "10kg",
        price: 1850,
        quantity: 1,
      },
    ],
  });
});

test("sends one direct GA4 ecommerce event without adding a duplicate dataLayer event", () => {
  const gtagCalls: unknown[][] = [];
  const target: GoogleAnalyticsWindow = {
    dataLayer: [],
    gtag: (...args: unknown[]) => gtagCalls.push(args),
    location: new URL("https://mangoloverbd.vercel.app/checkout"),
    document: { title: "Checkout | Mango Lover BD", documentElement: { lang: "en" } },
  };

  trackGoogleEcommerceEvent(
    "begin_checkout",
    {
      pageType: "checkout",
      value: 1850,
      items: [toGoogleAnalyticsItem({ id: "mango-himsagar", name: "Himsagar Mango", price: 1850 })],
    },
    target,
  );

  assert.deepEqual(target.dataLayer, []);
  assert.deepEqual(gtagCalls, [
    ["event", "begin_checkout", {
      page_type: "checkout",
      page_title: "Checkout | Mango Lover BD",
      page_url: "https://mangoloverbd.vercel.app/checkout",
      page_path: "/checkout",
      page_language: "en",
      logged_in: false,
      customer_id: null,
      currency: "BDT",
      value: 1850,
      items: [
        {
          item_id: "mango-himsagar",
          item_name: "Himsagar Mango",
          item_brand: "Mango Lover BD",
          price: 1850,
          quantity: 1,
        },
      ],
    }],
  ]);
});

test("pushes custom interactions to both dataLayer and direct GA4", () => {
  const gtagCalls: unknown[][] = [];
  const target: GoogleAnalyticsWindow = {
    dataLayer: [],
    gtag: (...args: unknown[]) => gtagCalls.push(args),
  };

  const payload = trackGoogleInteractionEvent("landing_cta_click", {
    campaign: "sundarbans_natural_honey",
    placement: "hero",
  }, target);

  assert.deepEqual(payload, {
    event: "landing_cta_click",
    campaign: "sundarbans_natural_honey",
    placement: "hero",
  });
  assert.deepEqual(target.dataLayer, [payload]);
  assert.deepEqual(gtagCalls, [["event", "landing_cta_click", {
    campaign: "sundarbans_natural_honey",
    placement: "hero",
  }]]);
});

test("uses the GA4 select_item ecommerce shape for a selected live pack", () => {
  const event: GoogleEcommerceEventName = "select_item";
  const target: GoogleAnalyticsWindow = {
    dataLayer: [],
    location: new URL("https://mangoloverbd.vercel.app/step/sundarbans-natural-honey"),
    document: { title: "Sundarbans Honey", documentElement: { lang: "bn" } },
  };

  const payload = trackGoogleEcommerceEvent(event, {
    pageType: "product",
    value: 1600,
    items: [toGoogleAnalyticsItem({
      id: "honey-1kg",
      name: "Sundarbans Natural Honey",
      variant: "1KG",
      price: 1600,
      quantity: 2,
    })],
  }, target);

  assert.deepEqual(payload?.items, [{
    item_id: "honey-1kg",
    item_name: "Sundarbans Natural Honey — 1KG",
    item_brand: "Mango Lover BD",
    item_variant: "1KG",
    price: 1600,
    quantity: 2,
  }]);
  assert.equal(payload?.event, "select_item");
  assert.equal(payload?.value, 1600);
});

test("parses visible taka prices into GA4 numbers", () => {
  assert.equal(parseCurrencyAmount("৳1,850"), 1850);
  assert.equal(parseCurrencyAmount("BDT 1,850.50"), 1850.5);
  assert.equal(parseCurrencyAmount("Select Items"), 0);
});
