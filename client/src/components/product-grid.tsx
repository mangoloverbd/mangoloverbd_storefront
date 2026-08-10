import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  fetchStorefrontProducts,
  formatProductPrice,
  getProductImage,
  hasPublishedProducts,
} from "@/lib/storefront-products";

export default function ProductGrid() {
  const [, setLocation] = useLocation();
  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ["merchant-suite-products"],
    queryFn: fetchStorefrontProducts,
  });

  return (
    <section className="bg-brand-ivory">

      {/* ── Section Header ─────────────────────────────────── */}
      <div className="px-5 md:px-16 pt-2 md:pt-4 pb-8 md:pb-14 flex flex-col md:flex-row justify-between items-end gap-4 md:gap-8">
        <div>
          <span className="text-[9px] uppercase tracking-[0.55em] font-medium text-brand-gold mb-3 block">
            Archive 2026
          </span>
          <h2 className="text-[2.2rem] md:text-7xl font-display font-light uppercase tracking-tight leading-none">
            Selected <span className="font-bold">Products</span>
          </h2>
        </div>
        <div className="flex gap-10 text-[9px] uppercase tracking-[0.3em] font-bold opacity-25 mb-1">
          <span>Vol. 01</span>
          <span>Everyday Edit</span>
        </div>
      </div>

      {/* Hairline divider */}
      <div className="h-px bg-black/10 mx-5 md:mx-16" />

      {/* ── Product Grid ───────────────────────────────────────
          Mobile  : full-bleed, 1px separators between cards
          Desktop : padded, generous column gaps
      ─────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="px-5 py-16 md:px-16" aria-busy="true" aria-label="Products are loading" />
      ) : isError ? (
        <div className="px-5 py-16 text-center text-[10px] font-bold uppercase tracking-[0.35em] text-red-700 md:px-16">
          Could not load products.
        </div>
      ) : !hasPublishedProducts(products) ? (
        <div className="px-5 py-16 text-center md:px-16">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-black/35">
            No products published yet.
          </p>
        </div>
      ) : (
        <div
          className="
            grid grid-cols-2 lg:grid-cols-3
            gap-[1px] bg-black/[0.07]
            md:gap-6 lg:gap-8 md:bg-transparent md:px-16 md:pt-12 md:pb-0
          "
        >
          {products.map((p, i) => {
            const image = getProductImage(p);

            return (
              <motion.div
                key={p.id || p.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                onClick={() => setLocation(`/product/${p.slug}`)}
                className="group flex cursor-pointer flex-col bg-brand-ivory"
              >
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden bg-[#f6f6f6]">
                  {image ? (
                    <img
                      src={image}
                      className="h-full w-full object-contain p-8 mix-blend-multiply transition-transform duration-1000 group-hover:scale-105 md:p-12"
                      alt={p.name}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] font-bold uppercase tracking-[0.35em] text-black/25">
                      No image
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 opacity-0 transition-all duration-500 translate-y-1 group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="bg-black/70 px-2.5 py-1 text-[7px] uppercase tracking-[0.4em] font-medium text-white backdrop-blur-sm md:text-[8px]">
                      View
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="px-3 md:px-0 pt-3 pb-4 md:pt-5 md:pb-8 border-t border-black/[0.07] flex flex-col gap-1.5">
                  <h3 className="text-[0.85rem] md:text-2xl font-display font-light uppercase tracking-tight leading-tight text-black">
                    {p.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] md:text-[10px] uppercase tracking-widest text-brand-gold font-medium">
                      {formatProductPrice(p.price)}
                    </span>
                    <span className="text-[7px] md:text-[9px] uppercase tracking-[0.35em] font-medium opacity-20">
                      {p.available === false ? "Unavailable" : `${p.stock_quantity ?? 0} in stock`}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Bottom breathing room */}
      <div className="h-14 md:h-24" />
    </section>
  );
}
