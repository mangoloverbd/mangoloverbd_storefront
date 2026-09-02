import { z } from "zod";
import { randomInt } from "crypto";

const normalizePhoneDigits = (value: string) => value
  .replace(/[০-৯]/g, (digit) => String("০১২৩৪৫৬৭৮৯".indexOf(digit)))
  .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));

const addressWordCount = (value: string) => value.trim().split(/\s+/).filter(Boolean).length;

export const orderRequestSchema = z.object({
  bundleTitle: z.string().min(1),
  bundleDetails: z.string().min(1),
  bundlePrice: z.number().int().positive(),
  deliveryCharge: z.number().int().nonnegative(),
  customerName: z.string().min(2).max(120),
  phone: z.string().transform(normalizePhoneDigits).pipe(z.string().min(6).max(30)),
  address: z.string().min(5).max(500),
  paymentMethod: z.enum(["cash_on_delivery", "bkash"]).default("cash_on_delivery"),
  bkashTrxId: z.string().trim().max(80).optional().default(""),
}).refine(
  (order) => order.paymentMethod !== "bkash" || order.bkashTrxId.length > 0,
  {
    message: "bKash reference ID is required",
    path: ["bkashTrxId"],
  },
).refine(
  (order) => addressWordCount(order.address) >= 3,
  {
    message: "Address must contain at least three words",
    path: ["address"],
  },
);

export type OrderRequest = z.infer<typeof orderRequestSchema>;

const configuredMerchantSuiteUrl = (process.env.MERCHANT_SUITE_URL ?? "").replace(/\/$/, "");
const MERCHANT_SUITE_URL = process.env.NODE_ENV === "production"
  ? "https://admin.mangolover.com.bd"
  : configuredMerchantSuiteUrl;
if (!MERCHANT_SUITE_URL) {
  throw new Error("MERCHANT_SUITE_URL environment variable is not set");
}
const CUSTOM_ORDERS_API_KEY = process.env.CUSTOM_ORDERS_API_KEY ?? "stepprsbangladesh-098765";

function createOrderRef() {
  const timestamp = Date.now().toString().slice(-8);
  const suffix = randomInt(100, 1000).toString();

  return `#${timestamp}${suffix}`;
}

export async function processOrder(order: OrderRequest) {
  const total = order.bundlePrice + order.deliveryCharge;
  let orderRef = "";

  try {
    const response = await fetch(`${MERCHANT_SUITE_URL}/api/custom-orders/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CUSTOM_ORDERS_API_KEY
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
