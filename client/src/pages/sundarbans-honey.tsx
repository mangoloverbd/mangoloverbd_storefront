import { useCallback, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  CampaignFooter,
  CampaignHeader,
} from "@/features/sundarbans-honey/campaign-layout";
import { checkoutSectionHeading } from "@/features/sundarbans-honey/content";
import { DocumentarySections } from "@/features/sundarbans-honey/documentary-sections";
import {
  HoneyCheckout,
} from "@/features/sundarbans-honey/honey-checkout";
import { resolveHoneyCheckoutStatus } from "@/features/sundarbans-honey/honey-checkout-state";
import { MobileOrderBar } from "@/features/sundarbans-honey/mobile-order-bar";
import { getHoneyPackOptions } from "@/features/sundarbans-honey/order";
import { trackHoneyCampaignEvent } from "@/features/sundarbans-honey/tracking";
import { generatedStorefrontProducts } from "@/lib/generated-storefront-products";
import {
  STOREFRONT_POLL_INTERVAL_MS,
  fetchStorefrontProduct,
  fetchStorefrontProductInventory,
  findGeneratedStorefrontProduct,
  getProductImage,
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

  const campaignViewedRef = useRef(false);
  useEffect(() => {
    if (campaignViewedRef.current) return;
    campaignViewedRef.current = true;
    trackHoneyCampaignEvent("campaign_view", {});
  }, []);

  const handleOrderClick = useCallback((placement: string) => {
    trackHoneyCampaignEvent("landing_cta_click", { placement });
    const heading = document.getElementById("honey-checkout-heading");
    if (!heading) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    heading.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    window.setTimeout(() => heading.focus({ preventScroll: true }), reduceMotion ? 0 : 450);
  }, []);

  const productImageUrl = product ? (getProductImage(product) ?? null) : null;

  return (
    <div className="sundarbans-honey-page min-h-screen bg-[#f4ecd9]">
      <CampaignHeader />
      <main aria-labelledby="sundarbans-honey-title">
        <h1 id="sundarbans-honey-title" className="sr-only">
          সুন্দরবনের প্রাকৃতিক মধু
        </h1>
        <DocumentarySections
          productImageUrl={productImageUrl}
          onOrderClick={handleOrderClick}
        />
        <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
          <section id="honey-checkout" aria-labelledby="honey-checkout-heading" className="scroll-mt-20 pt-4">
            <h2
              id="honey-checkout-heading"
              tabIndex={-1}
              className="text-2xl font-bold text-[#19382d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#19382d] sm:text-3xl"
            >
              {checkoutSectionHeading}
            </h2>
            <div className="mt-6">
              <HoneyCheckout
                product={product}
                status={checkoutStatus}
                productQuery={productQuery}
                inventoryQuery={inventoryQuery}
                onRetry={() => void Promise.all([productQuery.refetch(), inventoryQuery.refetch()])}
              />
            </div>
          </section>
        </div>
      </main>
      <CampaignFooter />
      <MobileOrderBar onOrderClick={handleOrderClick} />
    </div>
  );
}
