import { useState, useMemo, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { useStorefront } from "@/contexts/storefront-context";
import Layout from "@/components/layout";
import OrderDialog, { type OrderDialogBundle } from "@/components/order-dialog";
import { createEventId, trackMetaEvent } from "@/lib/meta";
import {
  fetchStorefrontProduct,
  getProductGallery,
  getProductImage,
  getProductNumericId,
  isProductOrderable,
  formatProductPrice,
  type StorefrontProduct,
  type StorefrontVariant,
} from "@/lib/storefront-products";

/**
 * Extract unique option values across all variants for a given attribute name.
 * e.g. for attribute "Color" → ["Red", "Blue", "Black"]
 */
function getVariantOptions(product: StorefrontProduct, attribute: string): string[] {
  const seen = new Set<string>();
  const options: string[] = [];

  for (const variant of product.variants || []) {
    const value = variant.attributes?.[attribute];
    if (value && !seen.has(String(value))) {
      seen.add(String(value));
      options.push(String(value));
    }
  }

  return options;
}

/**
 * Get all unique attribute names across variants.
 * e.g. → ["Color", "Size"]
 */
function getVariantAttributes(product: StorefrontProduct): string[] {
  const attrs = new Set<string>();
  for (const variant of product.variants || []) {
    if (variant.attributes) {
      Object.keys(variant.attributes).forEach(a => attrs.add(a));
    }
  }
  return Array.from(attrs);
}

/**
 * Find the variant matching the current selection.
 */
function findSelectedVariant(
  product: StorefrontProduct,
  selection: Record<string, string>
): StorefrontVariant | null {
  if (!product.variants?.length) return null;

  return product.variants.find(variant => {
    if (!variant.attributes) return false;
    return Object.entries(selection).every(
      ([key, value]) => String(variant.attributes?.[key]) === value
    );
  }) || null;
}

/**
 * Get variant price — uses price_adjustment + base price, or the variant's own price field.
 */
function getVariantPrice(variant: StorefrontVariant | null, basePrice: number): number {
  if (!variant) return basePrice;
  if (typeof variant.price === "number") return variant.price;
  if (typeof variant.price === "string" && variant.price) return Number(variant.price) || basePrice;
  return basePrice;
}

function getVariantStock(variant: StorefrontVariant | null): number | null {
  if (!variant) return null;
  if (typeof variant.stock_quantity === "number") return variant.stock_quantity;
  return null;
}

function isColorAttribute(name: string): boolean {
  return /^(color|colour|colorway)$/i.test(name);
}

// Simple color map for common color names → hex values (for swatches)
const COLOR_MAP: Record<string, string> = {
  black: "#1a1a1a",
  white: "#f5f5f5",
  red: "#c0392b",
  blue: "#2980b9",
  navy: "#1a2744",
  green: "#27ae60",
  yellow: "#f1c40f",
  pink: "#e91e8c",
  purple: "#8e44ad",
  orange: "#e67e22",
  brown: "#6d4c41",
  grey: "#7f8c8d",
  gray: "#7f8c8d",
  beige: "#d4c5a9",
  cream: "#f5f0e1",
  gold: "#c5a059",
  silver: "#bdc3c7",
};

function getColorHex(colorName: string): string {
  return COLOR_MAP[colorName.toLowerCase()] || colorName;
}

export default function ProductPage({ params }: { params?: { id: string } }) {
  const slug = params?.id || "";
  const { addToCart } = useCart();
  const { config } = useStorefront();
  const [orderOpen, setOrderOpen] = useState(false);
  const [selection, setSelection] = useState<Record<string, string>>({});
  const [activeImage, setActiveImage] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const [galleryRef, galleryApi] = useEmblaCarousel({
    align: "start",
    containScroll: false,
    loop: false,
    skipSnaps: false,
  });

  const { data: product, isFetched } = useQuery({
    queryKey: ["merchant-suite-product", slug],
    queryFn: () => fetchStorefrontProduct(slug),
    enabled: Boolean(slug),
  });

  const attributes = useMemo(() => product ? getVariantAttributes(product) : [], [product]);
  const selectedVariant = useMemo(
    () => product ? findSelectedVariant(product, selection) : null,
    [product, selection]
  );

  const basePrice = Number(product?.price) || 0;
  const displayPrice = getVariantPrice(selectedVariant, basePrice);
  const compareAtPrice = Number(product?.compare_at_price);
  const stock = getVariantStock(selectedVariant);
  const isOrderable = product ? isProductOrderable(product) : false;
  const isOutOfStock = stock !== null && stock <= 0;
  const isUnavailable = !product || (!isOrderable && !selectedVariant) || isOutOfStock;

  const gallery = product ? getProductGallery(product) : [];
  const displayImage = product ? (getProductImage(product) || "") : "";
  const displayGallery = gallery.length ? gallery : [displayImage].filter(Boolean);

  // Auto-select first option for each attribute
  useEffect(() => {
    if (!product?.variants?.length) return;
    if (Object.keys(selection).length > 0) return;

    const initial: Record<string, string> = {};
    for (const attr of attributes) {
      const options = getVariantOptions(product, attr);
      if (options.length > 0) {
        initial[attr] = options[0];
      }
    }
    setSelection(initial);
  }, [product, attributes]); // eslint-disable-line react-hooks/exhaustive-deps

  // Track ViewContent
  useEffect(() => {
    if (!product) return;
    const eventId = createEventId();
    trackMetaEvent({
      eventName: "ViewContent",
      eventId,
      capi: true,
      customData: {
        currency: "BDT",
        value: displayPrice,
        content_type: "product",
        content_ids: [product.slug],
        contents: [{ id: product.slug, quantity: 1, item_price: displayPrice }],
      },
    });
  }, [product, displayPrice]);

  // Gallery sync
  useEffect(() => {
    if (!galleryApi) return;
    const syncActiveImage = () => setActiveImage(galleryApi.selectedScrollSnap());
    galleryApi.scrollTo(0, true);
    syncActiveImage();
    galleryApi.on("select", syncActiveImage);
    galleryApi.on("reInit", syncActiveImage);
    return () => {
      galleryApi.off("select", syncActiveImage);
      galleryApi.off("reInit", syncActiveImage);
    };
  }, [galleryApi, displayGallery.length]);

  const goToImage = (idx: number) => galleryApi?.scrollTo(idx);

  const handleAddToCart = () => {
    if (!product || isUnavailable) return;

    const variantId = selectedVariant?.id
      ? String(selectedVariant.id)
      : String(getProductNumericId(product));

    addToCart(
      {
        id: getProductNumericId(product),
        title: product.name,
        price: formatProductPrice(displayPrice),
        image: displayImage,
        variantId,
      },
      Object.values(selection).join(" / ") || "Default",
    );
  };

  const orderBundle: OrderDialogBundle | null = product
    ? {
        title: product.name,
        details: Object.values(selection).join(" / ") || "Default",
        price: displayPrice,
        images: [{ src: displayImage, alt: product.name }],
      }
    : null;

  if (!isFetched) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-black/10 border-t-black/60" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
          <h1 className="text-2xl font-light tracking-tight text-black/80">Product not found</h1>
          <p className="mt-4 text-sm text-black/50">This product doesn't exist or has been removed.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen" style={{ backgroundColor: config.backgroundColor }}>
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Image Gallery */}
          <div className="lg:col-span-7 p-[10px] md:p-16 xl:p-20" style={{ backgroundColor: config.backgroundColor }}>
            <div className="relative mx-auto aspect-square w-full max-w-[1080px] overflow-hidden rounded-[8px] bg-[#f6f6f6]">
              {displayGallery.length ? (
                <>
                  <div ref={galleryRef} className="h-full cursor-grab overflow-hidden active:cursor-grabbing">
                    <div className="flex h-full touch-pan-y">
                      {displayGallery.map((url, idx) => (
                        <div key={url} className="relative h-full min-w-0 flex-[0_0_100%] overflow-hidden">
                          <motion.img
                            src={url}
                            alt={product.name}
                            width={1080}
                            height={1080}
                            draggable={false}
                            initial={false}
                            animate={shouldReduceMotion ? { opacity: 1, scale: 1 } : {
                              opacity: activeImage === idx ? 1 : 0.55,
                              scale: activeImage === idx ? 1 : 0.96,
                            }}
                            whileHover={shouldReduceMotion ? undefined : { scale: activeImage === idx ? 1.035 : 0.98 }}
                            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute inset-0 h-full w-full select-none object-cover object-center"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {displayGallery.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center gap-2 md:bottom-8">
                      {displayGallery.map((url, idx) => (
                        <motion.button
                          key={url}
                          type="button"
                          onClick={() => goToImage(idx)}
                          className="relative h-3 w-8 overflow-hidden"
                          aria-label={`Go to product image ${idx + 1}`}
                        >
                          <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 bg-black/20" />
                          <motion.span
                            className="absolute left-0 top-1/2 h-[2px] w-full origin-left -translate-y-1/2 bg-black"
                            initial={false}
                            animate={{
                              opacity: activeImage === idx ? 1 : 0,
                              scaleX: activeImage === idx ? 1 : 0.2,
                            }}
                            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                          />
                        </motion.button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] font-bold uppercase tracking-[0.35em] text-black/25">
                  No image
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:col-span-5 flex flex-col" style={{ backgroundColor: config.backgroundColor }}>
            <div className="flex-grow space-y-6 px-4 pb-10 pt-2 md:space-y-10 md:p-16 xl:p-20">
              {/* Name & Price */}
              <div className="space-y-4 md:space-y-6">
                <h1 className="max-w-full break-words font-sans text-4xl font-semibold leading-tight tracking-tight text-black sm:text-5xl md:text-7xl">
                  {product.name}
                </h1>

                <div className="flex items-center gap-6">
                  <div className="flex items-center font-sans text-2xl font-semibold text-black">
                    {formatProductPrice(displayPrice)}
                  </div>
                  {Number.isFinite(compareAtPrice) && compareAtPrice > displayPrice && (
                    <span className="text-sm font-semibold text-black/35 line-through">
                      {formatProductPrice(compareAtPrice)}
                    </span>
                  )}
                  <div className="h-px flex-grow bg-black/5" />
                </div>

                {product.description && (
                  <p className="text-xs font-medium leading-[1.8] text-black/60 md:text-sm">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Variant Pickers */}
              {attributes.length > 0 && (
                <div className="space-y-4">
                  {attributes.map(attr => {
                    const options = getVariantOptions(product, attr);
                    const isColor = isColorAttribute(attr);

                    return (
                      <div key={attr} className="space-y-3">
                        <span className="block text-[10px] font-bold uppercase tracking-[0.4em] text-black/60">
                          {attr}{selection[attr] ? `: ${selection[attr]}` : ""}
                        </span>

                        <div className={isColor ? "flex gap-3" : "grid grid-cols-4 gap-2"}>
                          {options.map(option => {
                            const isSelected = selection[attr] === option;

                            if (isColor) {
                              return (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => setSelection(prev => ({ ...prev, [attr]: option }))}
                                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                                    isSelected ? "border-black scale-110" : "border-black/20 hover:border-black/50"
                                  }`}
                                  style={{ backgroundColor: getColorHex(option) }}
                                  title={option}
                                  aria-label={`Select ${attr}: ${option}`}
                                />
                              );
                            }

                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => setSelection(prev => ({ ...prev, [attr]: option }))}
                                className={`flex items-center justify-center rounded-[8px] border px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-widest transition-all ${
                                  isSelected
                                    ? "border-black bg-black text-white"
                                    : "border-black/20 bg-transparent text-black hover:border-black/50"
                                }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Stock Indicator */}
              {stock !== null && (
                <span className={`text-[10px] font-bold uppercase tracking-[0.35em] ${
                  stock > 0 ? "text-green-700" : "text-red-600"
                }`}>
                  {stock > 0 ? `In stock — ${stock} left` : "Out of stock"}
                </span>
              )}

              {isUnavailable && stock === null && (
                <div className="rounded-[8px] border border-black/10 bg-white/35 p-4 text-center text-[10px] font-bold uppercase tracking-[0.35em] text-black/45">
                  Unavailable
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Button
                    disabled={isUnavailable}
                    onClick={handleAddToCart}
                    className="group flex h-12 items-center justify-center gap-2 rounded-[8px] border border-black/20 bg-transparent px-2 text-[10px] font-bold uppercase tracking-[0.4em] text-black transition-all hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Add to Cart
                  </Button>
                  <Button
                    disabled={isUnavailable}
                    onClick={() => {
                      if (!isUnavailable) setOrderOpen(true);
                    }}
                    className="group flex h-12 items-center justify-center gap-2 rounded-[8px] bg-black px-2 text-[10px] font-bold uppercase tracking-[0.4em] text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
                    style={!isUnavailable ? { backgroundColor: config.primaryColor } : undefined}
                  >
                    Buy it Now
                    <ArrowDownRight className="h-5 w-5 stroke-[1px] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {orderBundle && (
        <OrderDialog open={orderOpen} onOpenChange={setOrderOpen} bundle={orderBundle} />
      )}
    </Layout>
  );
}
