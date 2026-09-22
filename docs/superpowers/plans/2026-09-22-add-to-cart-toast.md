# Add-to-Cart Toast Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the automatic full cart drawer on add-to-cart with a floating confirmation capsule that hands off to a numeric badge on the mobile dock cart control.

**Architecture:** `CartProvider` owns a new `notice` state (single latest addition) plus a one-shot `cartPulseKey` handoff signal. A new `CartAddedToast` component mounted once in `Layout` renders the notice with a 3.5 s pause-aware timer. `Layout`'s mobile dock cart button swaps its dot for a numeric badge and pulses once per handoff signal. The existing drawer opens only via explicit `setIsOpen(true)` (header icons, dock button, toast View cart, checkout).

**Tech Stack:** React 18, wouter, Framer Motion (`AnimatePresence`, `useReducedMotion`), Tailwind, `node:test` source-text tests.

## Global Constraints

- TypeScript strict; run `npm run check` (tsc, no emit) before claiming done.
- Tests are `node:test` files asserting against **source text** — no vitest, no DOM. Run with `node --test --experimental-strip-types <file>`.
- Never use raw `fetch()` from the frontend for authenticated endpoints (not applicable here; no API changes in this plan).
- Phosphor Icons `weight="light"` for new icons; fallback to Lucide only if Phosphor lacks the icon. (This plan adds no icons.)
- Currency uses `৳`; toast shows product title/variant text only, no new price rendering.
- Keep `api/orders.ts` and `server/order-service.ts` untouched; checkout payload behavior must not change.
- `storefront-server.log` is untracked local noise: never stage or commit it.
- Full-suite gate: diff failures against a stashed `origin/main` baseline; zero new failures allowed.

---

### Task 1: Cart notice state, drop drawer auto-open

**Files:**
- Modify: `client/src/contexts/cart-context.tsx`
- Test: `client/src/contexts/cart-checkout-items.test.ts` (append two tests)

**Interfaces:**
- Consumes: existing `CartItem`, `AddToCartProduct`, `addToCart(product, size, quantity?)`.
- Produces: `CartNotice = { key: number; itemId: string; title: string; size: string; image: string; quantityAdded: number }`; context fields `notice: CartNotice | null`, `dismissNotice: () => void`, `cartPulseKey: number`, `signalCartPulse: () => void`, `consumeCartPulse: () => void`. Task 2 consumes `notice/dismissNotice/setIsOpen/signalCartPulse`; Task 3 consumes `cartPulseKey/consumeCartPulse/itemCount`.

- [ ] **Step 1: Write the failing tests**

Append to `client/src/contexts/cart-checkout-items.test.ts`:

```ts
test("adding to the cart shows a notice instead of opening the drawer", () => {
  const addToCartBody = cartContext.slice(cartContext.indexOf("const addToCart = ("));
  assert.doesNotMatch(addToCartBody, /setIsOpen\(true\)/);
  assert.match(addToCartBody, /setNotice\(\{/);
});

test("the cart exposes notice and dock-pulse controls", () => {
  assert.match(cartContext, /notice: CartNotice \| null;/);
  assert.match(cartContext, /dismissNotice: \(\) => void;/);
  assert.match(cartContext, /cartPulseKey: number;/);
  assert.match(cartContext, /signalCartPulse: \(\) => void;/);
  assert.match(cartContext, /consumeCartPulse: \(\) => void;/);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test --experimental-strip-types client/src/contexts/cart-checkout-items.test.ts`
Expected: FAIL on the two new tests (`setIsOpen(true)` still present, no `CartNotice`).

- [ ] **Step 3: Implement notice state in cart context**

In `client/src/contexts/cart-context.tsx`:
1. Add `useRef` to the React import.
2. Add the `CartNotice` type after `AddToCartProduct`.
3. Extend `CartContextType` with the five new fields.
4. Add state `const [notice, setNotice] = useState<CartNotice | null>(null);`, `const [cartPulseKey, setCartPulseKey] = useState(0);`, and `const noticeSeq = useRef(0);`.
5. In `addToCart`, replace the `// Open cart drawer after adding` + `setIsOpen(true);` lines with:

```tsx
// Show the floating confirmation instead of opening the drawer. The
// shopper stays on the page; the drawer opens only on demand.
noticeSeq.current += 1;
setNotice({ key: noticeSeq.current, itemId, title: product.title, size, image: product.image, quantityAdded: quantity });
```

