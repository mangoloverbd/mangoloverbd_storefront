# Quantity Before Size Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display the existing quantity selector immediately above the size selector on every product detail page at all breakpoints.

**Architecture:** Reorder the two existing JSX blocks in the shared dynamic product page. Add a source-level ordering regression test, matching this repository's existing test style, without changing quantity or checkout behavior.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Node.js `node:test`

## Global Constraints

- Apply the same order on mobile and desktop.
- Keep a single quantity selector and a single size selector.
- Preserve all current quantity, size, cart, checkout, and analytics behavior.
- Do not add responsive CSS ordering, duplicate markup, dependencies, or product data.

---

### Task 1: Reorder Product Purchase Controls

**Files:**
- Modify: `client/src/pages/product.test.ts`
- Modify: `client/src/pages/product.tsx`

**Interfaces:**
- Consumes: the existing `Quantity` and `Select Size` JSX blocks.
- Produces: shared source order where the quantity block precedes the size block on mobile and desktop.

- [ ] **Step 1: Write the failing ordering test**

Add this test to `client/src/pages/product.test.ts`:

```ts
test("shows quantity before size at every breakpoint", () => {
  const quantityIndex = productSource.indexOf("Quantity");
  const sizeIndex = productSource.indexOf("Select Size");

  assert.notEqual(quantityIndex, -1);
  assert.notEqual(sizeIndex, -1);
  assert.ok(quantityIndex < sizeIndex);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

```bash
node --test --test-name-pattern="shows quantity before size" client/src/pages/product.test.ts
```

Expected: FAIL because `Select Size` currently appears before `Quantity`.

- [ ] **Step 3: Move the existing quantity JSX block**

In `client/src/pages/product.tsx`, move the complete quantity block, unchanged, from below the size block to immediately above it. Do not alter handlers, labels, classes, or state.

- [ ] **Step 4: Run focused regression tests**

```bash
node --test --test-name-pattern="shows quantity before size|lets customers choose a quantity" client/src/pages/product.test.ts
```

Expected: PASS with two tests and zero failures.

- [ ] **Step 5: Run the production build and inspect generated files**

```bash
NODE_ENV=production npm run build
git diff --check
git status --short
```

Expected: build passes, no whitespace errors, and the generated catalog snapshot has no unrelated change.

- [ ] **Step 6: Commit the implementation**

```bash
git add client/src/pages/product.tsx client/src/pages/product.test.ts docs/superpowers/plans/2026-09-06-quantity-before-size.md
git commit -m "fix: show quantity before size"
```
