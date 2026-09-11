import assert from "node:assert/strict";
import test from "node:test";
import { Readable } from "node:stream";
import type { IncomingMessage, ServerResponse } from "node:http";

const validCapture = {
  draftKey: "7cb13b8e-b576-4faa-b238-cc8b73059772",
  source: "storefront",
  sourcePath: "/checkout",
  customerName: "Test Customer",
  phone: "01712345678",
  address: "House 1 Road 2 Dhaka",
  items: [{ productName: "Test Honey", variantName: "500 g", quantity: 1, unitPrice: 750 }],
  subtotal: 750,
  deliveryRate: 100,
  total: 850,
};

function createRequest(body?: unknown, rawBody?: string, method = "POST") {
  if (rawBody !== undefined) {
    const request = Readable.from([rawBody]) as IncomingMessage & { body?: unknown };
    request.method = method;
    request.headers = {};
    return request;
  }
  return {
    method,
    headers: {},
    body,
    async *[Symbol.asyncIterator]() {},
  } as unknown as IncomingMessage & { body?: unknown };
}

function createResponse() {
  let rawBody = "";
  const response = {
    statusCode: 0,
    setHeader() {},
    end(chunk?: string) { rawBody = chunk ?? ""; },
  } as unknown as ServerResponse;
  return {
    response,
    read: () => ({ status: response.statusCode, body: JSON.parse(rawBody) }),
  };
}

test("Vercel handler returns a generic non-PII success response after forwarding the capture", async () => {
  const { createAbandonedCartHandler } = await import("./abandoned-carts.ts");
  let forwarded: unknown;
  const handler = createAbandonedCartHandler({
    processCapture: async (capture: unknown) => { forwarded = capture; },
  });
  const { response, read } = createResponse();

  await handler(createRequest(validCapture), response);

  assert.deepEqual(forwarded, { ...validCapture, campaign: {} });
  assert.deepEqual(read(), { status: 202, body: { ok: true } });
  assert.equal(JSON.stringify(read()).includes("Test Customer"), false);
  assert.equal(JSON.stringify(read()).includes("01712345678"), false);
});

test("Vercel forwards only its trusted client IP to the server-side capture processor", async () => {
  const { createAbandonedCartHandler } = await import("./abandoned-carts.ts");
  let forwardedClientIp: unknown;
  const handler = createAbandonedCartHandler({
    processCapture: async (_capture: unknown, context: unknown) => { forwardedClientIp = context; },
  });
  const request = createRequest(validCapture);
  request.headers = { "x-forwarded-for": "203.0.113.42, 10.0.0.1" };
  const { response } = createResponse();

  await handler(request, response);

  assert.deepEqual(forwardedClientIp, { forwardedClientIp: "203.0.113.42" });
});

test("Vercel handler rejects malformed or oversized captures before forwarding", async () => {
  const { createAbandonedCartHandler } = await import("./abandoned-carts.ts");
  let forwarded = 0;
  const handler = createAbandonedCartHandler({
    processCapture: async () => { forwarded += 1; },
  });

  for (const request of [
    createRequest({ ...validCapture, unexpected: true }),
    createRequest(undefined, JSON.stringify({ value: "x".repeat(33 * 1024) })),
  ]) {
    const { response, read } = createResponse();
    await handler(request, response);
    assert.equal(read().body.ok, false);
    assert.equal(JSON.stringify(read()).includes("Test Customer"), false);
  }
  assert.equal(forwarded, 0);
});

test("Vercel handler does not expose an upstream failure or accept another method", async () => {
  const { AbandonedCartUpstreamError } = await import("../server/abandoned-cart-service.ts");
  const { createAbandonedCartHandler } = await import("./abandoned-carts.ts");
  const handler = createAbandonedCartHandler({
    processCapture: async () => { throw new AbandonedCartUpstreamError(); },
  });

  const upstream = createResponse();
  await handler(createRequest(validCapture), upstream.response);
  assert.deepEqual(upstream.read(), {
    status: 502,
    body: { ok: false, message: "Could not save checkout details. Please continue with your order." },
  });

  const method = createResponse();
  await handler(createRequest(validCapture, undefined, "GET"), method.response);
  assert.deepEqual(method.read(), { status: 405, body: { ok: false, message: "Method not allowed" } });
});
