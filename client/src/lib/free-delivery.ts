export const FREE_DELIVERY_PRODUCT_IDS = [
  "814979aa-8446-429b-917f-e6d94cf6b334",
  "11043874-e90d-4160-bce7-38723b703706",
];
export const FREE_DELIVERY_PRODUCT_SLUGS = ["black-seed-flower-honey", "litchi-flower-honey"];
const FREE_DELIVERY_PRODUCT_NAME_FRAGMENTS = ["কালোজিরা ফুলের মধু", "লিচু ফুলের মধু"];
const LITCHI_FLOWER_HONEY_PRODUCT_ID = "11043874-e90d-4160-bce7-38723b703706";
const LITCHI_FLOWER_HONEY_SLUG = "litchi-flower-honey";
const LITCHI_FLOWER_HONEY_NAME_FRAGMENT = "লিচু ফুলের মধু";
type FreeDeliveryCandidate = { productId?: unknown; productSlug?: unknown; title?: unknown };

export type FreeDeliveryBundle = {
  title?: string | null;
  productId?: string | null;
  productSlug?: string | null;
  captureItems?: Array<{ productName?: string | null }>;
} | null | undefined;

function candidateHasFreeDeliveryProduct(candidate: FreeDeliveryCandidate) {
  if (candidate.productId != null && FREE_DELIVERY_PRODUCT_IDS.includes(String(candidate.productId))) return true;
  const slug = String(candidate.productSlug ?? "").toLowerCase();
  if (slug && FREE_DELIVERY_PRODUCT_SLUGS.some((value) => slug.includes(value))) return true;
  const title = String(candidate.title ?? "");
  if (!title) return false;
  if (FREE_DELIVERY_PRODUCT_SLUGS.some((value) => title.toLowerCase().includes(value))) return true;
  return FREE_DELIVERY_PRODUCT_NAME_FRAGMENTS.some((fragment) => title.includes(fragment));
}

function bundleCandidates(bundle: FreeDeliveryBundle): FreeDeliveryCandidate[] {
  if (!bundle || typeof bundle !== "object") return [];
  return [
    bundle,
    ...(bundle.captureItems ?? []).map((item) => ({ title: item.productName })),
  ];
}

export function bundleHasFreeDeliveryProduct(bundle: FreeDeliveryBundle): boolean {
  return bundleCandidates(bundle).some(candidateHasFreeDeliveryProduct);
}

export function bundleHasLitchiFlowerHoney(bundle: FreeDeliveryBundle): boolean {
  return bundleCandidates(bundle).some((candidate) => {
    if (candidate.productId != null && String(candidate.productId) === LITCHI_FLOWER_HONEY_PRODUCT_ID) return true;
    const slug = String(candidate.productSlug ?? "").toLowerCase();
    if (slug.includes(LITCHI_FLOWER_HONEY_SLUG)) return true;
    return String(candidate.title ?? "").includes(LITCHI_FLOWER_HONEY_NAME_FRAGMENT);
  });
}
