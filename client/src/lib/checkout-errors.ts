import type { OrderRefusalCode } from "../../../shared/order-refusal.ts";

// What the customer sees when an order cannot be sent. Every checkout maps its
// failure through checkoutFailureMessage, so no failure claims the details are fine.
export const CHECKOUT_FAILURE_MESSAGES = {
  out_of_stock: "দুঃখিত, এই প্যাকটি এইমাত্র শেষ হয়ে গেছে। অন্য প্যাক বেছে নিন বা WhatsApp-এ যোগাযোগ করুন।",
  product_unavailable: "এই প্যাকটি এখন পাওয়া যাচ্ছে না। পেজটি রিফ্রেশ করে আবার চেষ্টা করুন।",
  shipping_unavailable: "ডেলিভারি চার্জ হিসাব করা যায়নি। পেজটি রিফ্রেশ করে আবার চেষ্টা করুন।",
  connection: "ইন্টারনেট সংযোগে সমস্যা হয়েছে। সংযোগ দেখে আবার চেষ্টা করুন।",
  server: "সার্ভারে সাময়িক সমস্যা। কিছুক্ষণ পর আবার চেষ্টা করুন বা কল/WhatsApp করুন।",
} as const;

export const RATE_LIMIT_MESSAGE = "অনেকবার চেষ্টা হয়েছে। একটু পরে আবার চেষ্টা করুন।";

/** The Merchant Suite refused the order for a reason the customer can act on. */
export class OrderRefusedError extends Error {
  readonly code: OrderRefusalCode;

  constructor(code: OrderRefusalCode) {
    super(code);
    this.name = "OrderRefusedError";
    this.code = code;
  }
}

/** The request never got an answer: the customer's connection, or the last price/stock check, failed. */
export class CheckoutConnectionError extends Error {
  constructor() {
    super("checkout-connection-failed");
    this.name = "CheckoutConnectionError";
  }
}

export function checkoutFailureMessage(error: unknown): string {
  if (error instanceof OrderRefusedError) return CHECKOUT_FAILURE_MESSAGES[error.code];
  if (error instanceof CheckoutConnectionError) return CHECKOUT_FAILURE_MESSAGES.connection;
  if (error instanceof Error && error.message === RATE_LIMIT_MESSAGE) return RATE_LIMIT_MESSAGE;
  return CHECKOUT_FAILURE_MESSAGES.server;
}
