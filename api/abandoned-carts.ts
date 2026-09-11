import type { IncomingMessage, ServerResponse } from "node:http";
import { isIP } from "node:net";
import {
  AbandonedCartUpstreamError,
  AbandonedCartValidationError,
  parseAbandonedCartCapture,
  processAbandonedCartCapture,
  type AbandonedCartCapture,
} from "../server/abandoned-cart-service.ts";

const MAX_REQUEST_BYTES = 32 * 1024;

class RequestBodyError extends Error {
  constructor(readonly statusCode: 400 | 413) {
    super(statusCode === 413 ? "Request body too large" : "Invalid request body");
  }
}

type CaptureHandlerDependencies = {
  processCapture?: (
    capture: AbandonedCartCapture,
    context?: { forwardedClientIp?: string },
  ) => Promise<void>;
};

function getVercelClientIp(req: IncomingMessage) {
  const forwardedFor = req.headers["x-forwarded-for"];
  const value = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
  const clientIp = value?.split(",")[0]?.trim();
  return clientIp && isIP(clientIp) ? clientIp : undefined;
}

function byteLength(value: unknown) {
  try {
    return Buffer.byteLength(JSON.stringify(value));
  } catch {
    throw new RequestBodyError(400);
  }
}

async function readBody(req: IncomingMessage & { body?: unknown }) {
  if (req.body !== undefined) {
    if (byteLength(req.body) > MAX_REQUEST_BYTES) throw new RequestBodyError(413);
    return req.body;
  }

  const contentLength = Number(req.headers["content-length"]);
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    throw new RequestBodyError(413);
  }

  const chunks: Buffer[] = [];
  let receivedBytes = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    receivedBytes += buffer.length;
    if (receivedBytes > MAX_REQUEST_BYTES) throw new RequestBodyError(413);
    chunks.push(buffer);
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");
  try {
    return rawBody ? JSON.parse(rawBody) : {};
  } catch {
    throw new RequestBodyError(400);
  }
}

function sendJson(res: ServerResponse, statusCode: number, body: unknown) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

export function createAbandonedCartHandler(dependencies: CaptureHandlerDependencies = {}) {
  const processCapture = dependencies.processCapture
    ?? ((capture: AbandonedCartCapture, context?: { forwardedClientIp?: string }) => processAbandonedCartCapture(capture, {
      forwardedClientIp: context?.forwardedClientIp,
    }));

  return async function handler(
    req: IncomingMessage & { body?: unknown },
    res: ServerResponse,
  ) {
    if (req.method !== "POST") {
      sendJson(res, 405, { ok: false, message: "Method not allowed" });
      return;
    }

    try {
      const capture = parseAbandonedCartCapture(await readBody(req));
      await processCapture(capture, { forwardedClientIp: getVercelClientIp(req) });
      sendJson(res, 202, { ok: true });
    } catch (error) {
      if (error instanceof RequestBodyError) {
        sendJson(res, error.statusCode, { ok: false, message: "Invalid checkout details" });
        return;
      }
      if (error instanceof AbandonedCartValidationError) {
        sendJson(res, 400, { ok: false, message: "Invalid checkout details" });
        return;
      }
      if (error instanceof AbandonedCartUpstreamError) {
        sendJson(res, 502, { ok: false, message: "Could not save checkout details. Please continue with your order." });
        return;
      }
      sendJson(res, 500, { ok: false, message: "Could not save checkout details. Please continue with your order." });
    }
  };
}

export default createAbandonedCartHandler();
