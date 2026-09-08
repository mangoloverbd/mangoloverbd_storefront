# Product Detail Bullet Alignment and Honey Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stabilize detail-list marker alignment on every regular product page and deepen the existing tabs for the two honey products shown in the supplied screenshot.

**Architecture:** Keep `ProductDetailSection` and `getProductDetailSections()` unchanged. Update only the existing two honey records in `client/src/lib/product-details.ts`, and change the list-item markup in `client/src/pages/product.tsx` from a flex row to a fixed marker/text grid. No new UI component or dependency is needed.

**Tech Stack:** React, TypeScript, Tailwind CSS, Node test runner, Vite.

## Global Constraints

- Keep every existing detail-tab label, order, count, typography, color, spacing, and interaction behavior unchanged.
- The replacement marker must remain aligned when Bengali detail text wraps to multiple lines.
- Use a small gold diamond marker instead of the current round dot.
- Expand only copy for `sundarbans-natural-honey` and `black-seed-flower-honey`.
- Do not modify pricing, variants, checkout, analytics, fallback behavior, `/step/kalojira-mixed`, or `client/src/features/kalojira-mixed/`.
- Avoid unsupported medical claims and preserve ingredient, serving, storage, and safety guidance.

## Files

- Modify: `client/src/pages/product.tsx` — replace the unstable detail bullet markup with a fixed marker/text layout.
- Modify: `client/src/lib/product-details.ts` — expand existing copy for the two honey products without changing labels.
- Modify: `client/src/lib/product-details.test.ts` — lock the two honey tab contracts and content depth.
- Modify: `client/src/pages/product.test.ts` — assert the product renderer contains the stable marker classes and no old round-dot class.
- Create: `docs/superpowers/specs/2026-09-08-product-detail-bullets-and-honey-content-design.md` — approved design record.

### Task 1: Add failing tests for scope and marker behavior

- [ ] **Step 1: Extend `product-details.test.ts` with exact label arrays for both honey slugs and source phrases covering their ingredients, benefits, usage, and storage guidance.**
- [ ] **Step 2: Add a renderer-source test in `product.test.ts` that requires the fixed marker layout classes (`grid-cols-[...]`, `items-start`, and a rotated gold marker) and rejects the old `h-1 w-1 ... rounded-full` marker.**
- [ ] **Step 3: Run the focused tests and confirm the new assertions fail against the current implementation.**

### Task 2: Implement the fixed marker layout

- [ ] **Step 1: Change only the detail-list `<ul>` and `<li>` markup in `client/src/pages/product.tsx`.**
- [ ] **Step 2: Use a centered, constrained list whose items have a fixed marker column and flexible text column; align the diamond near the first text line with `items-start` and a top margin.**
- [ ] **Step 3: Run the renderer and content tests and confirm they pass.**

### Task 3: Expand the existing honey content

- [ ] **Step 1: Expand the current `বিবরণ`, `উপাদানসমূহ`, `সম্ভাব্য উপকারিতা`, `কেন ম্যাংগো লাভারের?`, and `সংরক্ষণের নিয়ম` strings for both honey slugs.**
- [ ] **Step 2: Keep each existing label array exactly unchanged and do not add a new tab.**
- [ ] **Step 3: Run the focused content and Recently Viewed regression tests.**
- [ ] **Step 4: Commit with `fix: align product detail markers and deepen honey copy`.**

### Task 4: Verify and ship

- [ ] **Step 1: Run `NODE_ENV=production npm run build` and restore any generated catalog file changed by the build.**
- [ ] **Step 2: Run `git diff --check` and confirm only the planned files changed.**
- [ ] **Step 3: Review the diff to confirm no campaign or unrelated behavior files changed.**
- [ ] **Step 4: Push the feature branch, open a PR against `main`, wait for Vercel, and merge through the PR.**
