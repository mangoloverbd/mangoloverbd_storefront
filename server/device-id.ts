import { randomUUID } from "node:crypto";
import type { IncomingHttpHeaders, OutgoingHttpHeader } from "node:http";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function readOrCreateDeviceId(
  req: { headers: IncomingHttpHeaders },
  res: { getHeader(name: string): OutgoingHttpHeader | undefined; setHeader(name: string, value: string | string[]): unknown },
): { deviceId: string; isNew: boolean } {
  const part = req.headers.cookie?.split(";").find((entry) => entry.trim().startsWith("mlbd_did="));
  const current = part?.trim().slice("mlbd_did=".length);
  if (current && UUID_V4.test(current)) return { deviceId: current.toLowerCase(), isNew: false };

  const deviceId = randomUUID();
  const cookie = `mlbd_did=${deviceId}; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax`;
  const existing = res.getHeader("Set-Cookie");
  const cookies = existing === undefined ? [] : Array.isArray(existing) ? existing.map(String) : [String(existing)];
  res.setHeader("Set-Cookie", [...cookies, cookie]);
  return { deviceId, isNew: true };
}
