import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import {
  OrderUpstreamError,
  processOrder,
  orderRequestSchema,
  type OrderRequest,
} from "./order-service.ts";
import { OrderProtectionError, type OrderProcessResult } from "./order-protection-errors.ts";
import { createSignedClientContext } from "./client-context.ts";
import { readOrCreateDeviceId } from "./device-id.ts";
import {
  AbandonedCartUpstreamError,
  AbandonedCartValidationError,
  parseAbandonedCartCapture,
  processAbandonedCartCapture,
} from "./abandoned-cart-service.ts";

type RouteDependencies = {
  processOrder?: (order: OrderRequest, options?: { clientContextHeader?: string }) => Promise<OrderProcessResult>;
  processAbandonedCartCapture?: typeof processAbandonedCartCapture;
};

export async function registerRoutes(
  httpServer: Server,
  app: Express,
  dependencies: RouteDependencies = {},
): Promise<Server> {
  const submitOrder = dependencies.processOrder ?? processOrder;
  const processCapture = dependencies.processAbandonedCartCapture ?? processAbandonedCartCapture;

  app.post("/api/abandoned-carts", async (req, res, next) => {
    const { deviceId } = readOrCreateDeviceId(req, res);
    try {
      const capture = parseAbandonedCartCapture(req.body);
      const clientContextHeader = createSignedClientContext(req, { deviceId, fingerprint: null, telemetry: {} }, process.env.STOREFRONT_CONTEXT_SECRET);
      await processCapture(capture, clientContextHeader ? { clientContextHeader } : {});
      res.status(202).json({ ok: true });
    } catch (error) {
      if (error instanceof AbandonedCartValidationError) {
        res.status(400).json({ ok: false, message: "Invalid checkout details" });
        return;
      }
      if (error instanceof AbandonedCartUpstreamError) {
        res.status(502).json({ ok: false, message: "Could not save checkout details. Please continue with your order." });
        return;
      }
      next(error);
    }
  });

  app.post("/api/orders", async (req, res, next) => {
    const { deviceId } = readOrCreateDeviceId(req, res);
    try {
      const order = orderRequestSchema.parse(req.body);
      const clientContextHeader = createSignedClientContext(req, {
        deviceId, fingerprint: order.deviceFingerprint, telemetry: order.checkoutTelemetry,
      }, process.env.STOREFRONT_CONTEXT_SECRET);
      const result = await submitOrder(order, clientContextHeader ? { clientContextHeader } : {});
      const decision = result.decision ?? "allow";
      const orderRef = "orderRef" in result ? String(result.orderRef ?? "") : "";

      if (decision === "review") {
        res.status(202).json({ decision: "review", reviewId: "reviewId" in result ? result.reviewId : "" });
        return;
      }
      res.status(201).json({ orderRef, decision: "allow" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Invalid order details",
        });
        return;
      }

      if (error instanceof OrderUpstreamError) {
        res.status(502).json({ message: "Could not confirm order. Please try again." });
        return;
      }
      if (error instanceof OrderProtectionError) {
        res.status(error.statusCode).json({ message: error.message, decision: error.decision, retryable: error.retryable });
        return;
      }

      next(error);
    }
  });

  return httpServer;
}
