import { useQuery } from "@tanstack/react-query";

import {
  HoneyCheckout,
} from "@/features/sundarbans-honey/honey-checkout";
import { resolveHoneyCheckoutStatus } from "@/features/sundarbans-honey/honey-checkout-state";
import { getHoneyPackOptions } from "@/features/sundarbans-honey/order";
import { generatedStorefrontProducts } from "@/lib/generated-storefront-products";
import {
  STOREFRONT_POLL_INTERVAL_MS,
  fetchStorefrontProduct,
  fetchStorefrontProductInventory,
  findGeneratedStorefrontProduct,
  mergeInventory,
} from "@/lib/storefront-products";

export default function SundarbansHoneyPage() {
  const slug = "sundarbans-natural-honey";
  const generatedProduct = findGeneratedStorefrontProduct(generatedStorefrontProducts, slug);
  const productQuery = useQuery({
    queryKey: ["merchant-suite-product", slug],
    queryFn: () => fetchStorefrontProduct(slug),
    initialData: generatedProduct ?? undefined,
    refetchInterval: STOREFRONT_POLL_INTERVAL_MS,
  });
  const inventoryQuery = useQuery({
    queryKey: ["merchant-suite-inventory", slug],
    queryFn: () => fetchStorefrontProductInventory(slug),
    refetchInterval: STOREFRONT_POLL_INTERVAL_MS,
  });
  const product = mergeInventory(productQuery.data, inventoryQuery.data?.inventory);
  const checkoutStatus = resolveHoneyCheckoutStatus({
    hasProduct: Boolean(product),
    hasOrderablePacks: product ? getHoneyPackOptions(product).length > 0 : false,
    productIsPending: productQuery.isPending,
    productIsError: productQuery.isError,
    inventoryIsError: inventoryQuery.isError,
    inventoryIsFetched: inventoryQuery.isFetched,
    hasInventory: Boolean(inventoryQuery.data?.inventory),
  });

  return (
    <main className="min-h-screen bg-[#f4ecd9] px-4 py-10 sm:px-6 sm:py-14" aria-labelledby="sundarbans-honey-title">
      <h1 id="sundarbans-honey-title" className="sr-only">
        সুন্দরবনের প্রাকৃতিক মধু
      </h1>
      <div className="mx-auto max-w-5xl">
        <HoneyCheckout
          product={product}
          status={checkoutStatus}
          productQuery={productQuery}
          inventoryQuery={inventoryQuery}
          onRetry={() => void Promise.all([productQuery.refetch(), inventoryQuery.refetch()])}
        />
      </div>
    </main>
  );
}
