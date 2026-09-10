# Mango Lover Brand Policy Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build bilingual Mango Lover BD information and policy pages and connect every relevant footer link to a real route.

**Architecture:** Store all approved page copy in a typed content module and render it through one shared `SiteInformationPage` component. Register each public route in the existing wouter router and replace footer placeholder anchors with internal route links plus the confirmed contact destinations.

**Tech Stack:** React 19, TypeScript, wouter, Framer Motion, Node’s built-in test runner, Vite.

## Global Constraints

- Every page presents English copy followed by Bengali translation within each section.
- Delivery is ৳100, free over ৳2600, inside Dhaka 1–2 days, outside Dhaka 2–3 days.
- Cash on Delivery is the only current payment method.
- Food returns require a damaged, spoiled, or incorrect item report within 24 hours with unboxing photo/video proof.
- Cancellation is allowed before dispatch only.
- Use Mango Lover BD contact details: Nowhata, Paba, Rajshahi, Bangladesh – 6213; 01301-636461; 01733-670129; mangolover.com.bd@gmail.com.
- Do not modify Merchant Suite, Supabase, APIs, catalog data, or unrelated user changes in `client/src/lib/generated-storefront-products.ts`, `client/src/pages/home.tsx`, `client/src/pages/home.test.ts`, or `storefront-server.log`.

---

## File map

- Create `client/src/lib/site-pages.ts`: typed bilingual page content, route metadata, policy facts, and FAQ entries.
- Create `client/src/pages/site-information.tsx`: shared page renderer with bilingual sections and contact/policy callouts.
- Create `client/src/lib/site-pages.test.ts`: content and confirmed-facts tests.
- Create `client/src/pages/site-information.test.ts`: renderer contract tests.
- Modify `client/src/App.tsx`: register the eleven information routes.
- Modify `client/src/components/layout.tsx`: replace footer placeholder links with real route links and contact links.
- Modify `client/src/components/layout.test.ts`: verify footer routes and absence of placeholder policy links.

### Task 1: Add failing content and routing tests

**Files:**
- Create: `client/src/lib/site-pages.test.ts`
- Create: `client/src/pages/site-information.test.ts`
- Modify: `client/src/components/layout.test.ts`

**Interfaces:**
- Consumes: the planned `SITE_PAGES`, `POLICY_FACTS`, and `SiteInformationPage` exports.
- Produces: regression expectations for all pages, business rules, and footer destinations.

- [ ] **Step 1: Write the failing content tests**

```ts
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
```

- [ ] **Step 2: Write the failing renderer and footer tests**

The renderer test will assert the shared component source uses semantic headings and renders both English and Bengali content. Extend `layout.test.ts` with:

```ts
test("connects footer information and support links to real pages", () => {
  for (const path of [
    "/about-us",
    "/contact-us",
    "/how-to-order",
    "/shipping-policy",
    "/payment-policy",
    "/terms-and-conditions",
    "/privacy-policy",
    "/refund-return-exchange",
    "/cancellation-policy",
    "/faq",
    "/track-order",
  ]) {
    assert.match(layoutSource, new RegExp(path));
  }
  assert.doesNotMatch(layoutSource, /href="#"/);
});
```

- [ ] **Step 3: Run the tests and verify they fail for missing implementation**

Run: `node --import tsx --test client/src/lib/site-pages.test.ts client/src/pages/site-information.test.ts client/src/components/layout.test.ts`

Expected: the new tests fail because the content module, renderer, routes, and footer links do not exist yet.

### Task 2: Implement typed bilingual content and shared renderer

**Files:**
- Create: `client/src/lib/site-pages.ts`
- Create: `client/src/pages/site-information.tsx`

**Interfaces:**
- Produces: `SITE_PAGES`, `POLICY_FACTS`, `SitePage`, and `SiteInformationPage`.

- [ ] **Step 1: Add typed content structures and constants**

Use this shape:

```ts
export type BilingualText = { en: string; bn: string };
export type SitePage = {
  slug: string;
  title: BilingualText;
  intro: BilingualText;
  sections: Array<{ heading: BilingualText; body: BilingualText }>;
};
export const POLICY_FACTS = {
  deliveryCharge: 100,
  freeDeliveryThreshold: 2600,
  dhakaDeliveryDays: "1–2 days",
  outsideDhakaDeliveryDays: "2–3 days",
  paymentMethod: "Cash on Delivery",
} as const;
```

