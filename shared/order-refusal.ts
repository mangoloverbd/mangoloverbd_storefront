// Reasons the Merchant Suite gives (as `code`) when it refuses an order, passed
// through to the browser so the customer sees why instead of a generic failure.
export const ORDER_REFUSAL_CODES = ["out_of_stock", "product_unavailable", "shipping_unavailable"] as const;

export type OrderRefusalCode = (typeof ORDER_REFUSAL_CODES)[number];

export function isOrderRefusalCode(value: unknown): value is OrderRefusalCode {
  return typeof value === "string" && (ORDER_REFUSAL_CODES as readonly string[]).includes(value);
}
