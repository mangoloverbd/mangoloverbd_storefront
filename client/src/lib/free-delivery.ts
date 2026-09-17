export const FREE_DELIVERY_PRODUCT_IDS = ["814979aa-8446-429b-917f-e6d94cf6b334"];
export const FREE_DELIVERY_PRODUCT_SLUGS = ["black-seed-flower-honey"];
const FREE_DELIVERY_PRODUCT_NAME_FRAGMENT = "কালোজিরা ফুলের মধু";

export type FreeDeliveryBundle = {
  title?: string | null;
  productId?: string | null;
  productSlug?: string | null;
} | null | undefined;

export function bundleHasFreeDeliveryProduct(bundle: FreeDeliveryBundle): boolean {
  if (!bundle || typeof bundle !== "object") return false;
  if (bundle.productId != null && FREE_DELIVERY_PRODUCT_IDS.includes(String(bundle.productId))) return true;
  const slug = String(bundle.productSlug ?? "").toLowerCase();
  if (slug && FREE_DELIVERY_PRODUCT_SLUGS.some((s) => slug.includes(s))) return true;
  const title = String(bundle.title ?? "");
  if (!title) return false;
  if (FREE_DELIVERY_PRODUCT_SLUGS.some((s) => title.toLowerCase().includes(s))) return true;
  return title.includes(FREE_DELIVERY_PRODUCT_NAME_FRAGMENT);
}
