# Product Detail Copy Depth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the five regular product-detail pages more informative by expanding copy inside the existing detail tabs without changing any tab labels, order, count, styling, layout, or product behavior.

**Architecture:** Keep the existing slug-keyed `productDetailSections` resolver and `ProductDetailSection` shape. Replace only the existing `body` and `details` strings for Beetroot Powder, Kalojira Mixed, Honey Nut, Chia Seed, and Pure Ghee with longer source-grounded Bangla copy; leave the renderer and fallback resolver unchanged.

**Tech Stack:** React/TypeScript, static content data, Node test runner, Vite production build.

## Global Constraints

- Preserve each product's current tab labels, order, and count exactly.
- Do not modify `client/src/pages/product.tsx`, the tab renderer, styles, pricing, variants, checkout, analytics, or fallback behavior.
- Do not modify `/step/kalojira-mixed` or `client/src/features/kalojira-mixed/`.
- Use natural Bangla, correct OCR/spacing issues, and avoid unsupported medical claims.
- Retain source-provided ingredients, serving guidance, storage instructions, and safety notes.
- Add no new dependencies and keep the content static and slug-keyed.

## Files

- Modify: `client/src/lib/product-details.ts` — expand existing copy only.
- Test: `client/src/lib/product-details.test.ts` — assert tab shape is unchanged and copy is materially more detailed.

### Task 1: Lock the unchanged tab contract with tests

- [ ] **Step 1: Add a failing regression test** asserting the exact current label arrays for all five slugs and that each existing section remains non-empty.
- [ ] **Step 2: Run the focused test and confirm it fails before the content update.**
- [ ] **Step 3: Add copy-depth assertions requiring multiple body/details entries and source phrases for each product.
- [ ] **Step 4: Run the focused test and confirm the expected red failure identifies insufficient current copy.

### Task 2: Expand the existing product copy

- [ ] **Step 1: Replace only the five existing records in `productDetailSections` with longer source-grounded paragraphs and bullets.
- [ ] **Step 2: Keep each record's label array byte-for-byte equivalent to the current label array.
- [ ] **Step 3: Run `node --test client/src/lib/product-details.test.ts` and confirm all content and tab-contract assertions pass.
- [ ] **Step 4: Commit with `feat: deepen regular product detail copy`.

### Task 3: Verify page safety and production output

- [ ] **Step 1: Run the focused recently-viewed regression test alongside the content test.
- [ ] **Step 2: Run `NODE_ENV=production npm run build` and confirm the bundle completes.
- [ ] **Step 3: Run `git diff --check` and verify only the planned content/test files changed.
- [ ] **Step 4: Review the diff to confirm no campaign or UI files changed, then open a PR from the feature branch.
