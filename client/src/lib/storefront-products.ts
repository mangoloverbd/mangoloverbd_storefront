export const STOREFRONT_ID = "da1aecbc-a969-4b93-a5d3-40e7c80c8987";
export const STOREFRONT_API_BASE = `https://suite.arclabtechnology.com/api/public/storefronts/${STOREFRONT_ID}`;
const PRODUCT_CACHE_PREFIX = "merchant-suite-product:";

type StorefrontProductStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

type ProductImage = string | {
  id?: string | number;
  url?: string;
  src?: string;
  image_url?: string;
  alt_text?: string | null;
  sort_order?: number;
  is_primary?: boolean;
};

export type StorefrontVariant = {
  id?: string | number;
  name?: string;
  title?: string;
  option?: string;
  price?: string | number;
  available?: boolean;
  stock_quantity?: number;
  attributes?: Record<string, string | number | boolean | null>;
};

export type StorefrontProduct = {
  id?: string | number;
  name: string;
  slug: string;
  description?: string | null;
  url?: string | null;
  image_url?: string | null;
  image_urls?: string[] | null;
  images?: ProductImage[] | null;
  price?: string | number | null;
  compare_at_price?: string | number | null;
  available?: boolean;
  stock_quantity?: number | null;
  variants?: StorefrontVariant[] | null;
};

export function getProductGallery(product: Pick<StorefrontProduct, "image_urls" | "images" | "image_url">) {
  if (product.image_urls?.length) {
    return product.image_urls.filter(Boolean);
  }

  const images = product.images
    ?.map((image) => {
      if (typeof image === "string") {
        return image;
      }

      return image.url || image.src || image.image_url || "";
    })
    .filter(Boolean);

  if (images?.length) {
    return images;
  }

  return [product.image_url].filter(Boolean) as string[];
}

export function getProductImage(product: Pick<StorefrontProduct, "image_urls" | "images" | "image_url">) {
  const [firstImage] = getProductGallery(product);

  return firstImage || "";
}

export function hasPublishedProducts(products: StorefrontProduct[]) {
  return products.length > 0;
}

export function findGeneratedStorefrontProduct(products: StorefrontProduct[], slug: string) {
  return products.find((product) => product.slug === slug) || null;
}

export function getCachedStorefrontProduct(storage: StorefrontProductStorage | undefined, slug: string) {
  if (!storage) {
    return null;
  }

  try {
    const cached = storage.getItem(`${PRODUCT_CACHE_PREFIX}${slug}`);
    if (!cached) {
      return null;
    }

    const product = JSON.parse(cached) as StorefrontProduct;
    return product?.slug === slug ? product : null;
  } catch {
    return null;
  }
}

export function setCachedStorefrontProduct(storage: StorefrontProductStorage | undefined, product: StorefrontProduct) {
  if (!storage) {
    return;
  }

  storage.setItem(`${PRODUCT_CACHE_PREFIX}${product.slug}`, JSON.stringify(product));
}

export function removeCachedStorefrontProduct(storage: StorefrontProductStorage | undefined, slug: string) {
  storage?.removeItem(`${PRODUCT_CACHE_PREFIX}${slug}`);
}

export function isProductOrderable(product: StorefrontProduct | null | undefined) {
  if (!product || product.available === false) {
    return false;
  }

  if (typeof product.stock_quantity === "number" && product.stock_quantity <= 0) {
    return false;
  }

  if (product.variants?.length) {
    return product.variants.some((variant) => {
      if (variant.available === false) {
        return false;
      }

      return typeof variant.stock_quantity !== "number" || variant.stock_quantity > 0;
    });
  }

  return true;
}

export function formatProductPrice(price: StorefrontProduct["price"]) {
  const amount = Number(price);

  if (!Number.isFinite(amount)) {
    return "৳0";
  }

  return `৳${amount.toLocaleString()}`;
}

export function getProductAmount(price: StorefrontProduct["price"]) {
  const amount = Number(price);
  return Number.isFinite(amount) ? Math.round(amount) : 0;
}

export function getProductNumericId(product: Pick<StorefrontProduct, "id" | "slug">) {
  const numericId = Number(product.id);

  if (Number.isInteger(numericId) && numericId > 0) {
    return numericId;
  }

  return Array.from(product.slug).reduce((hash, char) => hash + char.charCodeAt(0), 0);
}

export async function fetchStorefrontProducts() {
  const res = await fetch(`${STOREFRONT_API_BASE}/products`);

  if (!res.ok) {
    throw new Error("Could not load products.");
  }

  const data = await res.json();
  return (data.products || []) as StorefrontProduct[];
}

export async function fetchStorefrontProduct(slug: string) {
  const res = await fetch(`${STOREFRONT_API_BASE}/products/${slug}`);

  if (!res.ok) {
    throw new Error("Could not load product.");
  }

  const data = await res.json();
  return (data.product || null) as StorefrontProduct | null;
}
