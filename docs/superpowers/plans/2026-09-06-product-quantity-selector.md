# Product Quantity Selector Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a minimum-one, unlimited quantity selector to every product detail page and carry the selected quantity through cart additions, cash-on-delivery checkout, order creation, totals, and analytics.

**Architecture:** Keep quantity state on the existing dynamic product page, because that route renders every product. Extend the checkout bundle with optional quantity and unit-price metadata, then require a positive integer quantity at both order API entry points while preserving `bundlePrice` as the aggregate product subtotal.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, lucide-react, Node.js `node:test`, Zod, Express, Vercel serverless functions

## Global Constraints

- Initial quantity is `1`, minimum quantity is `1`, and there is no maximum.
- The selected quantity applies to both Add to Cart and Cash on Delivery.
- The decrement button is disabled at quantity `1`.
- Quantity resets to `1` when the product slug changes.
- `bundlePrice` remains the aggregate product subtotal: `unit price × quantity`.
- Local Express and Vercel checkout paths must remain behaviorally equivalent.
- Existing cart checkout behavior must remain unchanged.
- Do not add product data, Supabase access, or new dependencies.

---

### Task 1: Product Page Quantity Control and Checkout Bundle

**Files:**
- Modify: `client/src/pages/product.tsx`
- Modify: `client/src/pages/product.test.ts`
- Modify: `client/src/components/order-dialog.tsx`
- Modify: `client/src/pages/google-analytics-wiring.test.ts`

**Interfaces:**
- Consumes: `useCart().addToCart(product, size, quantity)`.
- Produces: `OrderDialogBundle` with optional `quantity?: number` and `unitPrice?: number`; direct product checkout supplies both fields and an aggregate `price`.

- [ ] **Step 1: Write failing product-page tests**

Add source assertions to `client/src/pages/product.test.ts`:

```ts
test("lets customers choose a quantity for cart and direct checkout", () => {
  assert.match(productSource, /const \[quantity, setQuantity\] = useState\(1\)/);
  assert.match(productSource, /aria-label="Decrease quantity"/);
  assert.match(productSource, /disabled=\{quantity === 1\}/);
  assert.match(productSource, /aria-label="Increase quantity"/);
  assert.match(productSource, /Math\.max\(1, current - 1\)/);
  assert.match(productSource, /selectedBundle\.amount \* quantity/);
  assert.match(productSource, /selectedBundle\.title,\s*quantity/);
});
```

Extend `client/src/pages/google-analytics-wiring.test.ts` to assert direct-checkout analytics copy the selected quantity and the order dialog uses bundle quantity and unit price.

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```bash
node --test client/src/pages/product.test.ts client/src/pages/google-analytics-wiring.test.ts
```

Expected: FAIL because quantity state, controls, and checkout metadata do not exist.

- [ ] **Step 3: Implement page-level quantity state and UI**

In `client/src/pages/product.tsx`:

- import Lucide `Minus` and `Plus`;
- add `const [quantity, setQuantity] = useState(1);`;
- reset quantity in the existing slug-change effect;
- render a labelled decrement/value/increment control below the variant selector;
- decrement with `setQuantity((current) => Math.max(1, current - 1))`;
- increment with `setQuantity((current) => current + 1)`;
- pass `quantity` as the third `addToCart` argument;
- build checkout with `price: selectedBundle.amount * quantity`, `quantity`, `unitPrice: selectedBundle.amount`, and `analyticsItems: [{ ...productAnalyticsItem, quantity }]`.

Use visible text for the value rather than a free-form number input so invalid, fractional, or empty client states cannot occur.

- [ ] **Step 4: Extend order dialog calculations**

In `client/src/components/order-dialog.tsx`, extend the bundle type:

```ts
quantity?: number;
unitPrice?: number;
```

Resolve:

```ts
const bundleQuantity = bundle?.quantity ?? 1;
const bundleUnitPrice = bundle?.unitPrice ?? ((bundle?.price ?? 0) / bundleQuantity);
```

Show `bundleQuantity` in the summary badge, POST it, use quantity and unit price in Meta contents, and use them in fallback Google Analytics items. Keep `bundle.price` as checkout subtotal and the free-delivery threshold input.

- [ ] **Step 5: Run focused tests and type-check**

```bash
node --test client/src/pages/product.test.ts client/src/pages/google-analytics-wiring.test.ts
npm run check
```

Expected: PASS.

---

### Task 2: Local Express Quantity Validation and Forwarding

