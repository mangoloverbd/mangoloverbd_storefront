# Mobile Dock Bottom Hide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hide all campaign mobile quick-order docks at the bottom of the page with a smooth Framer Motion transition while leaving desktop behavior unchanged.

**Architecture:** Each dock will track checkout visibility and document-bottom visibility in its existing component. A shared visual pattern will use `motion.div` with `y: 0` and `y: "110%"`; the existing desktop media queries remain the desktop boundary.

**Tech Stack:** React, TypeScript, Framer Motion, CSS media queries, Node test runner via `tsx`.

## Global Constraints

- Apply to Honey Nut, Kalojira Mixed, and Sundarbans Honey mobile docks.
- Hide when checkout is visible or the document bottom is reached.
- Use Framer Motion for the mobile hide/show transition.
- Do not change desktop behavior at `min-width: 768px`.
- Respect `prefers-reduced-motion`.

---

### Task 1: Add bottom detection and Framer Motion to the three docks

**Files:**
- Modify: `client/src/features/honey-nut/mobile-order-bar.tsx`
- Modify: `client/src/features/kalojira-mixed/mobile-order-bar.tsx`
- Modify: `client/src/features/sundarbans-honey/mobile-order-bar.tsx`
- Modify: each campaign `campaign.css` file that styles the dock

**Interfaces:**
- Consumes: existing checkout section IDs and `checkoutVisible` state.
- Produces: `hidden = checkoutVisible || atPageBottom`, exposed through `data-hidden` and Framer Motion animation.

- [x] Add a passive scroll listener that updates bottom state when `window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 24`, with resize support and cleanup.
- [x] Import `motion` and render the dock as `motion.div` with `initial={false}` and `animate={{ y: hidden ? "110%" : 0 }}`.
- [x] Preserve each existing checkout ID, event handlers, dock classes, and desktop media query.
- [x] Remove CSS transform transitions/transforms that would compete with Framer Motion, while preserving layout, colors, and mobile-only display behavior.

### Task 2: Strengthen regression coverage

**Files:**
- Modify: `client/src/pages/honey-nut.test.ts`
- Modify: `client/src/pages/kalojira-mixed.test.ts`
- Modify: `client/src/pages/sundarbans-honey.test.ts` if the existing source test covers the dock

- [x] Assert each dock has bottom detection, Framer Motion animation, and combined hidden state.
- [x] Assert each dock's desktop-only CSS remains present.
- [x] Run focused campaign tests and TypeScript validation.

### Task 3: Verify and commit

- [x] Run `git diff --check`.
- [x] Run the focused tests and `npm run check`.
- [x] Run the production build and confirm no generated data-file changes were introduced.
- [ ] Commit with `feat: hide mobile dock at page bottom`.
