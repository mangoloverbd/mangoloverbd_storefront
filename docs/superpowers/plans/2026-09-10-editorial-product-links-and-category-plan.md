# Editorial Product Links and Category Assignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move Honey Nut to Nuts & Seeds and make both homepage editorial CTAs open their intended product pages with bottom-aligned overlay content.

**Architecture:** Update the existing Featured Category definitions in `client/src/lib/featured-collections.ts`. Update only the two existing editorial sections in `client/src/pages/home.tsx`, reusing the existing product route and `Link` component. Extend the existing source-level tests for exact assignments, links, and layout classes.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Framer Motion, Wouter, Node test runner.

## Global Constraints

- Remove `honey-nut` from `Honey-মধু` and add it to `Nuts & Seeds-বাদাম ও বীজ`.
- Link `PURE GHEE` to `/product/pure-ghee`.
- Link `BLACK SEED MIX` to `/product/kalojira-mixed`.
- Move each editorial text group to the bottom of its image.
- Keep existing editorial copy, assets, overlays, and product-card behavior unchanged.
- Do not modify product data, API behavior, campaign routes, or checkout code.

---

### Task 1: Add failing regression tests

**Files:**
- Modify: `client/src/lib/featured-collections.test.ts` if present, otherwise `client/src/pages/home.test.ts`
- Modify: `client/src/pages/home.test.ts`

**Interfaces:**
- Consumes: Featured Category definitions and homepage source.
- Produces: Assertions for Honey Nut assignment, editorial product links, and bottom-aligned content.

- [ ] **Step 1: Add category assignment assertions**

Assert `honey-nut` appears in the `nuts-and-seeds` product slug list and does not appear in the `honey` list.

- [ ] **Step 2: Add editorial link/layout assertions**

Assert the homepage source contains `/product/pure-ghee`, `/product/kalojira-mixed`, and bottom-alignment classes such as `justify-end` for both editorial content wrappers.

- [ ] **Step 3: Run the focused tests and verify they fail**

Run: `node --test client/src/pages/home.test.ts client/src/lib/featured-collections.test.ts`

Expected: the new assertions fail before implementation.

### Task 2: Implement category and editorial changes

**Files:**
- Modify: `client/src/lib/featured-collections.ts`
- Modify: `client/src/pages/home.tsx`

**Interfaces:**
- Consumes: existing category definitions, product routes, and editorial markup.
- Produces: correct category filtering and product-specific editorial links.

- [ ] **Step 1: Move Honey Nut between category definitions**

Delete `"honey-nut"` from the Honey `productSlugs` array and add it to the Nuts & Seeds array.

- [ ] **Step 2: Move Pure Ghee editorial content to the image bottom**

Change only its overlay content wrapper from centered alignment to bottom alignment, preserving its heading, description, CTA, assets, and overlay. Change the CTA href to `/product/pure-ghee`.

- [ ] **Step 3: Move Black Seed Mix editorial content to the image bottom**

Apply the same bottom alignment to its overlay content wrapper and change its CTA href to `/product/kalojira-mixed`, preserving all other markup and copy.

- [ ] **Step 4: Run focused tests and verify they pass**

Run: `node --test client/src/pages/home.test.ts client/src/lib/featured-collections.test.ts`

Expected: all selected tests pass.

### Task 3: Verify the shipped change

**Files:**
- Verify: `client/src/lib/featured-collections.ts`, `client/src/pages/home.tsx`, and related tests.

- [ ] **Step 1: Run TypeScript checking**

Run: `npm run check`

- [ ] **Step 2: Run the production build**

Run: `NODE_ENV=production npm run build`

- [ ] **Step 3: Check whitespace and scope**

Run: `git diff --check && git status --short --branch`

Expected: no whitespace errors; unrelated generated catalog and log changes remain untouched.
