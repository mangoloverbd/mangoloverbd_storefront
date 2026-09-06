import assert from "node:assert/strict";
import { test } from "node:test";
import type { GoogleAnalyticsWindow } from "../../lib/google-analytics.ts";
import { markPurchaseTracked, trackHoneyCampaignEvent } from "./tracking.ts";

function createMemoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
  };
}

test("honey campaign events attach the fixed campaign without PII", () => {
  const gtagCalls: unknown[][] = [];
  const target: GoogleAnalyticsWindow = {
    dataLayer: [],
    gtag: (...args: unknown[]) => gtagCalls.push(args),
  };
  const untrustedParameters = {
    placement: "hero",
    customerName: "Private Name",
    phone: "01712345678",
    streetAddress: "Private street",
    district: "Dhaka",
    upazila: "Savar",
  };
  const payload = trackHoneyCampaignEvent("landing_cta_click", untrustedParameters, target);

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

test("purchase markers allow one event per order reference in a session", () => {
  const storage = createMemoryStorage();
  assert.equal(markPurchaseTracked(storage, "MLB-123"), true);
  assert.equal(markPurchaseTracked(storage, "MLB-123"), false);
  assert.equal(markPurchaseTracked(storage, "MLB-124"), true);
});
