import assert from "node:assert/strict";
import { test } from "node:test";

import { POLICY_FACTS, SITE_PAGES } from "./site-pages";

test("defines every approved bilingual information page", () => {
  assert.deepEqual(Object.keys(SITE_PAGES).sort(), [
    "about-us",
    "cancellation-policy",
    "contact-us",
    "faq",
    "how-to-order",
    "payment-policy",
    "privacy-policy",
    "refund-return-exchange",
    "shipping-policy",
    "terms-and-conditions",
    "track-order",
  ]);

  for (const page of Object.values(SITE_PAGES)) {
    assert.ok(page.title.en);
    assert.ok(page.title.bn);
    assert.ok(page.sections.length > 0);
    for (const section of page.sections) {
      assert.ok(section.heading.en);
      assert.ok(section.heading.bn);
      assert.ok(section.body.en);
      assert.ok(section.body.bn);
    }
  }
});

test("keeps published policy facts aligned with checkout", () => {
  assert.equal(POLICY_FACTS.deliveryCharge, 100);
  assert.equal(POLICY_FACTS.freeDeliveryThreshold, 2600);
  assert.equal(POLICY_FACTS.dhakaDeliveryDays, "1–2 days");
  assert.equal(POLICY_FACTS.outsideDhakaDeliveryDays, "2–3 days");
  assert.equal(POLICY_FACTS.paymentMethod, "Cash on Delivery");
});
