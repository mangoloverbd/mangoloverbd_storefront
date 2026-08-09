import type { Express } from "express";
import { createServer, type Server } from "http";
import { getMetaUserDataFromRequest, sendMetaCapiEvent } from "./meta-capi";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Meta CAPI proxy — client-initiated server-side events (ViewContent, AddToCart, InitiateCheckout)
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

  // Orders are now submitted directly to the Merchant-Suite public API
  // (POST /api/public/v1/:handle/orders) from the browser — no server proxy needed.

  return httpServer;
}
