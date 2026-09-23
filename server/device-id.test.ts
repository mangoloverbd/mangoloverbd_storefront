import assert from "node:assert/strict";
import test from "node:test";
import { readOrCreateDeviceId } from "./device-id.ts";

test("reuses a UUID v4 cookie without replacing other response cookies", () => {
  const deviceId = "3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e";
  const headers = new Map<string, string | string[]>([["Set-Cookie", ["session=abc; Path=/"]]]);
  const res = { getHeader: (key: string) => headers.get(key), setHeader: (key: string, value: string | string[]) => { headers.set(key, value); } };
  assert.deepEqual(readOrCreateDeviceId({ headers: { cookie: `other=1; mlbd_did=${deviceId}` } }, res), { deviceId, isNew: false });
  assert.deepEqual(headers.get("Set-Cookie"), ["session=abc; Path=/"]);
});

test("replaces an invalid cookie with a server-issued HttpOnly UUID", () => {
  const headers = new Map<string, string | string[]>([["Set-Cookie", ["session=abc; Path=/"]]]);
  const res = { getHeader: (key: string) => headers.get(key), setHeader: (key: string, value: string | string[]) => { headers.set(key, value); } };
  const result = readOrCreateDeviceId({ headers: { cookie: "mlbd_did=not-a-uuid" } }, res);
  assert.equal(result.isNew, true);
  assert.match(result.deviceId, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.deepEqual(headers.get("Set-Cookie"), ["session=abc; Path=/",
    `mlbd_did=${result.deviceId}; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax`]);
});
