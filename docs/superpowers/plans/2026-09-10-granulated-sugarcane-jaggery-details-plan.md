# Granulated Sugarcane Jaggery Details Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add curated Bengali detail tabs for `granulated-sugarcane-jaggery`.

**Architecture:** Add one product entry to `productDetailSections` in `client/src/lib/product-details.ts`. Extend the existing table-driven test in `client/src/lib/product-details.test.ts` with the new slug, labels, content phrases, and minimum length. No catalog, pricing, image, or checkout changes.

**Tech Stack:** TypeScript, Node test runner, existing `ProductDetailSection` contract.

## Global Constraints

- Use six tabs: `বিবরণ`, `উপাদানসমূহ`, `খাওয়ার সম্ভাব্য উপকারিতা`, `খাওয়ার সময় ও নিয়ম`, `কেন ম্যাংগো লাভারের?`, `সংরক্ষণের নিয়ম`.
- Put paragraphs in `body` and scannable points in `details`.
- Keep health language qualified and food-focused.
- Preserve fallback behavior for uncurated products.

---

### Task 1: Add the failing content contract

**Files:** `client/src/lib/product-details.test.ts`

- [ ] Add a table case for `granulated-sugarcane-jaggery` with the six labels, phrases `আখের রস`, `কার্বোহাইড্রেট`, and `আর্দ্রতা`, and a minimum copy length of 1800 characters.
- [ ] Run `npx tsx --test client/src/lib/product-details.test.ts` and confirm the new case fails because no curated entry exists.

### Task 2: Add the curated product tabs

**Files:** `client/src/lib/product-details.ts`

- [ ] Add the new slug entry with six sections covering the supplied description, ingredient, potential benefits, usage timing, Mango Lover quality story, and storage rules.
- [ ] Include the supplied 100% sugarcane juice ingredient and granular texture/use details without medical guarantees.
- [ ] Run `npx tsx --test client/src/lib/product-details.test.ts` and confirm all cases pass.

### Task 3: Verify the change

**Files:** `client/src/lib/product-details.ts`, `client/src/lib/product-details.test.ts`

- [ ] Run `npm run check`.
- [ ] Run `NODE_ENV=production npm run build`.
- [ ] Run `git diff --check` and confirm unrelated generated catalog/log changes remain untouched.
