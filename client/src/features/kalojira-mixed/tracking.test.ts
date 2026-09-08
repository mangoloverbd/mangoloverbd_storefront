import assert from "node:assert/strict";
import { test } from "node:test";
import type { GoogleAnalyticsWindow } from "../../lib/google-analytics.ts";
import { markKalojiraPurchaseTracked, trackKalojiraCampaignEvent } from "./tracking.ts";

test("Kalojira events attach the campaign without customer data", () => {
  const calls: unknown[][] = [];
  const target: GoogleAnalyticsWindow = {
    dataLayer: [],
    gtag: (...args: unknown[]) => calls.push(args),
  };
  const payload = trackKalojiraCampaignEvent("landing_cta_click", { placement: "hero", phone: "01712345678" }, target);
  assert.deepEqual(payload, { event: "landing_cta_click", campaign: "kalojira_mixed", placement: "hero" });
  assert.deepEqual(calls, [["event", "landing_cta_click", { campaign: "kalojira_mixed", placement: "hero" }]]);
});

test("purchase markers allow one event per order reference", () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) };
  assert.equal(markKalojiraPurchaseTracked(storage, "ORD-123"), true);
  assert.equal(markKalojiraPurchaseTracked(storage, "ORD-123"), false);
});
