# Borderless Hero Image Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the storefront homepage hero image with the supplied September 8 asset and remove visible hero background, border, and gradient framing.

**Architecture:** Keep the existing `Hero` carousel and its controls unchanged. Add the supplied image as a committed static public asset, make it the first slide, and remove only the decorative frame layers from `client/src/components/hero.tsx`.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, Embla Carousel, Framer Motion.

## Global Constraints

- Preserve the existing carousel behavior, animation, responsive sizing, controls, and all non-hero content.
- Do not change route logic or catalog/product data.
- The hero must not render a background color, border line, or bottom gradient overlay.
- Use the supplied file `~/Downloads/ChatGPT Image Sep 8, 2026, 02_08_34 PM.webp` as the first hero image.

---

### Task 1: Replace the hero asset and remove decorative framing

**Files:**
- Create: `client/public/ChatGPT Image Sep 8, 2026, 02_08_34 PM.webp`
- Modify: `client/src/components/hero.tsx:5-24,65-94`

**Interfaces:**
- Consumes: the existing `HERO_IMAGES` carousel configuration and `Hero` component.
- Produces: a borderless, background-free hero carousel whose first slide uses the new asset.

- [ ] **Step 1: Copy the supplied image into the public asset directory**

Run:

```bash
cp "$HOME/Downloads/ChatGPT Image Sep 8, 2026, 02_08_34 PM.webp" "client/public/ChatGPT Image Sep 8, 2026, 02_08_34 PM.webp"
```

- [ ] **Step 2: Add a source assertion for the requested hero treatment**

Add a focused test or source assertion beside the existing hero tests, if one exists, that verifies `hero.tsx` references the new filename and does not contain the frame border or gradient overlay class names.

- [ ] **Step 3: Run the focused assertion and confirm it fails before the implementation**

Run the repository's existing focused hero test command if present. Otherwise inspect the assertion output from the new source test.

Expected: FAIL because the old first image and decorative frame classes are still present.

- [ ] **Step 4: Update `HERO_IMAGES` and remove only the decorative layers**

Use this first slide configuration:

```tsx
{
  src: "/ChatGPT Image Sep 8, 2026, 02_08_34 PM.webp",
  alt: "",
  fit: "contain",
},
```

Update the hero section and frame classes so they no longer add `bg-brand-ivory`, `bg-[#f6f6f6]`, the `border border-black/10` overlay, or the bottom gradient overlay. Do not remove the carousel controls or their backdrop styling.

- [ ] **Step 5: Run focused verification**

Run:

```bash
npm run check
```

Expected: PASS with the new asset reference and borderless hero source.

- [ ] **Step 6: Run the production build**

Run:

```bash
npm run build
```

Expected: PASS and the new public asset is included in the build output.

- [ ] **Step 7: Review the diff and commit the implementation**

Run:

```bash
git diff --check
git status --short
git diff -- client/src/components/hero.tsx
git add "client/public/ChatGPT Image Sep 8, 2026, 02_08_34 PM.webp" client/src/components/hero.tsx
git commit -m "feat: refresh borderless storefront hero"
```

Expected: only the requested hero asset and hero component changes are committed.
