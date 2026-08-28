import { motion } from "framer-motion";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout";
import {
  fetchStorefrontProducts,
  fetchStorefrontProductInventory,
  getProductImage,
  formatProductPrice,
  formatProductPriceRange,
  mergeInventory,
  STOREFRONT_POLL_INTERVAL_MS,
  type StorefrontProduct,
} from "@/lib/storefront-products";

const transition = { duration: 1, ease: [0.25, 0.1, 0.25, 1] as const };
const reveal = {
  hidden: { filter: "blur(6px)", transform: "translateY(20%)", opacity: 0 },
  visible: { filter: "blur(0)", transform: "translateY(0)", opacity: 1 },
};

function ProductCard({ product, index }: { product: StorefrontProduct; index: number }) {
  const { data: inventory } = useQuery({
    queryKey: ["merchant-suite-inventory", product.slug],
    queryFn: () => fetchStorefrontProductInventory(product.slug),
    enabled: Boolean(product.slug),
    refetchInterval: STOREFRONT_POLL_INTERVAL_MS,
  });
  const merged = mergeInventory(product, inventory?.inventory) ?? product;
  const image = getProductImage(merged);

  return (
    <motion.article
      key={merged.slug}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      variants={reveal}
      transition={{ ...transition, delay: Math.min(index * 0.04, 0.3) }}
      className="group"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#ededed]">
        <Link href={`/product/${merged.slug}`} className="block h-full">
          {image ? (
            <img
              src={image}
              alt={merged.name}
              loading="lazy"
              className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#ededed] text-[10px] uppercase tracking-[0.3em] text-black/30">
              No image
            </div>
          )}
          {merged.available === false && (
            <span className="absolute left-4 top-4 bg-neutral-500/70 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.3em] text-white">
              Sold out
            </span>
          )}
        </Link>
      </div>
      <Link href={`/product/${merged.slug}`} className="block pb-2 pt-5 text-black md:pt-7">
        <h3 className="text-base font-medium uppercase leading-tight tracking-[0.04em] md:text-xl md:tracking-[0.06em]">
          {merged.name}
        </h3>
        <p className="mt-3 text-lg font-normal tracking-[0.01em] text-black md:text-xl">
          {formatProductPriceRange(merged)}
        </p>
      </Link>
    </motion.article>
  );
}

export default function ProductsPage() {
  const { data: products, isLoading, isError } = useQuery({
    queryKey: ["merchant-suite-products-listing"],
    queryFn: fetchStorefrontProducts,
    refetchInterval: STOREFRONT_POLL_INTERVAL_MS,
  });

  return (
    <Layout>
      <div className="mx-auto max-w-[1500px] px-4 py-10 md:px-8 md:py-16 xl:px-12">
        <header className="mb-10 md:mb-16">
          <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-black/50">Shop</p>
          <h1 className="mt-3 text-[clamp(2.2rem,6vw,3.4rem)] font-bold leading-none tracking-[-0.04em] text-black">
            All <span className="font-display italic">Products</span>
          </h1>
        </header>

        {isLoading && (
          <div className="grid grid-cols-2 gap-2 md:gap-4 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse bg-[#ededed]" />
            ))}
          </div>
        )}

        {isError && (
          <div className="border border-black/10 bg-white px-6 py-10 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-black/60">Could not load products right now.</p>
            <p className="mt-2 text-xs text-black/40">Please try again shortly.</p>
          </div>
        )}

        {products && products.length === 0 && (
          <div className="border border-black/10 bg-white px-6 py-10 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-black/60">No products published yet.</p>
          </div>
        )}

        {products && products.length > 0 && (
          <div className="grid grid-cols-2 gap-2 md:gap-4 lg:grid-cols-4">
            {products.map((product: StorefrontProduct, index: number) => (
              <ProductCard key={product.slug} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
