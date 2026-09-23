import assert from "node:assert/strict";
import test from "node:test";
import { createHmac } from "node:crypto";
import { buildClientContext, createSignedClientContext, parseCheckoutTelemetry, signClientContext } from "./client-context.ts";

const secret = "test-context-secret-0123456789abcdef";
const deviceId = "3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e";
const now = Date.parse("2026-09-23T10:00:00.000Z");

test("signs the shared context with ordered JSON and HMAC", () => {
  const context = buildClientContext({ headers: {
    "x-vercel-forwarded-for": "103.12.44.7", "user-agent": "Chrome/128",
    "x-vercel-ip-country": "BD", "x-vercel-ip-country-region": "C", "x-vercel-ip-city": "Dhaka",
  } }, { deviceId, fingerprint: "a".repeat(64), telemetry: { phoneCandidates: ["01712345678"] }, now });
  assert.deepEqual(context, {
    v: 1, issuedAt: "2026-09-23T10:00:00.000Z", ip: "103.12.44.7", userAgent: "Chrome/128",
    geo: { country: "BD", region: "C", city: "Dhaka" }, deviceId, fingerprint: "a".repeat(64),
    telemetry: { firstInteractionAt: null, phoneCandidates: ["01712345678"], pastedFields: [] },
  });
  const encoded = Buffer.from(JSON.stringify(context)).toString("base64url");
  assert.equal(signClientContext(context!, secret), `${encoded}.${createHmac("sha256", secret).update(encoded).digest("hex")}`);
});

test("selects a valid proxy IP and never trusts cf-connecting-ip", () => {
  const context = buildClientContext({ headers: {
    "x-vercel-forwarded-for": "invalid", "x-real-ip": "103.12.44.7",
    "cf-connecting-ip": "8.8.8.8", "x-vercel-ip-city": "Cox%27s%20Bazar", "user-agent": "U".repeat(500),
  } }, { deviceId, now });
  assert.equal(context?.ip, "103.12.44.7");
  assert.equal(context?.geo.city, "Cox's Bazar");
  assert.equal(context?.userAgent?.length, 400);
  assert.equal(buildClientContext({ headers: { "cf-connecting-ip": "8.8.8.8" } }, { deviceId }), null);
  assert.equal(createSignedClientContext({ headers: { "x-real-ip": "103.12.44.7" } }, { deviceId }, "short"), undefined);
});

test("rejects malformed telemetry and bounds valid candidates", () => {
  assert.deepEqual(parseCheckoutTelemetry({ phoneCandidates: ["01712345678", "01712345678"], pastedFields: ["phone", "phone"] }),
    { phoneCandidates: ["01712345678"], pastedFields: ["phone"] });
  for (const invalid of [{ phoneCandidates: ["123"] }, { phoneCandidates: Array(6).fill("01712345678") },
    { pastedFields: ["email"] }, { firstInteractionAt: "yesterday" }]) {
    assert.equal(parseCheckoutTelemetry(invalid), null);
  }
});

test("uses the socket peer IP for local Express requests without proxy headers", () => {
  const context = buildClientContext({ headers: {}, socket: { remoteAddress: "::ffff:127.0.0.1" } }, { deviceId, now });
  assert.equal(context?.ip, "127.0.0.1");
  assert.ok(createSignedClientContext({ headers: {}, socket: { remoteAddress: "127.0.0.1" } }, { deviceId }, secret));
});