6. Add `const dismissNotice = () => setNotice(null);`, `const signalCartPulse = () => setCartPulseKey((key) => key + 1);`, `const consumeCartPulse = () => setCartPulseKey(0);` next to the other actions.
7. Expose all five through the provider `value`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test --experimental-strip-types client/src/contexts/cart-checkout-items.test.ts`
Expected: PASS (all tests, old and new).

- [ ] **Step 5: Typecheck**

Run: `npm run check`
Expected: clean (new fields are consumed in later tasks; unused exports are fine).

---

### Task 2: Floating confirmation toast component

**Files:**
- Create: `client/src/components/cart-added-toast.tsx`
- Create: extend `client/src/index.css` (verify filename first; if the global stylesheet lives elsewhere, put the two keyframe blocks there instead)
- Test: `client/src/components/cart-added-toast.test.ts` (new file)

**Interfaces:**
- Consumes (from Task 1): `notice`, `dismissNotice`, `setIsOpen`, `signalCartPulse`.
- Produces: default-exported `CartAddedToast` component taking no props, mounted once by Task 3. Timer constant `NOTICE_DURATION_MS = 3500` lives in this file.

- [ ] **Step 1: Write the failing test**

Create `client/src/components/cart-added-toast.test.ts`:

```ts
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const toastPath = new URL("./cart-added-toast.tsx", import.meta.url);
const toastSource = existsSync(toastPath) ? readFileSync(toastPath, "utf8") : "";
const cssSource = readFileSync(new URL("../index.css", import.meta.url), "utf8");

