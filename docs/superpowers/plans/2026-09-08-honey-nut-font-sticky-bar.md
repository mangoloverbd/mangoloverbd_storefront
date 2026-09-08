# Honey Nut Font and Sticky Bar Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Make Honey Nut titles use the normal Bengali font stack and make its mobile sticky order bar match Kalojira Mixed.

**Architecture:** Keep the change isolated to the Honey Nut campaign stylesheet and mobile order bar. Reuse the existing Honey Nut WhatsApp icon, tracking events, CTA callback, and checkout visibility pattern without changing Kalojira.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, lucide-react, IntersectionObserver, Node `node:test` source assertions.

## Global Constraints

- Preserve `/step/kalojira-mixed` unchanged.
- Use `Hind Siliguri`, `Inter`, and system fallbacks for Honey Nut Bengali titles.
- Keep Honey Nut tracking campaign-scoped as `honey_nut`.
- Keep the sticky bar mobile-only and hide it while the checkout is visible.
- Run focused Honey Nut and campaign regression tests after the change.

---

### Task 1: Add failing assertions for typography and sticky-bar parity

**Files:**
- Modify: `client/src/pages/honey-nut.test.ts`

- [ ] **Step 1: Add source assertions**

Assert the Honey Nut stylesheet contains the normal Bengali font stack and sticky-bar rules, and assert the mobile bar source contains `IntersectionObserver`, `data-hidden`, WhatsApp, phone, and the sticky CTA placement.

- [ ] **Step 2: Run the Honey Nut test and verify it fails**

```bash
node --test client/src/pages/honey-nut.test.ts
```

Expected: FAIL because Honey Nut still uses `KaiumSimanto` and its sticky bar has only two actions.

### Task 2: Implement the approved Honey Nut visual update

**Files:**
- Modify: `client/src/features/honey-nut/campaign.css`
- Modify: `client/src/features/honey-nut/mobile-order-bar.tsx`

- [ ] **Step 1: Replace the heading font**

Use `Hind Siliguri`, `Inter`, and `system-ui` for the Honey Nut page and `.honey-nut-heading`, retaining the existing bold weight.

- [ ] **Step 2: Mirror Kalojira sticky-bar behavior**

Add checkout visibility state using `IntersectionObserver`, render WhatsApp / order / phone actions in the same order, add `data-hidden`, safe-area-aware positioning, and preserve Honey Nut event placements.

- [ ] **Step 3: Run focused tests**

```bash
node --test client/src/pages/honey-nut.test.ts client/src/pages/honey-nut-routing.test.ts client/src/features/honey-nut/*.test.ts
```

Expected: PASS.

- [ ] **Step 4: Run campaign regressions and check the diff**

```bash
node --test client/src/pages/kalojira-mixed.test.ts client/src/pages/kalojira-mixed-routing.test.ts client/src/features/kalojira-mixed/*.test.ts client/src/pages/sundarbans-honey.test.ts client/src/pages/sundarbans-honey-routing.test.ts
git diff --check
```

Expected: PASS with no Kalojira/Sundarbans source changes.

- [ ] **Step 5: Commit the update**

```bash
git add client/src/features/honey-nut client/src/pages/honey-nut.test.ts docs/superpowers/plans/2026-09-08-honey-nut-font-sticky-bar.md
git commit -m "fix: match Honey Nut typography and sticky order bar"
```
