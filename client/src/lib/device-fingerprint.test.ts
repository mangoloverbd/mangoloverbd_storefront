import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { collectFingerprintTraits, computeDeviceFingerprint, hashTraits } from "./device-fingerprint.ts";

test("fingerprint is stable across key insertion order", async () => {
  const expected = createHash("sha256").update('{"a":1,"b":{"x":2,"y":3}}').digest("hex");
  assert.equal(await hashTraits({ b: { y: 3, x: 2 }, a: 1 }), expected);
  assert.equal(await hashTraits({ a: 1, b: { x: 2, y: 3 } }), expected);
});

test("browser trait collection is guarded in server rendering", async () => {
  assert.equal(typeof collectFingerprintTraits(), "object");
  assert.match(await computeDeviceFingerprint() ?? "", /^[0-9a-f]{64}$/);
});
