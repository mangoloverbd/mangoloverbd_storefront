# Product Thumbnail Priority Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the visible mobile product-gallery thumbnail stack begin loading immediately without changing the already-fast primary image or eagerly loading lower desktop gallery content.

**Architecture:** Keep the existing Supabase responsive 320/640/960 image pipeline. Change only the 56 px mobile thumbnail images from browser-deferred lazy loading to eager discovery while retaining asynchronous decoding, responsive `srcSet`, and the existing main-image preload.

**Tech Stack:** React 19, TypeScript, Vite, Node test runner, Supabase Storage.

## Global Constraints

- Keep Supabase as the only product-image store.
- Preserve the main product image behavior.
- Keep desktop gallery images lazy because they are below the fold.
- Keep thumbnail `srcSet` and `sizes="56px"` so the browser selects the 320 px WebP candidate.
- Do not change database, API, upload, or cache behavior.
- Do not modify the unrelated pre-existing typography test failure.

---

### Task 1: Prioritize the visible thumbnail stack

**Files:**
- Modify: `client/src/pages/product.test.ts`
- Modify: `client/src/pages/product.tsx`

**Interfaces:**
- Consumes: the existing `srcSetFor[url]` map and mobile thumbnail markup.
- Produces: eagerly discovered, asynchronously decoded 56 px thumbnail images.

- [x] **Step 1: Add a failing source-contract test**

Add a test that isolates the mobile thumbnail stack and asserts that it contains `loading="eager"`, `decoding="async"`, and `sizes={srcSetFor[url] ? "56px" : undefined}` while the desktop gallery still contains `loading="lazy"`.

- [x] **Step 2: Run the focused test and confirm RED**

Run:

```bash
npx tsx --test --test-name-pattern="loads visible product thumbnails eagerly" client/src/pages/product.test.ts
```

Expected: FAIL because the mobile thumbnails currently use `loading="lazy"`.

- [x] **Step 3: Implement the minimal loading change**

Change only the thumbnail image's `loading` value from `lazy` to `eager`. Retain `decoding="async"`, `srcSet`, `sizes`, dimensions, classes, and all main/desktop gallery behavior.

- [x] **Step 4: Run focused verification and confirm GREEN**

Run:

```bash
npx tsx --test --test-name-pattern="loads visible product thumbnails eagerly" client/src/pages/product.test.ts
npm run check
npm run build
```

Expected: focused test passes, TypeScript passes, and the production build succeeds. The known unrelated typography assertion may still fail when the complete `product.test.ts` file is run without filtering.

- [x] **Step 5: Inspect the diff**

Run:

```bash
git diff --check
git diff -- client/src/pages/product.tsx client/src/pages/product.test.ts docs/superpowers/plans/2026-09-22-product-thumbnail-priority.md
```

Expected: only the thumbnail loading contract, implementation, and this plan are changed.
