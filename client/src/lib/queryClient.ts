import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { OrderProtectionError } from "./order-protection-errors";
import { CheckoutConnectionError, OrderRefusedError, RATE_LIMIT_MESSAGE } from "./checkout-errors";
import { isOrderRefusalCode } from "../../../shared/order-refusal";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    try {
      const body = JSON.parse(text) as { decision?: unknown; retryable?: unknown; code?: unknown };
      if (body.decision === "block") {
        throw new OrderProtectionError("block", body.retryable === true, res.status);
      }
      if (isOrderRefusalCode(body.code)) throw new OrderRefusedError(body.code);
      if (res.status === 429) {
        throw new Error(RATE_LIMIT_MESSAGE);
      }
    } catch (error) {
      if (error instanceof OrderProtectionError || error instanceof OrderRefusedError || (res.status === 429 && error instanceof Error
        && error.message === RATE_LIMIT_MESSAGE)) throw error;
    }
    throw new Error(`${res.status}: ${text || res.statusText}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });
  } catch {
    // No response at all: the customer's connection dropped.
    throw new CheckoutConnectionError();
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