test("the toast announces the addition without blocking the page", () => {
  assert.match(toastSource, /role="status"/);
  assert.match(toastSource, /aria-live="polite"/);
  assert.match(toastSource, /<AnimatePresence>/);
  assert.match(toastSource, /NOTICE_DURATION_MS = 3500/);
  assert.doesNotMatch(toastSource, /setIsOpen\(true\)[\s\S]*signalCartPulse|signalCartPulse\([\s\S]*setIsOpen\(true\)/);
});

test("viewing the cart opens the existing drawer and skips the dock handoff", () => {
  assert.match(toastSource, /dismissNotice\(\);\n\s+setIsOpen\(true\)/);
  assert.match(toastSource, /if \(window\.innerWidth < 768\) signalCartPulse\(\);/);
});

test("hover and keyboard focus pause the dismissal timer", () => {
  assert.match(toastSource, /onMouseEnter=\{\(\) => setPaused\(true\)\}/);
  assert.match(toastSource, /onMouseLeave=\{\(\) => setPaused\(false\)\}/);
  assert.match(toastSource, /onFocus=\{\(\) => setPaused\(true\)\}/);
  assert.match(toastSource, /onBlur=\{\(\) => setPaused\(false\)\}/);
  assert.match(toastSource, /remaining\.current -= Date\.now\(\) - startedAt\.current/);
});

test("reduced-motion shoppers get an opacity-only toast", () => {
  assert.match(toastSource, /useReducedMotion/);
  assert.match(toastSource, /reduceMotion \? \{ opacity: 0 \}/);
});

test("the toast progress and dock pulse animations exist and honor reduced motion", () => {
  assert.match(cssSource, /@keyframes cart-toast-progress/);
  assert.match(cssSource, /@keyframes cart-dock-pulse/);
  assert.match(cssSource, /prefers-reduced-motion: reduce/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test --experimental-strip-types client/src/components/cart-added-toast.test.ts`
Expected: FAIL (file does not exist; `readFileSync` throws or assertions miss).

- [ ] **Step 3: Create the toast component**

Create `client/src/components/cart-added-toast.tsx` exactly as follows:

```tsx
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCart } from "@/contexts/cart-context";

// Must match the cart-toast-progress keyframe duration in index.css.
const NOTICE_DURATION_MS = 3500;

export default function CartAddedToast() {
  const { notice, dismissNotice, setIsOpen, signalCartPulse } = useCart();
  const [location] = useLocation();
  const reduceMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const prevKey = useRef<number | null>(null);
  const prevLocation = useRef(location);
  const remaining = useRef(NOTICE_DURATION_MS);
  const startedAt = useRef(0);

  // A new notice restarts the lifecycle; a route change clears a stale one.
  // Effects are intentionally dependency-free and guarded by refs: the
  // context callbacks are recreated every render, so listing them as deps
  // would re-fire the timer on each render.
  useEffect(() => {
    if (notice && prevKey.current !== notice.key) {
      prevKey.current = notice.key;
      remaining.current = NOTICE_DURATION_MS;
      setPaused(false);
    }
    if (prevLocation.current !== location) {
      prevLocation.current = location;
      dismissNotice();
    }
  });

  // Pause-aware dismissal: hovering or focusing the toast freezes both the
  // timer and the CSS progress bar (via animationPlayState below).
  useEffect(() => {
    if (!notice || paused) return;
    startedAt.current = Date.now();
    const id = window.setTimeout(() => {
      remaining.current = NOTICE_DURATION_MS;
      // Only the automatic timeout hands off to the dock. Manual dismissal
      // (View cart, route change, replaced notice) never pulses.
      if (window.innerWidth < 768) signalCartPulse();
      dismissNotice();
    }, remaining.current);
    return () => {
      remaining.current -= Date.now() - startedAt.current;
      window.clearTimeout(id);
    };
  });

  const viewCart = () => {
    dismissNotice();
    setIsOpen(true);
  };

  return (
    <AnimatePresence>
      {notice && (
        <motion.div
          key={notice.key}
          role="status"
          aria-live="polite"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 64, scale: 0.75 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          className="fixed z-[90] left-3 right-3 bottom-[calc(env(safe-area-inset-bottom)+96px)] md:left-auto md:right-6 md:bottom-6 md:w-[380px]"
        >
          <div className="relative flex items-center gap-3 overflow-hidden rounded-full bg-[#163B33] py-2 pl-2 pr-2 text-white shadow-2xl">
            {notice.image ? (
              <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
                <img src={notice.image} alt="" className="h-full w-full object-cover" />
                <span className="absolute bottom-0 right-0 grid h-4 w-4 place-items-center rounded-full bg-[#FBBB14] text-[9px] font-black text-[#163B33]">
                  ✓
                </span>
              </span>
            ) : null}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11px] font-bold">Added to cart</span>
              <span className="block truncate text-[10px] text-white/65">
                {notice.title} · {notice.size}
              </span>
            </span>
            <button
              type="button"
              onClick={viewCart}
              aria-label={`View cart, ${notice.quantityAdded} added`}
              className="min-h-11 shrink-0 rounded-full bg-[#FBBB14] px-4 text-[9px] font-bold uppercase tracking-[0.12em] text-black transition-colors hover:bg-white"
            >
              View cart
            </button>
            {!reduceMotion && (
              <span
                key={notice.key}
                aria-hidden="true"
                className="cart-toast-progress pointer-events-none absolute bottom-1 left-6 right-6 h-[2px] rounded-full bg-[#FBBB14]/80"
                style={{ animationPlayState: paused ? "paused" : "running" }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

Append to the global stylesheet (`client/src/index.css` or wherever the Tailwind directives live):

```css
@keyframes cart-toast-progress {
  from { width: calc(100% - 3rem); }
  to { width: 0; }
}
.cart-toast-progress {
  animation: cart-toast-progress 3.5s linear forwards;
}
@keyframes cart-dock-pulse {
  0% { transform: scale(1); }
  35% { transform: scale(1.12); }
  100% { transform: scale(1); }
}
.cart-dock-pulse {
  animation: cart-dock-pulse 0.55s ease-out;
}
@media (prefers-reduced-motion: reduce) {
  .cart-toast-progress,
  .cart-dock-pulse {
    animation: none;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test --experimental-strip-types client/src/components/cart-added-toast.test.ts`
Expected: PASS. If the stylesheet lives at a different path, fix the test's `readFileSync` URL to match (keep the same assertions).

- [ ] **Step 5: Typecheck**

Run: `npm run check`
Expected: clean.

---

### Task 3: Mount toast, numeric dock badge, one-shot pulse

**Files:**
- Modify: `client/src/components/layout.tsx`
- Test: `client/src/components/layout.test.ts` (append three tests)

**Interfaces:**
- Consumes (Task 1): `cartPulseKey`, `consumeCartPulse`, `itemCount`; (Task 2): default-exported `CartAddedToast`.
- Produces: no new exports. Visible behavior: toast mounts beside `CartDrawer`; dock cart shows a count badge; badge pulses once per handoff.

- [ ] **Step 1: Write the failing tests**

Append to `client/src/components/layout.test.ts`:

```ts
test("mounts the floating add-to-cart toast beside the cart drawer", () => {
  assert.match(layoutSource, /import CartAddedToast from "@\/components\/cart-added-toast"/);
  assert.match(layoutSource, /<CartDrawer \/>\n\s+<CartAddedToast \/>/);
});

test("shows a numeric badge on the mobile dock cart instead of a dot", () => {
  assert.match(layoutSource, /itemCount > 99 \? "99\+" : itemCount/);
  assert.doesNotMatch(layoutSource, /h-1\.5 w-1\.5 rounded-full bg-\[#163B33\]/);
});

test("pulses the dock cart once per toast handoff, then clears the signal", () => {
  assert.match(layoutSource, /cartPulseKey, consumeCartPulse/);
  assert.match(layoutSource, /cartPulseKey > 0 \? "cart-dock-pulse" : ""/);
  assert.match(layoutSource, /if \(cartPulseKey > 0\) consumeCartPulse\(\);/);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test --experimental-strip-types client/src/components/layout.test.ts`
Expected: FAIL on the three new tests.

- [ ] **Step 3: Wire the layout**

In `client/src/components/layout.tsx`:
1. Add `import CartAddedToast from "@/components/cart-added-toast";` beside the `CartDrawer` import.
2. Change the cart hook line to `const { setIsOpen: setCartOpen, itemCount, cartPulseKey, consumeCartPulse } = useCart();`.
3. On the mobile dock cart `Button` (the one with `bg-[#C8F45A]`), append `${cartPulseKey > 0 ? "cart-dock-pulse" : ""}` to its `className` and add `onAnimationEnd={() => { if (cartPulseKey > 0) consumeCartPulse(); }}`. (First confirm shadcn `Button` forwards `onAnimationEnd` to the underlying `<button>`; if not, wrap the `Button` in a span carrying the class and handler instead.)
4. Replace the dot badge span with:

```tsx
{itemCount > 0 && (
  <span aria-hidden="true" className="absolute right-2 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#163B33] px-1 text-[10px] font-bold text-[#C8F45A]">
    {itemCount > 99 ? "99+" : itemCount}
  </span>
)}
```

Badge color note: the dock cart button is lime (`#C8F45A`), so the badge is dark green with lime text for contrast (the mockup's yellow badge assumed a dark dock). The existing button `aria-label` already announces the count, hence `aria-hidden` on the visual badge.
5. Render `<CartAddedToast />` immediately after `<CartDrawer />`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test --experimental-strip-types client/src/components/layout.test.ts client/src/components/cart-added-toast.test.ts client/src/contexts/cart-checkout-items.test.ts`
Expected: PASS.

- [ ] **Step 5: Typecheck**

Run: `npm run check`
Expected: clean.

---

### Task 4: Full verification and ship-ready state

**Files:** none (verification only).

- [ ] **Step 1: Run the focused suites**

Run: `npm run check` and `node --test --experimental-strip-types "client/src/**/*.test.ts" "server/*.test.ts" "api/*.test.ts"`.
Expected: tsc clean; record pass/fail counts.

- [ ] **Step 2: Baseline-diff the suite**

Stash changes, rerun the suite on `origin/main`, compare `^✖` lines. Expected: zero new failures. (Known pre-existing reds — homepage copy, catalog sections, `api/orders.test.ts` import resolution — must remain exactly the pre-existing set.)

- [ ] **Step 3: Production build**

Run: `NODE_ENV=production npm run build`.
Expected: exit 0; `git status -s` shows no unexpected modification to `client/src/lib/generated-storefront-products.ts` beyond the live refresh (if the snapshot refreshes, verify 18 products, both new slugs present, no removals).

- [ ] **Step 4: Manual browser pass on http://localhost:5003**

With `npm run dev` running: add from a product card and from a product page; confirm no drawer opens, the capsule appears with the right title/variant, hover pauses it, `View cart` opens the drawer, auto-dismiss pulses the dock badge once on mobile width, and checkout still submits line items. Record results, do not submit a real order.

---

## Self-Review

- Spec coverage: toast content/behavior (Tasks 1–2), mobile dock handoff + persistent badge (Tasks 2–3), desktop placement (Task 2 classes), motion incl. reduced-motion (Tasks 2–3 + CSS), accessibility roles/focus-pause/labels (Task 2), edge cases (single notice, replace-on-new-add, no pulse on manual dismiss, route-change dismiss, badge removal on empty cart via `itemCount > 0` guard, safe-area offset in Task 2 classes), testing (Tasks 1–3 tests + Task 4 gate). All covered.
- Placeholder scan: no TBD/TODO; every step names exact files, code, and commands.
- Type consistency: `CartNotice` field names (`key/itemId/title/size/image/quantityAdded`) match across Task 1 producer and Task 2 consumer; `cartPulseKey/signalCartPulse/consumeCartPulse/dismissNotice/notice` names match across Tasks 1–3 and their tests.
