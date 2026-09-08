# Honey Nut Quality & Packaging Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Honey Nut quality and packaging section into a cream Swiss editorial layout using the supplied product image.

**Architecture:** Keep the section in `documentary-sections.tsx` and continue sourcing its five quality points from `content.ts`. Add one optimized static WebP asset, render a responsive editorial split on desktop and a stacked layout on mobile, and protect the structure with source assertions.

**Tech Stack:** React 19, Tailwind CSS, TypeScript, Node `node:test`, Vite build script, `cwebp`.

## Global Constraints

- Redesign only the Honey Nut “Quality & packaging” section.
- Preserve the existing quality copy, section heading, accessibility label, and all other Honey Nut campaign sections.
- Use the supplied `WhatsApp Image 2026-09-08 at 16.09.06 (2).jpeg` as the section image, optimized into the Honey Nut public asset folder.
- Do not add product, price, stock, variant, or order data.
- Do not alter Merchant Suite calls or checkout behavior.
- Respect existing reduced-motion behavior and add no new animation.

---

### Task 1: Add asset and structural regression assertions

**Files:**
- Create: `client/public/step/honey-nut/honey-nut-quality-packaging-v2.webp`
- Modify: `client/src/pages/honey-nut.test.ts`

**Interfaces:**
- Produces the asset path and source-level expectations consumed by the section implementation.

- [ ] **Step 1: Add failing source assertions**

Add to the Honey Nut asset list and quality-section test:

```ts
"honey-nut-quality-packaging-v2.webp",
assert.match(sectionsSource, /QUALITY \/ 05/);
assert.match(sectionsSource, /honey-nut-quality-packaging-v2\.webp/);
assert.match(sectionsSource, /String\(index \+ 1\)\.padStart\(2, "0"\)/);
assert.match(sectionsSource, /lg:grid-cols-\[0\.85fr_1\.15fr\]/);
assert.match(sectionsSource, /grid-cols-\[2\.5rem_1fr\]/);
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
node --test client/src/pages/honey-nut.test.ts
```

Expected: FAIL because the new asset and Swiss quality markup do not exist yet.

- [ ] **Step 3: Convert the supplied source image to WebP**

Run:

```bash
cwebp -quiet -q 86 "/Users/noorkarimmehedi/Downloads/WhatsApp Image 2026-09-08 at 16.09.06 (2).jpeg" -o client/public/step/honey-nut/honey-nut-quality-packaging-v2.webp
```

- [ ] **Step 4: Confirm the asset exists and diff is clean**

Run:

```bash
file client/public/step/honey-nut/honey-nut-quality-packaging-v2.webp
git diff --check
```

Expected: WebP output and no whitespace errors.

---

### Task 2: Implement the Swiss quality and packaging layout

**Files:**
- Modify: `client/src/features/honey-nut/documentary-sections.tsx:103`

**Interfaces:**
- Consumes: `qualityHeading` and `qualityPoints` from `./content`.
- Produces: the existing `honey-nut-quality-heading` section with the new responsive visual structure.

- [ ] **Step 1: Replace the current green panel with the cream editorial section**

Use this structure while preserving the existing heading and points:

```tsx
<section aria-labelledby="honey-nut-quality-heading" className="bg-[#fbf4e8] px-4 py-10 text-[#3d211a] sm:px-6 sm:py-16">
  <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-14">
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a16a12]">QUALITY / 05</p>
      <h2 id="honey-nut-quality-heading" className="honey-nut-heading mt-4 text-3xl leading-tight sm:text-5xl">{qualityHeading}</h2>
      <p className="mt-5 max-w-md text-base leading-7 text-[#6c5145]">বাছাই থেকে প্যাকেজিং—প্রতিটি ধাপে মান ও যত্নকে গুরুত্ব দেওয়া হয়েছে।</p>
      <ol className="mt-8 border-t border-[#5b3b18]/20">
        {qualityPoints.map((point, index) => (
          <li key={point} className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-[#5b3b18]/20 py-4">
            <span className="font-serif text-xl text-[#d99a2b]">{String(index + 1).padStart(2, "0")}</span>
            <span className="text-sm font-semibold leading-6 text-[#3d211a]">{point}</span>
          </li>
        ))}
      </ol>
    </div>
    <div className="overflow-hidden border border-[#3d211a]/15 bg-white p-2 shadow-[10px_10px_0_#d99a2b]">
      <img src="/step/honey-nut/honey-nut-quality-packaging-v2.webp" alt="Honey Nut jar, মধু ও বাদামের পরিবেশন" className="h-auto max-h-[520px] w-full object-cover object-center" width="1536" height="1024" loading="lazy" />
    </div>
  </div>
</section>
```

- [ ] **Step 2: Run the focused tests and verify they pass**

Run:

```bash
node --test client/src/pages/honey-nut.test.ts client/src/pages/honey-nut-routing.test.ts client/src/features/honey-nut/*.test.ts
```

Expected: all focused Honey Nut tests pass.

- [ ] **Step 3: Run formatting and source checks**

Run:

```bash
git diff --check
```

Expected: no output and exit code 0.

---

### Task 3: Build and commit the redesign

**Files:**
- Verify: `client/src/features/honey-nut/documentary-sections.tsx`
- Verify: `client/src/pages/honey-nut.test.ts`
- Verify: `client/public/step/honey-nut/honey-nut-quality-packaging-v2.webp`

- [ ] **Step 1: Run the production build**

Run:

```bash
NODE_ENV=development VITE_MERCHANT_SUITE_URL=http://127.0.0.1:9 npm run build
```

Expected: Vite and server bundles complete; catalog refresh may fall back to the existing snapshot when the local Suite is unavailable.

- [ ] **Step 2: Check generated-file status**

Run:

```bash
git status --short
git diff --check
```

Expected: only the planned asset, section, test, and plan/spec documentation changes are present; no generated catalog is emptied.

- [ ] **Step 3: Commit the implementation**

Run:

```bash
git add client/public/step/honey-nut/honey-nut-quality-packaging-v2.webp client/src/features/honey-nut/documentary-sections.tsx client/src/pages/honey-nut.test.ts docs/superpowers/plans/2026-09-08-honey-nut-quality-packaging-redesign.md
git commit -m "feat: redesign Honey Nut quality section"
```
