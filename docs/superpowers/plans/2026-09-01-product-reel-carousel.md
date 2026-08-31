# Product Reel Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the product-page single-video viewer with a smooth horizontal snap carousel for the existing Wistia reels.

**Architecture:** Keep reel state in `ProductPage`, use the existing Embla hook for drag and snap behavior, and render only the active Wistia player. Preserve arrows and dots as alternate navigation controls.

**Tech Stack:** React, TypeScript, Embla Carousel, Framer Motion, Tailwind CSS, Node test runner.

## Global Constraints

- Keep the existing three Wistia media IDs unchanged.
- Keep the existing Bengali section heading unchanged.
- Keep only the active reel mounted and playing.
- Do not alter checkout, product data, or unrelated page sections.
- Preserve touch scrolling, mouse dragging, keyboard arrows, and dot navigation.

---

### Task 1: Product Reel Carousel

**Files:**
- Modify: `client/src/pages/product.tsx:663-725`
- Test: `client/src/pages/product.test.ts`

**Interfaces:**
- Consumes: `reelMediaIds`, `currentReel`, `setCurrentReel`, and existing `useEmblaCarousel` state.
- Produces: a horizontal carousel with one active Wistia player, partial next-card preview, smooth snapping, and working controls.

- [ ] Add failing source assertions for horizontal snap classes, Embla ref wiring, active-only player rendering, and preserved controls.
- [ ] Run `npx tsx --test client/src/pages/product.test.ts` and confirm the new assertions fail.
- [ ] Replace the single viewer with an Embla viewport and horizontal track. Use `touch-pan-x`, `cursor-grab`, `active:cursor-grabbing`, `scroll-smooth`, and `snap-center` card sizing with a visible next card.
- [ ] Add an Embla `select` listener to synchronize `currentReel`, and make arrows call `scrollPrev`/`scrollNext`.
- [ ] Render `wistia-player` only for the active card; keep inactive cards as stable visual placeholders so the carousel does not jump.
- [ ] Run the focused test again and confirm it passes.
- [ ] Run `npm run build` and confirm the production bundle succeeds.
- [ ] Run `git diff --check` and inspect the final diff for scope.