- [ ] **Step 2: Write all eleven brand-specific pages**

Include the approved contact details and operational rules in the relevant pages. Keep policy copy clear and conditional where appropriate; do not claim certifications, legal guarantees, online payment, or a tracking system that does not exist.

- [ ] **Step 3: Implement the shared page renderer**

Render a branded header, one `<h1>`, English and Bengali intro text, each section with `<h2>`/`<h3>`, and contextual contact links. Use the existing warm ivory/gold styling and responsive max-width. Render FAQ sections as normal bilingual sections to keep the first version simple and accessible.

- [ ] **Step 4: Run content and renderer tests**

Run: `node --import tsx --test client/src/lib/site-pages.test.ts client/src/pages/site-information.test.ts`

Expected: all content and renderer tests pass.

### Task 3: Register routes and replace footer placeholders

**Files:**
- Modify: `client/src/App.tsx`
- Modify: `client/src/components/layout.tsx`
- Modify: `client/src/components/layout.test.ts`

**Interfaces:**
- Consumes: `SITE_PAGES` and `SiteInformationPage` from Tasks 1–2.
- Produces: reachable public pages and functional footer navigation.

- [ ] **Step 1: Register all information routes**

Import `SiteInformationPage` and add a wouter route for `/about-us`, `/contact-us`, `/how-to-order`, `/shipping-policy`, `/payment-policy`, `/terms-and-conditions`, `/privacy-policy`, `/refund-return-exchange`, `/cancellation-policy`, `/faq`, and `/track-order`. Pass the matching `SITE_PAGES` entry into the shared renderer.

- [ ] **Step 2: Replace footer Information and Support arrays**

Map each footer item to a `{ label, href }` object and render it with wouter `Link`. Use these destinations:

```ts
const informationLinks = [
  ["About Us", "/about-us"],
  ["Contact", "/contact-us"],
  ["Company Information", "/about-us"],
  ["The Mango Lover Story", "/about-us"],
  ["Terms & Conditions", "/terms-and-conditions"],
  ["Privacy Policy", "/privacy-policy"],
  ["Careers", "/contact-us"],
  ["Refund & Exchange", "/refund-return-exchange"],
] as const;

const supportLinks = [
  ["Help Center", "/faq"],
  ["How to Order", "/how-to-order"],
  ["Order Tracking", "/track-order"],
  ["Payment & Shipping", "/shipping-policy"],
  ["Frequently Asked Questions", "/faq"],
  ["Consumer Policy", "/terms-and-conditions"],
] as const;
```

Keep the existing dynamic Shop category links. Replace the footer `href="#"` entries with working routes.

- [ ] **Step 3: Add real contact destinations**

Use `mailto:mangolover.com.bd@gmail.com`, `tel:+8801301636461`, and `https://wa.me/8801733670129` in the contact page and any new policy callout. Keep existing social links unchanged.

- [ ] **Step 4: Run focused route/footer tests**

Run: `node --import tsx --test client/src/components/layout.test.ts client/src/lib/site-pages.test.ts client/src/pages/site-information.test.ts`

Expected: all selected tests pass.

### Task 4: Verify build and preserve unrelated work

**Files:**
- No additional source changes expected.

- [ ] **Step 1: Run collection and homepage regression tests**

Run: `node --import tsx --test client/src/lib/featured-collections.test.ts client/src/pages/home.test.ts --test-name-pattern='collection|Featured Categories|desktop row'`

Expected: the relevant collection and Featured Categories tests pass; known unrelated homepage assertions are reported if selected by the broad pattern.

- [ ] **Step 2: Run the production build**

Run: `npm run build`

Expected: exit code 0. Because the build regenerates the user-owned catalog snapshot, restore `client/src/lib/generated-storefront-products.ts` from a pre-build backup afterward and verify it remains uncommitted.

- [ ] **Step 3: Check whitespace, diff, and routes**

Run: `git diff --check && git status --short && for path in about-us contact-us how-to-order shipping-policy payment-policy terms-and-conditions privacy-policy refund-return-exchange cancellation-policy faq track-order; do curl -fsS -o /dev/null -w "$path=%{http_code}\\n" "http://localhost:5003/$path"; done`

Expected: no whitespace errors, only intended policy files are committed, pre-existing user changes remain, and each route returns HTTP 200.
