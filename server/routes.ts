import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { processOrder, orderRequestSchema } from "./order-service";
import { getMetaUserDataFromRequest, sendMetaCapiEvent } from "./meta-capi";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/meta", async (req, res, next) => {
    try {
      const body = req.body as {
        event_name?: string;
        event_id?: string;
        event_source_url?: string;
        user_data?: {
          fbp?: string;
          fbc?: string;
          external_id?: string;
        };
        custom_data?: Record<string, unknown>;
      };

      if (!body?.event_name) {
        res.status(400).json({ message: "event_name is required" });
        return;
      }

      const result = await sendMetaCapiEvent({
        event_name: body.event_name,
        event_id: body.event_id,
        event_source_url: body.event_source_url,
        user_data: getMetaUserDataFromRequest({
          headers: req.headers as unknown as Record<string, unknown>,
          eventSourceUrl: body.event_source_url,
          browserUserData: body.user_data,
        }),
        custom_data: body.custom_data ?? {},
      });

      res.status(200).json({ ok: true, result });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/orders", async (req, res, next) => {
    try {
      const order = orderRequestSchema.parse(req.body);
      const result = await processOrder(order);

      // Fire-and-forget Purchase CAPI (do not block checkout).
      void sendMetaCapiEvent({
        event_name: "Purchase",
        event_id: (req.body as any)?.metaEventId,
        event_source_url: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
        user_data: getMetaUserDataFromRequest({
          headers: req.headers as unknown as Record<string, unknown>,
          customerName: order.customerName,
          phone: order.phone,
        }),
        custom_data: {
          currency: "BDT",
          value: order.bundlePrice + order.deliveryCharge,
          content_type: "product",
          contents: [{ id: order.bundleTitle, quantity: 1, item_price: order.bundlePrice }],
          order_id: result.orderRef,
        },
      }).catch((error) => {
        console.error("Meta Purchase CAPI failed:", error);
      });

      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Invalid order details",
          errors: error.flatten().fieldErrors,
        });
        return;
      }

      next(error);
    }
  });

  return httpServer;
}