**Files:**
- Modify: `server/order-service.ts`
- Modify: `server/order-service.test.ts`
- Modify: `server/routes.ts`

**Interfaces:**
- Consumes: order JSON with `quantity: number` and aggregate `bundlePrice`.
- Produces: `OrderRequest.quantity`, Merchant Suite webhook quantity, and purchase analytics with unit item price `bundlePrice / quantity`.

- [ ] **Step 1: Write failing schema tests**

Add `quantity: 2` to `validOrder`, then add:

```ts
test("requires a positive whole-number quantity", () => {
  assert.equal(orderRequestSchema.parse(validOrder).quantity, 2);
  assert.throws(() => orderRequestSchema.parse({ ...validOrder, quantity: 0 }));
  assert.throws(() => orderRequestSchema.parse({ ...validOrder, quantity: 1.5 }));
  const { quantity: _quantity, ...withoutQuantity } = validOrder;
  assert.throws(() => orderRequestSchema.parse(withoutQuantity));
});
```

- [ ] **Step 2: Run the schema test and verify RED**

```bash
node --test server/order-service.test.ts
```

Expected: FAIL because the schema does not retain or validate quantity.

- [ ] **Step 3: Implement local validation and forwarding**

Add `quantity: z.number().int().positive()` to `orderRequestSchema`. Forward `order.quantity` instead of hardcoded `1` in `server/order-service.ts`. In `server/routes.ts`, use:

```ts
contents: [{
  id: order.bundleTitle,
  quantity: order.quantity,
  item_price: order.bundlePrice / order.quantity,
}],
```

- [ ] **Step 4: Run local tests and type-check**

```bash
node --test server/order-service.test.ts
npm run check
```

Expected: PASS.

---

### Task 3: Vercel Order API Parity

**Files:**
- Modify: `api/orders.ts`
- Create: `api/orders.test.ts`

**Interfaces:**
- Consumes: the same client order JSON as local Express.
- Produces: exported `validateOrder(body: unknown): OrderRequest`, plus matching webhook and Meta quantity behavior.

- [ ] **Step 1: Write failing Vercel validation tests**

Create `api/orders.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { validateOrder } from "./orders";

const validOrder = {
  bundleTitle: "Test product",
  bundleDetails: "1 kg",
  bundlePrice: 1500,
  quantity: 3,
  deliveryCharge: 100,
  customerName: "Test Customer",
  phone: "01712345678",
  address: "House 1 Road 2 Dhaka",
  paymentMethod: "cash_on_delivery",
};

test("retains a positive whole-number quantity", () => {
  assert.equal(validateOrder(validOrder).quantity, 3);
});

test("rejects invalid quantities", () => {
  const { quantity: _quantity, ...withoutQuantity } = validOrder;
  assert.throws(() => validateOrder(withoutQuantity));
  for (const quantity of [0, -1, 1.5]) {
    assert.throws(() => validateOrder({ ...validOrder, quantity }));
  }
});
```

- [ ] **Step 2: Run the API test and verify RED**

```bash
node --test api/orders.test.ts
```

Expected: FAIL because `validateOrder` is not exported and quantity is absent.

- [ ] **Step 3: Implement Vercel validation and forwarding**

Add `quantity` to `OrderRequest`, export `validateOrder`, parse it with `Number(order.quantity)`, reject unless it is an integer of at least `1`, and return it. Forward `order.quantity` to the Merchant Suite and use quantity with `bundlePrice / quantity` in Meta purchase contents. Keep total as `bundlePrice + deliveryCharge`.

- [ ] **Step 4: Run API tests and type-check**

```bash
node --test api/orders.test.ts
npm run check
```

Expected: PASS.

---

### Task 4: Full Verification

**Files:**
- Verify only; do not intentionally modify the generated product snapshot.

**Interfaces:**
- Consumes: all completed feature changes.
- Produces: test, type-check, build, and worktree evidence.

- [ ] **Step 1: Run all source tests**

```bash
node --test client/src/**/*.test.ts server/**/*.test.ts api/**/*.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run TypeScript checks**

```bash
npm run check
```

Expected: PASS.

- [ ] **Step 3: Run production build**

```bash
npm run build
```

Expected: PASS. If the live catalog is unavailable, the build may retain the existing snapshot.

- [ ] **Step 4: Inspect final worktree**

```bash
git diff --check
git status --short
```

Expected: no whitespace errors and no unrelated generated-catalog changes.
