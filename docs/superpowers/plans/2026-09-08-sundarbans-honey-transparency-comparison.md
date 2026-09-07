# Sundarbans Honey Transparency Comparison Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the campaign’s article-like “কেন ম্যাংগো লাভার?” point list with a responsive, accessible three-column comparison matrix inspired by the supplied reference.

**Architecture:** Keep the existing `whyMangoLoverPoints` as the single source for the six approved Mango Lover rows. Add a focused `ComparisonMatrix` presentational helper inside `documentary-sections.tsx`; it will render a desktop three-column grid and compact mobile stacked rows, while the existing section owns the heading and live order CTA.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, lucide-react, Node source-level tests.

## Global Constraints

- Use the existing live `whyMangoLoverPoints`; do not hardcode products, prices, stock, or checkout data.
- Keep `স্বচ্ছতার সঙ্গে`, `কেন ম্যাংগো লাভার?`, and `পার্থক্যটা নিজেই দেখুন` unchanged.
- Use a neutral comparison column; do not make unsupported claims about unnamed competitors.
- Preserve the existing `content_bottom` order CTA and `onOrderClick` behavior.
- Keep the warm `#fffdf8` background, campaign palette, and section border.
- Do not change the main storefront footer or other campaign sections.
- Preserve accessible section labeling and avoid horizontal overflow at 390px.

---

### Task 1: Add source-level coverage for the comparison matrix

**Files:**
- Modify: `client/src/pages/sundarbans-honey.test.ts:117-148`
- Test target: `client/src/pages/sundarbans-honey.test.ts`

**Interfaces:**
- Consumes: `sectionsSource` and `contentSource`, already loaded by the test file.
- Produces: Assertions that require a matrix structure, six-point data mapping, neutral comparison copy, and preserved CTA placement.

- [ ] **Step 1: Add a failing matrix assertion test**

Add this test after the existing approved-content test:

```ts
test("why Mango Lover section renders a neutral comparison matrix", () => {
  assert.match(sectionsSource, /honey-comparison-matrix/);
  assert.match(sectionsSource, /ম্যাংগো লাভার/);
  assert.match(sectionsSource, /যা যাচাই করবেন/);
  assert.match(sectionsSource, /whyMangoLoverPoints\\.map/);
  assert.match(sectionsSource, /role="row"/);
  assert.match(sectionsSource, /placement="content_bottom"/);
  assert.match(sectionsSource, /উৎসের তথ্য যাচাই করুন/);
  assert.doesNotMatch(sectionsSource, /অন্যরা জানায় না|অন্যদের নেই|ভেজাল|নিম্নমান/);
});
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run:

```bash
node --test client/src/pages/sundarbans-honey.test.ts
```

Expected: the new test fails because the current section still renders `PointList` and has no matrix headers or neutral prompts.

### Task 2: Implement the responsive comparison matrix

**Files:**
- Modify: `client/src/features/sundarbans-honey/documentary-sections.tsx:73-104,340-343`
- Test: `client/src/pages/sundarbans-honey.test.ts`

**Interfaces:**
- Consumes: `whyMangoLoverPoints: HoneyNarrativePoint[]` and `onOrderClick` from the existing section.
- Produces: `ComparisonMatrix({ points }: { points: HoneyNarrativePoint[] })`, rendered with `id="honey-comparison-matrix"` and explicit row/column labels.

- [ ] **Step 1: Define neutral comparison prompts beside the matrix helper**

Add a six-item constant directly above `ComparisonMatrix`, in the same order as `whyMangoLoverPoints`:

```ts
const comparisonPrompts = [
  "উৎসের তথ্য যাচাই করুন",
  "সংগ্রহের ধাপ জেনে নিন",
  "বোতলজাতের পরিচ্ছন্নতা যাচাই করুন",
  "ব্যবহারের নির্দেশনা দেখুন",
  "ডেলিভারি কভারেজ জেনে নিন",
  "পেমেন্ট পদ্ধতি দেখে নিন",
] as const;
```

- [ ] **Step 2: Implement the matrix rows and headers**

Create `ComparisonMatrix` with a semantic `div role="table"` wrapper. Render one `role="row"` header with `role="columnheader"` cells for `বিষয়`, `ম্যাংগো লাভার`, and `যা যাচাই করবেন`; map each point to one `role="row"` containing a topic cell, a highlighted Mango Lover cell with an aria-hidden check marker and the complete `point.text`, and a quieter neutral cell using `comparisonPrompts[index]`.

Use these Tailwind behaviors:

- Wrapper: `id="honey-comparison-matrix"`, `role="table"`, `overflow-hidden`, rounded border, and no shadow.
- Desktop: header and rows use `md:grid-cols-[minmax(9rem,0.8fr)_minmax(0,1.5fr)_minmax(9rem,0.9fr)]`.
- Brand column: pale green background (`#e8f5ed`), forest-green text, and honey-yellow check marker.
- Neutral column: muted cream/white background and subdued text.
- Mobile: each row uses `grid-cols-1`, then the Mango Lover and neutral cells switch to `grid-cols-2`; the topic spans both columns.
- Add `aria-label` values to the row cells so the stacked mobile presentation retains column meaning for assistive technology.

- [ ] **Step 3: Replace only the target section’s point list**

Keep the current section heading exactly as-is, replace `PointList points={whyMangoLoverPoints}` with:

```tsx
<ComparisonMatrix points={whyMangoLoverPoints} />
```

Keep the existing `OrderButton placement="content_bottom" label="অর্ডার করুন" onOrderClick={onOrderClick}` below the matrix. Do not alter other sections or the content source’s approved point descriptions.

- [ ] **Step 4: Run the focused test and confirm it passes**

Run:

```bash
node --test client/src/pages/sundarbans-honey.test.ts
```

Expected: all tests in the file pass, including the new matrix assertions.

### Task 3: Verify responsive behavior and repository health

**Files:**
- Inspect: `client/src/features/sundarbans-honey/documentary-sections.tsx`
- Inspect: `client/src/pages/sundarbans-honey.test.ts`

**Interfaces:**
- Consumes: the completed comparison matrix and the existing local campaign dev server.
- Produces: verified desktop/mobile layout, passing campaign tests, and a clean diff check.

- [ ] **Step 1: Run the complete campaign test set**

Run:

```bash
node --test client/src/pages/sundarbans-honey.test.ts client/src/pages/sundarbans-honey-thank-you.test.ts client/src/pages/sundarbans-honey-routing.test.ts client/src/features/sundarbans-honey/order.test.ts client/src/features/sundarbans-honey/location-data.test.ts client/src/features/sundarbans-honey/tracking.test.ts
```

Expected: 44 tests pass with zero failures.

- [ ] **Step 2: Check the matrix at mobile and desktop widths**

At 390px, verify the matrix has six rows, each topic spans the row, the two comparison cells sit side by side, and `document.documentElement.scrollWidth === document.documentElement.clientWidth`. At 1200px, verify three columns render in one row structure with no horizontal overflow. Check the browser console for errors.

- [ ] **Step 3: Run type checking and diff hygiene checks**

Run:

```bash
npm run check
git diff --check
git status --short
```

Expected: `git diff --check` is clean. Report any existing TypeScript errors in `layout.tsx` or `generated-storefront-products.ts` separately rather than changing unrelated files.

- [ ] **Step 4: Commit the implementation**

```bash
git add client/src/features/sundarbans-honey/documentary-sections.tsx client/src/pages/sundarbans-honey.test.ts
git commit -m "feat: add honey transparency comparison matrix"
```
