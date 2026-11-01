import assert from "node:assert/strict";
import test from "node:test";
import { apiRequest } from "./queryClient.ts";
import {
  CHECKOUT_FAILURE_MESSAGES,
  CheckoutConnectionError,
  OrderRefusedError,
  RATE_LIMIT_MESSAGE,
  checkoutFailureMessage,
} from "./checkout-errors.ts";

async function failureFor(respond: () => Promise<Response>): Promise<unknown> {
  const original = globalThis.fetch;
  globalThis.fetch = respond as typeof fetch;
  try {
    await apiRequest("POST", "/api/orders", {});
  } catch (error) {
    return error;
  } finally {
    globalThis.fetch = original;
  }
  throw new Error("expected the request to fail");
}

const json = (body: unknown, status: number) => async () => new Response(JSON.stringify(body), { status });

test("a refusal code from the Suite becomes its specific message", async () => {
  for (const code of ["out_of_stock", "product_unavailable", "shipping_unavailable"] as const) {
    const error = await failureFor(json({ message: "Order refused", code }, 409));
    assert.ok(error instanceof OrderRefusedError);
    assert.equal(checkoutFailureMessage(error), CHECKOUT_FAILURE_MESSAGES[code]);
  }
});

test("a dropped connection says to check the connection, not that the details are fine", async () => {
  const error = await failureFor(async () => { throw new TypeError("Load failed"); });
  assert.ok(error instanceof CheckoutConnectionError);
  assert.equal(checkoutFailureMessage(error), CHECKOUT_FAILURE_MESSAGES.connection);
  assert.equal(checkoutFailureMessage(new CheckoutConnectionError()), CHECKOUT_FAILURE_MESSAGES.connection);
});

test("rate limiting keeps its wait message and other failures read as a server problem", async () => {
  assert.equal(checkoutFailureMessage(await failureFor(json({ message: "slow down" }, 429))), RATE_LIMIT_MESSAGE);
  assert.equal(checkoutFailureMessage(await failureFor(json({ message: "Could not confirm order." }, 502))), CHECKOUT_FAILURE_MESSAGES.server);
  assert.equal(checkoutFailureMessage(await failureFor(json({ code: "something_else" }, 409))), CHECKOUT_FAILURE_MESSAGES.server);
  assert.equal(checkoutFailureMessage(new Error("Customer details are invalid")), CHECKOUT_FAILURE_MESSAGES.server);
});
