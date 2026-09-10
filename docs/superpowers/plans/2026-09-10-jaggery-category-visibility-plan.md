# Jaggery Category Visibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `Jaggery-গুড়` visible with Granulated Sugarcane Jaggery and Sugarcane Juice Powder.

**Architecture:** Update the existing `FEATURED_COLLECTIONS` slug assignments. The existing `getVisibleFeaturedCollections()` helper will render Jaggery automatically when the catalog contains either assigned product. Extend the current unit tests to protect the one-category-per-product rule and visible category output.

**Tech Stack:** TypeScript, Node test runner, existing Featured Collection helpers.

## Global Constraints

- Assign `sugarcane-juice-powder` and `granulated-sugarcane-jaggery` to `jaggery`.
- Remove `sugarcane-juice-powder` from `homemade`.
- Keep the `jaggery` slug, label, image, and visibility helper unchanged.
- Do not modify product data, homepage layout, API, or checkout behavior.

---

### Task 1: Add failing assignment and visibility coverage

**Files:** `client/src/lib/featured-collections.test.ts`

- [ ] Add assertions that Jaggery contains both sugarcane product slugs and Homemade does not contain `sugarcane-juice-powder`.
- [ ] Update the visible-collection fixture to include both sugarcane products and assert `jaggery` is returned.
- [ ] Run `npx tsx --test client/src/lib/featured-collections.test.ts` and confirm the new assertions fail before implementation.

### Task 2: Move the products to Jaggery

**Files:** `client/src/lib/featured-collections.ts`

- [ ] Remove `sugarcane-juice-powder` from Homemade.
- [ ] Set Jaggery’s `productSlugs` to `["sugarcane-juice-powder", "granulated-sugarcane-jaggery"]`.
- [ ] Run the featured-collection tests and confirm they pass.

### Task 3: Verify the change

**Files:** `client/src/lib/featured-collections.ts`, `client/src/lib/featured-collections.test.ts`

- [ ] Run `npm run check`.
- [ ] Run `NODE_ENV=production npm run build`.
- [ ] Run `git diff --check` and confirm unrelated working-tree changes remain untouched.
