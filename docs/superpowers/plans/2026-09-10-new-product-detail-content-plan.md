# New Product Detail Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task with review checkpoints.

**Goal:** Add concise, source-grounded Bengali detail tabs for the seven products added on September 10, 2026.

**Architecture:** Keep the existing `ProductDetailSection` data model and shared `getProductDetailSections(product)` resolver. Add seven slug-keyed records to `client/src/lib/product-details.ts`; the existing product page will render their tabs without UI changes.

**Tech Stack:** React 19, TypeScript, existing Node test runner, existing `ProductDetailSection` content model.

## Global Constraints

- Use the seven DOCX files in `~/Downloads/untitled folder 9` as the source of truth.
- Update only regular product-detail content for `sugarcane-juice-powder`, `amsotto-pickle`, `lachcha-semai`, `litchi-flower-honey`, `mustard-oil`, `seed-nut-mix`, and `seed-mixed`.
- Keep the existing tab UI, product layout, pricing, variants, checkout, analytics, and fallback resolver unchanged.
- Summarize the source material into natural Bengali and correct spelling, grammar, punctuation, and spacing artifacts.
- Phrase nutrition effects as possible support, never as guaranteed treatment or cure.
- Do not invent ingredients, dosage claims, medical claims, certifications, or sourcing claims.

---

### Task 1: Add failing regression coverage for the seven new products

**Files:**
- Modify: `client/src/lib/product-details.test.ts`
- Read: `client/src/lib/product-details.ts`

**Interfaces:**
- Consumes: `getProductDetailSections(product)` and `StorefrontProduct`.
- Produces: tests proving each new slug resolves to curated multi-tab content with source-specific phrases.

- [ ] **Step 1: Add the seven cases to the existing test table**

Add cases with expected labels and source phrases:

```ts
{
  slug: "sugarcane-juice-powder",
  labels: ["বিবরণ", "উপাদানসমূহ", "সম্ভাব্য উপকারিতা", "খাওয়ার সময় ও নিয়ম", "কেন ম্যাংগো লাভারের?", "সংরক্ষণের নিয়ম"],
  expected: ["আখের রস", "কার্বোহাইড্রেট", "পানিতে"],
  minimumCharacters: 1400,
},
{
  slug: "amsotto-pickle",
  labels: ["বিবরণ", "উপাদানসমূহ", "খাওয়ার উপকারিতা", "খাওয়ার সময় ও নিয়ম", "কেন ম্যাংগো লাভারের?", "সংরক্ষণের নিয়ম"],
  expected: ["পাকা আম", "আখের গুড়", "মিষ্টি-টক"],
  minimumCharacters: 1700,
},
{
  slug: "lachcha-semai",
  labels: ["বিবরণ", "উপাদানসমূহ", "খাওয়ার উপকারিতা", "খাওয়ার সময় ও নিয়ম", "কেন ম্যাংগো লাভারের?", "সংরক্ষণের নিয়ম"],
  expected: ["ময়দা", "ঘি", "মিষ্টান্ন"],
  minimumCharacters: 1700,
},
{
  slug: "litchi-flower-honey",
  labels: ["বিবরণ", "উপাদানসমূহ", "সম্ভাব্য উপকারিতা", "খাওয়ার সময় ও নিয়ম", "কেন ম্যাংগো লাভারের?", "সংরক্ষণের নিয়ম"],
  expected: ["লিচু ফুলের মধু", "প্রাকৃতিক কার্বোহাইড্রেট", "দানা"],
  minimumCharacters: 1600,
},
{
  slug: "mustard-oil",
  labels: ["বিবরণ", "উপাদানসমূহ", "খাওয়ার সম্ভাব্য উপকারিতা", "ব্যবহারের নিয়ম", "কেন ম্যাংগো লাভারের?", "সংরক্ষণের নিয়ম"],
  expected: ["সরিষার বীজ", "অসম্পৃক্ত ফ্যাটি অ্যাসিড", "কাঠের ঘানি"],
  minimumCharacters: 1800,
},
{
  slug: "seed-nut-mix",
  labels: ["বিবরণ", "উপাদানসমূহ", "খাওয়ার সম্ভাব্য উপকারিতা", "খাওয়ার সময় ও নিয়ম", "কেন ম্যাংগো লাভারের?", "সংরক্ষণের নিয়ম"],
  expected: ["কুমড়ার বীজ", "প্রোটিন", "কালো কিসমিস"],
  minimumCharacters: 1800,
},
{
  slug: "seed-mixed",
  labels: ["বিবরণ", "উপাদানসমূহ", "খাওয়ার সম্ভাব্য উপকারিতা", "খাওয়ার সময় ও নিয়ম", "কেন আমাদের সিড মিক্স?", "সংরক্ষণের নিয়ম"],
  expected: ["তুলসী বীজ", "ইসবগুলের ভূষি", "চিয়া সিড"],
  minimumCharacters: 1700,
},
```

The existing loop already asserts labels, minimum content size, source phrases, and non-empty tabs.

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --test client/src/lib/product-details.test.ts`

Expected: FAIL because the seven new slugs currently use the minimal fallback.

### Task 2: Add the seven curated content records

**Files:**
- Modify: `client/src/lib/product-details.ts`

**Interfaces:**
- Consumes: existing `ProductDetailSection` type and product slug resolver.
- Produces: detailed tab arrays for the seven new product slugs.

- [ ] **Step 1: Add source-grounded sections for each slug**

Add six sections per product using the labels and source phrases from Task 1. Include the document’s ingredients, practical uses, storage guidance, and concise brand-quality explanation. Use `details` for lists such as ingredients, usage occasions, and storage rules; use `body` for the summarized descriptions and context.

For honey, pickle, semai, and seed products, keep benefit wording moderate and food-focused. For the mustard oil, describe culinary use and fats without implying a medical outcome. For sugarcane powder, describe it as a convenient drink mix and avoid claiming it is equivalent to fresh juice beyond the supplied flavor/use description.

- [ ] **Step 2: Run the focused content test**

Run: `node --test client/src/lib/product-details.test.ts`

Expected: PASS for all existing and new product cases, including the unchanged fallback test.

### Task 3: Verify product-page integration and scope

**Files:**
- Verify: `client/src/lib/product-details.ts`, `client/src/lib/product-details.test.ts`, `client/src/pages/product.tsx`
- Verify unchanged: `client/src/pages/kalojira-mixed.tsx`, `client/src/features/kalojira-mixed/`

- [ ] **Step 1: Run focused product tests**

Run:

```bash
node --test \
  client/src/lib/product-details.test.ts \
  client/src/pages/product.test.ts
```

Expected: all tests pass, including the existing `বিস্তারিত / বৈশিষ্ট্য` tab styling contract.

- [ ] **Step 2: Run the production build**

Run: `NODE_ENV=production npm run build`

Expected: build exits successfully. If the build refreshes the generated catalog snapshot, do not include that generated change unless it is unrelated to this content update; restore only generated changes caused by verification.

- [ ] **Step 3: Check the final diff**

Run: `git diff --check && git status --short --branch`

Expected: no whitespace errors, and only the planned content, tests, and planning documentation are changed.
