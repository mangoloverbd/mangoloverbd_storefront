import { createHmac } from "node:crypto";
import type { IncomingHttpHeaders } from "node:http";
import { isIP } from "node:net";

export const CLIENT_CONTEXT_HEADER = "x-mlbd-client-context";
export type PastedField = "name" | "phone" | "address";
export type CheckoutTelemetryInput = {
  firstInteractionAt?: string;
  phoneCandidates?: string[];
  pastedFields?: PastedField[];
};
export type ClientContextV1 = {
  v: 1;
  issuedAt: string;
  ip: string;
  userAgent: string | null;
  geo: { country: string | null; region: string | null; city: string | null };
  deviceId: string | null;
  fingerprint: string | null;
  telemetry: { firstInteractionAt: string | null; phoneCandidates: string[]; pastedFields: PastedField[] };
};

type Request = { headers: IncomingHttpHeaders; socket?: { remoteAddress?: string } };
type Input = { deviceId: string | null; fingerprint?: string | null; telemetry?: CheckoutTelemetryInput | null; now?: number };

function header(req: Request, name: string): string | undefined {
  const value = req.headers[name];
  return Array.isArray(value) ? value[0] : value;
}

function bounded(value: string | undefined, max: number): string | null {
  return value?.trim().slice(0, max) || null;
}

function geo(value: string | undefined): string | null {
  if (!value) return null;
  try { return bounded(decodeURIComponent(value), 80); } catch { return bounded(value, 80); }
}

export function parseCheckoutTelemetry(value: unknown): CheckoutTelemetryInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const data = value as Record<string, unknown>;
  const result: CheckoutTelemetryInput = {};
  if (data.firstInteractionAt !== undefined) {
    if (typeof data.firstInteractionAt !== "string" || data.firstInteractionAt.length > 64
      || !Number.isFinite(Date.parse(data.firstInteractionAt))) return null;
    result.firstInteractionAt = data.firstInteractionAt;
  }
  if (data.phoneCandidates !== undefined) {
    if (!Array.isArray(data.phoneCandidates) || data.phoneCandidates.length > 5
      || !data.phoneCandidates.every((phone) => typeof phone === "string" && /^\d{11}$/.test(phone))) return null;
    result.phoneCandidates = Array.from(new Set(data.phoneCandidates as string[]));
  }
  if (data.pastedFields !== undefined) {
    if (!Array.isArray(data.pastedFields) || data.pastedFields.length > 3
      || !data.pastedFields.every((field) => field === "name" || field === "phone" || field === "address")) return null;
    result.pastedFields = Array.from(new Set(data.pastedFields as PastedField[]));
  }
  return result;
}

export function buildClientContext(req: Request, input: Input): ClientContextV1 | null {
  let ip: string | null = null;
  for (const name of ["x-vercel-forwarded-for", "x-real-ip", "x-forwarded-for"]) {
    const candidate = header(req, name)?.split(",")[0]?.trim();
    if (candidate && isIP(candidate)) { ip = candidate; break; }
  }
  if (!ip && req.socket?.remoteAddress) {
    const peer = req.socket.remoteAddress.replace(/^::ffff:/, "");
    if (isIP(peer)) ip = peer;
  }
  if (!ip) return null;
  const telemetry = input.telemetry ?? {};
  return {
    v: 1,
    issuedAt: new Date(input.now ?? Date.now()).toISOString(),
    ip,
    userAgent: bounded(header(req, "user-agent"), 400),
    geo: {
      country: geo(header(req, "x-vercel-ip-country")),
      region: geo(header(req, "x-vercel-ip-country-region")),
      city: geo(header(req, "x-vercel-ip-city")),
    },
    deviceId: input.deviceId,
    fingerprint: input.fingerprint && /^[0-9a-f]{64}$/.test(input.fingerprint) ? input.fingerprint : null,
    telemetry: {
      firstInteractionAt: telemetry.firstInteractionAt ?? null,
      phoneCandidates: telemetry.phoneCandidates ?? [],
      pastedFields: telemetry.pastedFields ?? [],
    },
  };
}

export function signClientContext(context: ClientContextV1, secret: string): string {
  const payload = Buffer.from(JSON.stringify(context)).toString("base64url");
  return `${payload}.${createHmac("sha256", secret).update(payload).digest("hex")}`;
}

export function createSignedClientContext(req: Request, input: Input, secret?: string): string | undefined {
  if (!secret || secret.length < 32) return undefined;
  const context = buildClientContext(req, input);
  return context ? signClientContext(context, secret) : undefined;
}
