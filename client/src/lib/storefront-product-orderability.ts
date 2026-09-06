import type { StorefrontProduct } from "./storefront-products.ts";

export function isProductOrderable(product: StorefrontProduct | null | undefined) {
  if (!product || product.available === false) {
    return false;
  }

  if (typeof product.stock_quantity === "number" && product.stock_quantity <= 0) {
    return false;
  }

  if (product.variants?.length) {
    return product.variants.some((variant) => {
      if (variant.available === false) {
        return false;
      }

      return typeof variant.stock_quantity !== "number" || variant.stock_quantity > 0;
    });
  }

  return true;
}
