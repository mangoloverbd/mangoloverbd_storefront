import { z } from "zod";
import { randomInt } from "crypto";

export const orderRequestSchema = z.object({
  bundleTitle: z.string().min(1),
  bundleDetails: z.string().min(1),
  bundlePrice: z.number().int().positive(),
  deliveryCharge: z.number().int().nonnegative(),
  customerName: z.string().min(2).max(120),
  phone: z.string().min(6).max(30),
  address: z.string().min(5).max(500),
  paymentMethod: z.enum(["cash_on_delivery", "bkash"]).default("cash_on_delivery"),
  bkashTrxId: z.string().trim().max(80).optional().default(""),
}).refine(
  (order) => order.paymentMethod !== "bkash" || order.bkashTrxId.length > 0,
  {
    message: "bKash reference ID is required",
    path: ["bkashTrxId"],
  },
);

export type OrderRequest = z.infer<typeof orderRequestSchema>;

function createOrderRef() {
  const timestamp = Date.now().toString().slice(-8);
  const suffix = randomInt(100, 1000).toString();

  return `#${timestamp}${suffix}`;
}

export async function processOrder(order: OrderRequest) {
  const total = order.bundlePrice + order.deliveryCharge;
  let orderRef = "";

  try {
    const response = await fetch("https://suite.arclabtechnology.com/api/custom-orders/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "stepprsbangladesh-098765"
      },
      body: JSON.stringify({
        // We no longer send order_id, the dashboard generates it!
        customer_name: order.customerName,
        phone: order.phone,
        address: order.address,
        product: `${order.bundleTitle} - ${order.bundleDetails}`,
        quantity: 1,
        price: order.bundlePrice,
        delivery_rate: order.deliveryCharge
      })
    });

    if (!response.ok) {
      throw new Error(`Dashboard returned status ${response.status}`);
    }

    // Try to parse the JSON response from the dashboard
    const data = await response.json().catch(() => ({}));
    
    // Check if the dashboard returned the new sequential ID
    if (data && data.order_id) {
      orderRef = data.order_id;
    } else {
      // Fallback: If the developer hasn't updated the dashboard yet, or it didn't return an ID
      orderRef = createOrderRef();
      console.warn("Dashboard didn't return an order_id. Used fallback:", orderRef);
    }
  } catch (webhookErr) {
    console.error("Webhook failed:", webhookErr);
    // Fallback: If the dashboard is completely down or returns a 500 error
    orderRef = createOrderRef();
  }

  return { orderRef, order: { ...order, total, status: "confirmed" } };
}
