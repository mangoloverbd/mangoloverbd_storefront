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

test("collects WebGL on its own canvas after drawing 2D text", () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "document");
  let created = 0;
  Object.defineProperty(globalThis, "document", { configurable: true, value: {
    createElement: () => {
      created++;
      const twoDimensional = { font: "", fillText: () => {} };
      return { getContext: (kind: string) => kind === "2d" ? twoDimensional : created > 1 ? {
        getExtension: () => ({}), getParameter: () => "renderer",
      } : null, toDataURL: () => "canvas" };
    },
  } });
  try {
    assert.deepEqual(collectFingerprintTraits().webgl, { vendor: "renderer", renderer: "renderer" });
    assert.equal(created, 2);
  } finally {
    if (previous) Object.defineProperty(globalThis, "document", previous);
    else Reflect.deleteProperty(globalThis, "document");
  }
});
