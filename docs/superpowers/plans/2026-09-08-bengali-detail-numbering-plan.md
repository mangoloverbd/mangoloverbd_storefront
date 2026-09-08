# Bengali Product Detail Numbering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace product-detail diamond markers with aligned Bengali numerals in the normal body font.

**Architecture:** Keep the existing fixed grid used by `client/src/pages/product.tsx`. Add a small `toBengaliNumeral` helper in the same page file and render each detail index in the fixed marker column. The product content resolver and all tab data remain unchanged.

**Tech Stack:** React, TypeScript, Tailwind CSS, Node test runner, Vite.

## Global Constraints

- Use Bengali numerals `১, ২, ৩…`, restarting at `১` in each tab.
- Use the normal body font, not `IhtishamDeshlipi` or `KaiumSimanto`.
- Keep the current fixed marker/text grid so wrapped text remains aligned.
- Do not change tab labels, content, styling beyond the marker, or interactions.
- Do not modify campaign pages, checkout, pricing, variants, analytics, or fallback behavior.

## Files

- Modify: `client/src/pages/product.tsx` — render Bengali numbers in the existing marker column.
- Modify: `client/src/pages/product.test.ts` — assert Bengali numeral output and removal of the diamond marker.

### Task 1: Add the failing marker regression test

- [ ] **Step 1: Replace the diamond-specific assertions with assertions requiring `toBengaliNumeral`, Bengali numerals, the normal-font class, and no `rotate-45` marker class.**
- [ ] **Step 2: Run the focused marker test and confirm it fails because the current renderer still outputs the diamond.**

### Task 2: Implement Bengali numbering

- [ ] **Step 1: Add `toBengaliNumeral(index: number)` that maps each ASCII digit to its Bengali digit and receives the zero-based detail index.**
- [ ] **Step 2: Replace the diamond `<span>` with a fixed-width number `<span>` using the current body font and gold text color.**
- [ ] **Step 3: Render `toBengaliNumeral(detailIndex + 1)` and keep the detail text in the existing flexible column.**
- [ ] **Step 4: Run the focused marker test, content test, and Recently Viewed regression test.**
- [ ] **Step 5: Commit with `fix: use aligned Bengali detail numbering`.**

### Task 3: Verify and ship

- [ ] **Step 1: Run `NODE_ENV=production npm run build` and restore the generated catalog file if changed.**
- [ ] **Step 2: Run `git diff --check` and confirm only the planned page/test files changed.**
- [ ] **Step 3: Push a PR to `main`, wait for Vercel, and merge through the PR.**
