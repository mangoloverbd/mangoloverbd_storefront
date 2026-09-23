import assert from "node:assert/strict";
import test from "node:test";
import { apiRequest } from "./queryClient.ts";

test("rate-limited checkout tells the customer to wait rather than showing raw JSON", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ message: "অনেকবার চেষ্টা হয়েছে। একটু পরে আবার চেষ্টা করুন।" }), { status: 429 });
  try {
    await assert.rejects(() => apiRequest("POST", "/api/orders", {}), (error: unknown) =>
      error instanceof Error && error.message === "অনেকবার চেষ্টা হয়েছে। একটু পরে আবার চেষ্টা করুন।");
  } finally {
    globalThis.fetch = original;
  }
});
