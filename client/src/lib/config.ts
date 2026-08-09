/**
 * Storefront configuration module.
 *
 * Resolves the merchant handle and API base URL from environment variables
 * and query parameters. The handle identifies which merchant's storefront
 * to render, and the API base URL points to the Merchant-Suite backend.
 */

export interface ShippingZone {
  id: string;
  name: string;
  price: number;
  min_order_amount: number;
  free_above: number | null;
  conditions: unknown[];
}

export interface StorefrontConfig {
  storeName: string;
  tagline: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  backgroundColor: string;
  fontFamily: string;
  contactPhone: string | null;
  contactEmail: string | null;
  socialLinks: {
    facebook: string | null;
    instagram: string | null;
    tiktok: string | null;
  };
  shippingZones: ShippingZone[];
}

/**
 * Resolve the storefront handle.
 * Priority: ?handle=xxx query param (local dev) → VITE_STOREFRONT_HANDLE env var → null
 */
export function getStorefrontHandle(): string | null {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const queryHandle = params.get("handle");
    if (queryHandle) return queryHandle;
  }

  const envHandle = import.meta.env.VITE_STOREFRONT_HANDLE as string | undefined;
  return envHandle || null;
}

/**
 * Resolve the API base URL (without the /api/public/v1/:handle prefix).
 * Falls back to https://merchant-suite.online.
 */
export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL as string | undefined;
  return envUrl?.replace(/\/$/, "") || "https://merchant-suite.online";
}

/**
 * Full API base for public endpoints.
 * e.g. "https://merchant-suite.online/api/public/v1/stepprs"
 */
export function getApiBase(): string {
  const handle = getStorefrontHandle();
  if (!handle) {
    throw new Error(
      "No storefront handle configured. Set VITE_STOREFRONT_HANDLE or use ?handle=xxx query parameter."
    );
  }
  return `${getApiBaseUrl()}/api/public/v1/${handle}`;
}

/**
 * Get the configured bKash number for payment. Returns empty string if not set.
 */
export function getBkashNumber(): string {
  return (import.meta.env.VITE_BKASH_NUMBER as string) || "";
}
