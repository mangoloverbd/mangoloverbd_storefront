import type { StorefrontProduct } from "./storefront-products";

export type FeaturedCollection = {
  slug: string;
  label: string;
  image: string;
  productSlugs: readonly string[];
};

export const FEATURED_COLLECTIONS = [
  {
    slug: "homemade",
    label: "Homemade-হোমমেড",
    image: "/categories/homemade-3-320.webp",
    productSlugs: ["kalojira-mixed", "beetroot-powder"],
  },
  {
    slug: "honey",
    label: "Honey-মধু",
    image: "/categories/honey-4-320.webp",
    productSlugs: [
      "litchi-flower-honey",
      "sundarbans-natural-honey",
      "black-seed-flower-honey",
      "honey-nut",
    ],
  },
  {
    slug: "oil-and-ghee",
    label: "Oil & Ghee-তেল ও ঘি",
    image: "/categories/oil-2-320.webp",
    productSlugs: ["mustard-oil", "pure-ghee"],
  },
  {
    slug: "jaggery",
    label: "Jaggery-গুড়",
    image: "/categories/jaggery-1-320.webp",
    productSlugs: [],
  },
  {
    slug: "semai",
    label: "Semai-সেমাই",
    image: "/categories/lachcha-1-320.webp",
    productSlugs: [],
  },
  {
    slug: "fresh-mango",
    label: "Fresh Mango-ফ্রেশ আম",
    image: "/categories/mango-1-320.webp",
    productSlugs: [],
  },
  {
    slug: "dates",
    label: "Dates-খেজুর",
    image: "/categories/dates-1-320.webp",
    productSlugs: [],
  },
  {
    slug: "nuts-and-seeds",
    label: "Nuts & Seeds-বাদাম ও বীজ",
    image: "/categories/nuts-1-320.webp",
    productSlugs: ["seed-nut-mix", "seed-mixed", "chia-seed"],
  },
] as const satisfies readonly FeaturedCollection[];

export function getFeaturedCollection(slug: string) {
  return FEATURED_COLLECTIONS.find((collection) => collection.slug === slug) ?? null;
}

export function getProductsForCollection(
  products: StorefrontProduct[],
  collection: FeaturedCollection,
) {
  const assignedSlugs = new Set(collection.productSlugs);
  return products.filter((product) => assignedSlugs.has(product.slug));
}
