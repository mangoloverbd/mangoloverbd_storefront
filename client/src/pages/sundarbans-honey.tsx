import { useQuery } from "@tanstack/react-query";

import {
  HoneyCheckout,
  HoneySupportActions,
} from "@/features/sundarbans-honey/honey-checkout";
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

  return (
    <main className="min-h-screen bg-[#f4ecd9] px-4 py-10 sm:px-6 sm:py-14" aria-labelledby="sundarbans-honey-title">
      <h1 id="sundarbans-honey-title" className="sr-only">
        সুন্দরবনের প্রাকৃতিক মধু
      </h1>
      <div className="mx-auto max-w-5xl">
        {product ? (
          <HoneyCheckout
            product={product}
            productQuery={productQuery}
            inventoryQuery={inventoryQuery}
          />
        ) : productQuery.isPending ? (
          <section className="rounded-3xl border border-[#d4c39c] bg-[#fffaf0] p-6" aria-label="অর্ডারের তথ্য লোড হচ্ছে">
            <div className="h-6 w-36 animate-pulse rounded bg-[#dfd2b5] motion-reduce:animate-none" />
            <div className="mt-4 h-12 w-full animate-pulse rounded-xl bg-[#ebe0c8] motion-reduce:animate-none" />
            <span className="sr-only">অর্ডারের তথ্য লোড হচ্ছে…</span>
          </section>
        ) : (
          <section className="rounded-3xl border border-[#d4c39c] bg-[#fffaf0] p-6 sm:p-8" aria-labelledby="honey-load-error-title">
            <h2 id="honey-load-error-title" className="text-2xl font-bold text-[#19382d]">পণ্যের তথ্য এখন পাওয়া যাচ্ছে না</h2>
            <p className="mt-3 leading-7 text-[#654b2f]">কিছুক্ষণ পর আবার চেষ্টা করুন অথবা সরাসরি আমাদের সঙ্গে যোগাযোগ করে অর্ডার করুন।</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                className="min-h-11 rounded-full bg-[#19382d] px-5 py-2 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2"
                onClick={() => void Promise.all([productQuery.refetch(), inventoryQuery.refetch()])}
              >
                আবার চেষ্টা করুন
              </button>
              <HoneySupportActions placement="product_load_error" />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
