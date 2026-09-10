# Menu Category Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update every storefront menu category surface to use the current non-empty Featured Categories and collection routes.

**Architecture:** Reuse `getVisibleFeaturedCollections()` from the existing featured collection module and the catalog already queried by `Layout`. The desktop category strip, desktop menu overlay, and mobile Collection submenu will all render from the same visible collection objects; empty collection definitions and routes remain untouched.

**Tech Stack:** React 19, TypeScript, wouter, TanStack Query, Framer Motion, Node’s built-in test runner, Vite.

## Global Constraints

- Only Homemade, Honey, Oil & Ghee, Semai, and Nuts & Seeds appear because they have matching live products.
- Jaggery, Fresh Mango, and Dates remain defined and directly routable but are omitted from menus.
- Every visible category links to `/collection/:slug`.
- Existing non-category navigation, search, cart, animation, and responsive behavior remain unchanged.
- Do not modify Merchant Suite, Supabase, API routes, or catalog data.
- Preserve unrelated user changes in `client/src/lib/generated-storefront-products.ts` and `storefront-server.log`.

---

## File map

- Modify `client/src/components/layout.tsx`: derive visible menu categories from the shared collection helper and render collection links in all menu surfaces.
- Modify `client/src/components/layout.test.ts`: add source-level regression checks for shared helper usage, current category names, collection URLs, and removal of legacy categories.
- Add `docs/superpowers/specs/2026-09-10-menu-category-navigation-design.md`: approved design for the navigation update.

### Task 1: Add failing menu navigation regression tests

**Files:**
- Modify: `client/src/components/layout.test.ts`

**Interfaces:**
- Consumes: `layout.tsx` source text loaded by the existing test file.
- Produces: explicit regression expectations for all category menu surfaces.

- [ ] **Step 1: Write the failing tests**

Add tests that require the layout source to import and call `getVisibleFeaturedCollections`, contain collection-route interpolation, include the five current categories, and exclude the obsolete `Organic`, `Spices`, `Beverage`, `Rice`, and `Flours & lentils` menu labels.

```ts
test("uses the shared visible Featured Categories for menu navigation", () => {
  assert.match(layoutSource, /getVisibleFeaturedCollections/);
  assert.match(layoutSource, /getVisibleFeaturedCollections\(searchableProducts\)/);
  assert.match(layoutSource, /\/collection\/\$\{slug\}/);
  for (const label of ["Homemade", "Honey", "Oil & Ghee", "Semai", "Nuts & Seeds"]) {
    assert.match(layoutSource, new RegExp(label.replace(/&/g, "\\&")));
  }
});

test("does not expose obsolete menu categories", () => {
  for (const label of ["Organic", "Spices", "Beverage", "Rice", "Flours & lentils"]) {
    assert.doesNotMatch(layoutSource, new RegExp(label.replace(/&/g, "\\&")));
  }
});
```

- [ ] **Step 2: Run the tests and verify the new expectations fail**

Run: `node --import tsx --test client/src/components/layout.test.ts`

Expected: the new tests fail because `layout.tsx` still contains the legacy static category arrays and does not consume collection routes.

- [ ] **Step 3: Commit the red tests**

```bash
git add client/src/components/layout.test.ts
git commit -m "test: define current menu category navigation"
```

### Task 2: Connect every menu surface to visible collections

**Files:**
- Modify: `client/src/components/layout.tsx:2,76-111,129-166,234-242,430-436,463-503`

**Interfaces:**
- Consumes: `getVisibleFeaturedCollections(products: StorefrontProduct[])` from `@/lib/featured-collections` and `searchableProducts` from the existing TanStack Query.
- Produces: `visibleCollections`, a render-ready list with `slug` and `label` for desktop and mobile menus.

- [ ] **Step 1: Import the shared visibility helper**

Add:

```ts
import { getVisibleFeaturedCollections } from "@/lib/featured-collections";
```

- [ ] **Step 2: Remove obsolete category constants and keyword filtering**

Remove the legacy category entries from `MENU_ITEMS`, remove `MOBILE_COLLECTIONS` and `DESKTOP_COLLECTIONS`, remove `openMenuItem` state, and remove `getMenuProducts`. Keep `Home`, `Track Order`, and `Contact Us` as static menu links.

- [ ] **Step 3: Derive the shared visible collection list**

After the existing query setup, add:

```ts
const visibleCollections = getVisibleFeaturedCollections(searchableProducts);
```

- [ ] **Step 4: Update the desktop category strip**

Replace the `DESKTOP_COLLECTIONS.map` block with:

```tsx
{visibleCollections.map(({ slug, label }) => (
  <Link key={slug} href={`/collection/${slug}`}>
    <a className="whitespace-nowrap transition-colors hover:text-brand-gold">{label}</a>
  </Link>
))}
```

- [ ] **Step 5: Update the mobile Collection submenu**

Replace the `MOBILE_COLLECTIONS.map` block with the same collection objects and route pattern:

```tsx
{visibleCollections.map(({ slug, label }) => (
  <Link key={slug} href={`/collection/${slug}`} onClick={() => setIsOpen(false)}>
    <a className="transition-opacity hover:opacity-60">{label}</a>
  </Link>
))}
```

- [ ] **Step 6: Update the desktop menu overlay**

Render static `MENU_ITEMS` and `visibleCollections` as direct links. Remove the expandable product-keyword rendering because those old categories no longer exist. Preserve the overlay animation, close behavior, footer, and static links.

- [ ] **Step 7: Run the focused tests and verify they pass**

Run: `node --import tsx --test client/src/components/layout.test.ts`

Expected: all layout navigation tests pass.

- [ ] **Step 8: Commit the implementation**

```bash
git add client/src/components/layout.tsx client/src/components/layout.test.ts
git commit -m "feat: update storefront menu categories"
```

### Task 3: Verify the storefront build and diff

**Files:**
- No source changes expected.

- [ ] **Step 1: Run the focused collection and layout tests**

Run: `node --import tsx --test client/src/components/layout.test.ts client/src/lib/featured-collections.test.ts client/src/pages/home.test.ts`

Expected: all selected tests pass; any unrelated pre-existing heading assertion is reported separately if it remains.

- [ ] **Step 2: Build the storefront**

Run: `npm run build`

Expected: exit code 0; existing chunk-size or script-order warnings may remain.

- [ ] **Step 3: Check the diff and working tree**

Run: `git diff --check && git status --short`

Expected: no whitespace errors; only the intended menu commit is new, while the pre-existing generated snapshot and log remain untouched.
