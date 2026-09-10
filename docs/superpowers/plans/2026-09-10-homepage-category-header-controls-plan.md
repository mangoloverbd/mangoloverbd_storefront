# Homepage Category Header Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task with review checkpoints.

**Goal:** Add left-aligned bilingual category headers with underlined View All links and limit each category section to four products.

**Architecture:** Update the existing `renderCategorySection(slug)` renderer in `client/src/pages/home.tsx`. It already resolves populated collections and filters their products, so the change only adds the collection link/header controls and applies a four-item slice.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Framer Motion, Wouter, Node test runner.

## Global Constraints

- Apply the header and product limit only to category product sections.
- Keep the `PURE GHEE` and `BLACK SEED MIX` editorial banners unchanged.
- Show bilingual labels in the format `English-বাংলা`.
- Link each category's `View All` control to `/collection/:slug`.
- Underline `View All` with the existing border-bottom link style.
- Render at most four products per category section.
- Keep empty categories hidden and preserve the existing catalog/filtering behavior.

---

### Task 1: Add failing coverage for category header controls and product limit

**Files:**
- Modify: `client/src/pages/home.test.ts`
- Read: `client/src/pages/home.tsx`

**Interfaces:**
- Consumes: the homepage source and the existing category renderer.
- Produces: regression coverage for header alignment, collection links, underlines, bilingual labels, and four-product limits.

- [ ] **Step 1: Add the failing assertions**

Add a test that slices the first category section source and asserts it contains a flex header with `justify-between`, `collection.label`, `/collection/${collection.slug}`, `View All`, and `border-b-2 border-black`. Add an assertion for `products.slice(0, 4)` in the category renderer.

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --test --test-name-pattern='category header controls' client/src/pages/home.test.ts`

Expected: FAIL because the current category renderer centers its heading, has no View All link, and maps all category products.

### Task 2: Implement the category header and four-product limit

**Files:**
- Modify: `client/src/pages/home.tsx`

**Interfaces:**
- Consumes: `collection`, `products`, `getProductsForCollection`, and the existing `Link` component.
- Produces: category section headers with left/right controls and at most four cards.

- [ ] **Step 1: Change the category header layout**

Replace the centered header wrapper with `className="mb-7 flex items-center justify-between gap-6 md:mb-12"`. Keep the existing heading typography, render the bilingual label, and add:

```tsx
<Link
  href={`/collection/${collection.slug}`}
  className="shrink-0 border-b-2 border-black pb-1 text-[15px] font-medium text-black transition-opacity hover:opacity-60 md:text-[18px]"
>
  View All
</Link>
```

- [ ] **Step 2: Limit category cards to four**

Change the category card mapping to `products.slice(0, 4).map(...)`. Keep the loading/error branches and existing `HomeProductCard` props unchanged.

- [ ] **Step 3: Run the focused test and verify it passes**

Run: `node --test --test-name-pattern='category header controls' client/src/pages/home.test.ts`

Expected: PASS.

### Task 3: Verify scope and build

**Files:**
- Verify: `client/src/pages/home.tsx`, `client/src/pages/home.test.ts`
- Verify unchanged: `client/src/lib/featured-collections.ts`, `PURE GHEE` editorial markup, `BLACK SEED MIX` essentials markup

- [ ] **Step 1: Run the focused homepage tests**

Run: `node --test --test-name-pattern='category sections|category header controls|removes the requested|interleaves populated' client/src/pages/home.test.ts`

Expected: all selected tests pass.

- [ ] **Step 2: Run TypeScript checking and the production build**

Run:

```bash
npm run check
NODE_ENV=production npm run build
```

Expected: both commands exit successfully. Restore only generated catalog changes caused by the build.

- [ ] **Step 3: Check the final diff**

Run: `git diff --check && git status --short --branch`

Expected: no whitespace errors; unrelated existing working-tree changes remain untouched.
