import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import HomeProductCard from "@/components/home-product-card";
import {
  fetchStorefrontProductInventory,
  mergeInventory,
  STOREFRONT_POLL_INTERVAL_MS,
  type StorefrontProduct,
} from "@/lib/storefront-products";

const transition = { duration: 1, ease: [0.25, 0.1, 0.25, 1] as const };
const reveal = {
  hidden: { filter: "blur(2px)", transform: "translateY(20%)", opacity: 0 },
  visible: { filter: "blur(0)", transform: "translateY(0)", opacity: 1 },
};

export default function StorefrontProductCard({
  product,
  index,
}: {
  product: StorefrontProduct;
  index: number;
}) {
  const { data: inventory } = useQuery({
    queryKey: ["merchant-suite-inventory", product.slug],
    queryFn: () => fetchStorefrontProductInventory(product.slug),
    enabled: Boolean(product.slug),
    refetchInterval: STOREFRONT_POLL_INTERVAL_MS,
  });
  const merged = mergeInventory(product, inventory?.inventory) ?? product;

  return (
    <motion.div
      key={merged.slug}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      variants={reveal}
      transition={{ ...transition, delay: Math.min(index * 0.04, 0.3) }}
      className="group"
    >
      <HomeProductCard product={merged} />
    </motion.div>
  );
}
