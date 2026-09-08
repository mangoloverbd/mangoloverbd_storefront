# Curated Product Detail Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task with review checkpoints.

**Goal:** Replace the minimal fallback detail tabs for five regular products with detailed, source-grounded Bangla content while leaving the Kalojira Mixed campaign landing page untouched.

**Architecture:** Keep the existing `ProductDetailSection` model and shared `getProductDetailSections()` resolver. Add five slug-keyed entries to `client/src/lib/product-details.ts`; the existing product-detail UI will render the richer `body` paragraphs and `details` bullet rows without layout or checkout changes.

**Tech Stack:** React 18/19 storefront, TypeScript, Node test runner, existing `ProductDetailSection` data model.

## Global Constraints

- Use the customer-provided product documents and PDFs as the source of truth.
- Update only regular product-detail content for `beetroot-powder`, `kalojira-mixed`, `honey-nut`, `chia-seed`, and `pure-ghee`.
- Leave `/step/kalojira-mixed` and every file under `client/src/features/kalojira-mixed/` unchanged.
- Keep the existing tab UI, product layout, pricing, variants, checkout, analytics, and fallback resolver unchanged.
- Use natural Bangla and correct obvious OCR/spacing artifacts from the PDFs.
- Phrase nutrition effects as possible support, never as guaranteed treatment or cure.
- Do not invent ingredients, dosage claims, medical claims, certifications, or sourcing claims.

---

### Task 1: Add failing coverage for the five curated product records

**Files:**
- Create: `client/src/lib/product-details.test.ts`
- Read: `client/src/lib/product-details.ts`

**Interfaces:**
- Consumes: `getProductDetailSections(product)` and `StorefrontProduct`.
- Produces: regression coverage proving each supplied product resolves to a non-minimal, source-grounded tab set.

- [ ] **Step 1: Write the failing tests**

Create a Node test file that imports `getProductDetailSections` from `./product-details.ts` and checks all five slugs. Assert each product has at least six sections, every section has a non-empty `label`, and every section has either non-empty `body` or non-empty `details`.

Add source-specific assertions so the tests protect the supplied material rather than only counting rows:

```ts
test("curates detailed source content for all five regular products", () => {
  const cases = [
    { slug: "beetroot-powder", expected: ["ডায়েটারি নাইট্রেট", "বীটালেইন", "নিম্ন রক্তচাপ"] },
    { slug: "kalojira-mixed", expected: ["কালোজিরা", "রসুন", "ইরানি জাফরান"] },
    { slug: "honey-nut", expected: ["কাজু বাদাম", "কাঠবাদাম", "মধু"] },
    { slug: "chia-seed", expected: ["ফাইবার", "উদ্ভিজ্জ প্রোটিন", "ওমেগা-৩"] },
    { slug: "pure-ghee", expected: ["দুধ", "মসৃণ টেক্সচার", "রান্না"] },
  ];

  for (const { slug, expected } of cases) {
    const sections = getProductDetailSections({ slug, name: slug });
    const copy = JSON.stringify(sections);
    assert.ok(sections.length >= 6, `${slug} should have detailed tabs`);
    for (const phrase of expected) assert.match(copy, new RegExp(phrase));
    for (const section of sections) {
      assert.ok(section.label);
      assert.ok((section.body?.length ?? 0) + (section.details?.length ?? 0) > 0);
    }
  }
});

test("keeps the existing fallback for an uncurated product", () => {
  const sections = getProductDetailSections({
    slug: "unlisted-product",
    name: "Unlisted",
    description: "Catalog description",
    variants: [{ attributes: { size: "500g" } }],
  });

  assert.deepEqual(sections[0], { label: "বিবরণ", body: ["Catalog description"] });
  assert.deepEqual(sections[1], { label: "Options", details: ["500g"] });
});
```

- [ ] **Step 2: Run the focused test and verify the expected failure**

Run: `node --test client/src/lib/product-details.test.ts`

Expected: FAIL because the five slugs currently use the minimal fallback.

- [ ] **Step 3: Commit the red tests**

```bash
git add client/src/lib/product-details.test.ts
git commit -m "test: require curated product detail content"
```

### Task 2: Add the five source-grounded content records

**Files:**
- Modify: `client/src/lib/product-details.ts`

**Interfaces:**
- Consumes: the existing `ProductDetailSection` type and slug resolver.
- Produces: detailed records for the five regular product slugs.

- [ ] **Step 1: Add Beetroot Powder content**

Add `beetroot-powder` with tabs covering:

- `বিবরণ`: selected beetroot powder, convenient daily food use, natural color, no artificial color/flavour claim only where supplied.
- `পুষ্টি উপাদান`: dietary nitrate, betalain antioxidants, folate/B9, potassium, manganese, iron, vitamin C, plant compounds, and fiber; include the source note that exact amounts vary by processing and serving.
- `সম্ভাব্য উপকারিতা`: possible support for normal blood flow/exercise oxygen use, antioxidant support, normal cell division/red blood cell formation, muscle/fluid balance, and easy daily nutrition.
- `কারা খাদ্যতালিকায় রাখতে পারেন`: students, workers, regular exercisers, athletes, and people seeking an easy beetroot addition.
- `খাওয়ার সময় ও নিয়ম`: ১–২ teaspoons or approximately ৩–৫ grams; water, juice, smoothie, milk, yogurt, oats; source guidance says ২–৩ hours before exercise.
- `গুরুত্বপূর্ণ সতর্কতা`: low blood pressure, oxalate kidney-stone history, pregnancy/breastfeeding consultation, do not exceed the stated amount, temporary pink/red urine or stool, and not a medicine.
- `সংরক্ষণের নিয়ম`: close the pack, store cool/dry and away from direct sunlight.

- [ ] **Step 2: Add Kalojira Mixed content**

Add `kalojira-mixed` with tabs covering the eight supplied ingredients: কালোজিরা, রসুন, বিশুদ্ধ মধু, জয়তুন, কিসমিস, খেজুর, ত্বীন ফল, and ইরানি জাফরান. Include source-grounded descriptions of thymoquinone as a studied bioactive compound, sulfur-containing garlic compounds, natural carbohydrate/energy from honey and dried fruits, monounsaturated fat in olive, dietary fiber, plant compounds, the four nutrition categories, intended food-routine audiences, the nutritionist’s balanced-diet statement, serving guidance from the document, storage, and the explicit “food product, not medicine” framing.

- [ ] **Step 3: Add Honey Nut content**

Add `honey-nut` with tabs covering description, cashew/almond/pistachio/walnut/fig/date/raisin/white sesame/honey ingredients, possible protein/healthy-fat/mineral/antioxidant and natural-carbohydrate support, snack use for busy days and before/after exercise, ways to eat it with breakfast/oats/yogurt/toast/fruit, Mango Lover’s quality-focused selection and packaging explanation, and airtight cool/dry storage.

- [ ] **Step 4: Add Chia Seed content**

Add `chia-seed` with tabs covering 100% chia seed, fiber, plant protein, healthy fat, omega-3 ALA, calcium, magnesium and other minerals, possible digestive/fullness/daily nutrition support, morning and snack serving ideas, soaking guidance and adequate water intake, Mango Lover’s quality/cleanliness/freshness explanation, and dry airtight storage with Best Before guidance.

- [ ] **Step 5: Add Pure Ghee content**

Add `pure-ghee` with tabs covering milk as the ingredient, dairy-fat energy, possible fat-soluble vitamins, aroma/flavour/texture, rice/khichuri/roti/paratha/polao/cooking/sweets usage, moderate balanced-diet framing, Mango Lover’s milk-quality and preparation/packaging explanation, and dry airtight storage away from heat, sunlight, water, and moisture.

- [ ] **Step 6: Run the focused content tests**

Run: `node --test client/src/lib/product-details.test.ts`

Expected: PASS with all five curated records and the unchanged fallback behavior.

- [ ] **Step 7: Commit the content update**

```bash
git add client/src/lib/product-details.ts
git commit -m "feat: expand regular product detail content"
```

### Task 3: Verify scope and product-page integration

**Files:**
- Verify: `client/src/lib/product-details.ts`, `client/src/pages/product.tsx`
- Verify unchanged: `client/src/pages/kalojira-mixed.tsx`, `client/src/features/kalojira-mixed/`

- [ ] **Step 1: Run the content and existing product-page tests**

Run:

```bash
node --test \
  client/src/lib/product-details.test.ts \
  client/src/pages/product.test.ts
```

Expected: all tests pass, including the existing detailed-tab styling and behavior contracts.

- [ ] **Step 2: Confirm the campaign page is untouched**

Run:

```bash
git diff --name-only origin/main...HEAD
```

Expected: only the content test, `product-details.ts`, and documentation files appear; no `client/src/pages/kalojira-mixed.tsx` or `client/src/features/kalojira-mixed/` path appears.

- [ ] **Step 3: Run the production build**

Run: `NODE_ENV=production npm run build`

Expected: build exits successfully. Restore any generated catalog snapshot changes before the final diff review.

- [ ] **Step 4: Check the final diff**

Run: `git diff --check && git status --short --branch`

Expected: no whitespace errors and no generated files left modified.

### Task 4: Prepare the PR

**Files:**
- Verify: all changes from Tasks 1–3

- [ ] **Step 1: Run the final focused suite**

Run:

```bash
node --test \
  client/src/lib/product-details.test.ts \
  client/src/pages/product.test.ts \
  client/src/pages/product-recently-viewed.test.ts
```

Expected: all tests pass.

- [ ] **Step 2: Push the feature branch and open a PR**

Push `feat/curated-product-details` and open a PR targeting `main`. The PR description must state that only regular product-detail tab content changed and the `/step/kalojira-mixed` landing page was intentionally left unchanged.

- [ ] **Step 3: Wait for preview checks before merging**

Run: `gh pr checks <number> --watch --interval 10`

Expected: Vercel preview checks pass before merging through GitHub.
