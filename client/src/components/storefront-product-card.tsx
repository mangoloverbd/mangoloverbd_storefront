import { motion } from "framer-motion";
import HomeProductCard from "@/components/home-product-card";
import {
  mergeInventory,
  type StorefrontInventoryEntry,
  type StorefrontProduct,
} from "@/lib/storefront-products";

const transition = { duration: 1, ease: [0.25, 0.1, 0.25, 1] as const };
const reveal = {
  hidden: { filter: "blur(2px)", transform: "translateY(20%)", opacity: 0 },
  visible: { filter: "blur(0)", transform: "translateY(0)", opacity: 1 },
};

// Stock arrives from the page's single batched inventory read rather than a
// per-card poll, so a grid costs one request instead of one per product.
export default function StorefrontProductCard({
  product,
  index,
  inventory,
}: {
  product: StorefrontProduct;
  index: number;
  inventory?: StorefrontInventoryEntry | null;
}) {
  const merged = mergeInventory(product, inventory) ?? product;

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
