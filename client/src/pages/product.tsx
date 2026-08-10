import { useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import Layout from "@/components/layout";
import OrderDialog, { type OrderDialogBundle } from "@/components/order-dialog";
import { createEventId, trackMetaEvent } from "@/lib/meta";
import { Counter } from "@/components/ui/animated-counter";
import {
  fetchStorefrontProduct,
  findGeneratedStorefrontProduct,
  getCachedStorefrontProduct,
  getProductGallery,
  getProductImage,
  getProductNumericId,
  isProductOrderable,
  removeCachedStorefrontProduct,
  setCachedStorefrontProduct,
  type StorefrontProduct,
} from "@/lib/storefront-products";
import { generatedStorefrontProducts } from "@/lib/generated-storefront-products";

const staticProduct: StorefrontProduct = {
  id: "stepprs-massage-insoles",
  name: "Stepprs Massage Insoles",
  slug: "stepprs-massage-insoles",
  description: "Instant pain relief in every step. Engineered with targeted massage nodes, biomechanical arch support, and breathable vents. Trimmable for a perfect fit.",
  image_url: "/hero-insoles.png",
  price: 500,
  compare_at_price: null,
  available: true,
  stock_quantity: 1,
};

const staticBundles = [
  { id: 1, title: "1 Pair", price: "৳500", amount: 500 },
  { id: 2, title: "2 Pairs", price: "৳850", amount: 850 },
  { id: 3, title: "3 Pairs", price: "৳1350", amount: 1350 },
];

const featureGroups = [
  {
    label: "Core Feature",
    details: ["Targeted Massage Nodes"],
  },
  {
    label: "Support & Comfort",
    details: ["Biomechanical Arch Support", "Thick Heel Cup & Cushioning"],
  },
  {
    label: "Fit & Material",
    details: ["Trimmable to Fit", "Breathable Vents"],
  },
];

const placeholderProducts = [1, 2, 3, 4, 5, 6].map((id) => ({
  id,
  title: `Product ${id}`,
  price: "৳---",
  type: "Demo",
}));

const transition = { duration: 1, ease: [0.25, 0.1, 0.25, 1] as const };
const reveal = {
  hidden: { filter: "blur(10px)", transform: "translateY(20%)", opacity: 0 },
  visible: { filter: "blur(0)", transform: "translateY(0)", opacity: 1 },
};

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, inView] as const;
}

function getMerchantSlug(slug: string) {
  return slug === "massage-insoles" ? staticProduct.slug : slug || staticProduct.slug;
}

function formatTimelineDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ProductPage({ params }: { params?: { id: string } }) {
  const slug = getMerchantSlug(params?.id || "");
  const { addToCart } = useCart();
  const [orderOpen, setOrderOpen] = useState(false);
  const [selectedBundleIdx, setSelectedBundleIdx] = useState(0);
  const [availabilityBlocked, setAvailabilityBlocked] = useState(false);
  const [openFeature, setOpenFeature] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [activeReel, setActiveReel] = useState(0);
  const [cachedProduct, setCachedProduct] = useState<StorefrontProduct | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const [mayAlsoRef, mayAlsoInView] = useReveal();
  const [galleryRef, galleryApi] = useEmblaCarousel({
    align: "start",
    containScroll: false,
    loop: false,
    skipSnaps: false,
  });
  const [reelsRef, reelsApi] = useEmblaCarousel({
    align: "center",
    loop: true,
  });
  const { data: merchantProduct, isFetched, isError, refetch } = useQuery({
    queryKey: ["merchant-suite-product", slug],
    queryFn: () => fetchStorefrontProduct(slug),
    enabled: Boolean(slug),
  });

  const generatedProduct = findGeneratedStorefrontProduct(generatedStorefrontProducts, slug) || staticProduct;
  const product = merchantProduct || cachedProduct || generatedProduct;
  const selectedBundle = staticBundles[selectedBundleIdx];
  const selectedVariant = merchantProduct?.variants?.[0] || null;
  const productImage = product.image_url || "";
  const merchantAvailabilityKnown = isFetched || isError;
  const merchantUnavailable = merchantAvailabilityKnown && (!merchantProduct || !isProductOrderable(merchantProduct));
  const isUnavailable = availabilityBlocked || merchantUnavailable;
  const gallery = getProductGallery(product);
  const displayImage = getProductImage(product) || productImage;
  const displayGallery = gallery.length ? gallery : [displayImage].filter(Boolean);
  const compareAtAmount = Number(product.compare_at_price);

  const verifyOrderable = async () => {
    if (isUnavailable) {
      return false;
    }

    if (!merchantAvailabilityKnown) {
      const result = await refetch();
      const orderable = isProductOrderable(result.data);
      setAvailabilityBlocked(!orderable);
      return orderable;
    }

    return true;
  };

  useEffect(() => {
    setCachedProduct(getCachedStorefrontProduct(window.localStorage, slug));
  }, [slug]);

  useEffect(() => {
    const imageUrl = displayImage;
    if (!imageUrl || imageUrl.startsWith("/")) return;

    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = imageUrl;
    document.head.appendChild(link);

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, [displayImage]);

  useEffect(() => {
    if (!isFetched) return;

    if (merchantProduct && isProductOrderable(merchantProduct)) {
      setCachedStorefrontProduct(window.localStorage, merchantProduct);
      setCachedProduct(merchantProduct);
      return;
    }

    removeCachedStorefrontProduct(window.localStorage, slug);
  }, [isFetched, merchantProduct, slug]);

  useEffect(() => {
    const eventId = createEventId();
    trackMetaEvent({
      eventName: "ViewContent",
      eventId,
      capi: true,
      customData: {
        currency: "BDT",
        value: selectedBundle.amount,
        content_type: "product",
        content_ids: [product.slug],
        contents: [{ id: product.slug, quantity: 1, item_price: selectedBundle.amount }],
      },
    });
  }, [selectedBundle]);

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

  useEffect(() => {
    if (!reelsApi) return;

    const syncActiveReel = () => setActiveReel(reelsApi.selectedScrollSnap());

    syncActiveReel();
    reelsApi.on("select", syncActiveReel);
    reelsApi.on("reInit", syncActiveReel);

    return () => {
      reelsApi.off("select", syncActiveReel);
      reelsApi.off("reInit", syncActiveReel);
    };
  }, [reelsApi]);

  const goToImage = (idx: number) => {
    galleryApi?.scrollTo(idx);
  };

  const today = new Date();
  const processedDate = new Date(today);
  processedDate.setDate(today.getDate() + 1);
  const deliveredDate = new Date(processedDate);
  deliveredDate.setDate(processedDate.getDate() + 1);
  const deliveryTimeline = [
    { title: "Order Placed", date: formatTimelineDate(today) },
    { title: "Order Processed", date: formatTimelineDate(processedDate) },
    { title: "Delivered", date: formatTimelineDate(deliveredDate) },
  ];

  const orderBundle: OrderDialogBundle = {
        title: product.name,
        details: selectedBundle.title,
        price: selectedBundle.amount,
        images: [{ src: displayImage, alt: product.name }],
      };

  return (
    <Layout>
      <div className="min-h-screen bg-brand-ivory">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-7 bg-brand-ivory p-[10px] md:p-16 xl:p-20">
              <div
                className="relative mx-auto aspect-square w-full max-w-[1080px] overflow-hidden rounded-[8px] bg-[#f6f6f6]"
              >
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

                    {displayGallery.length > 1 ? (
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
                    ) : null}
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] font-bold uppercase tracking-[0.35em] text-black/25">
                    No image
                  </div>
                )}
              </div>
            </div>

            <div
              className="lg:col-span-5 flex flex-col bg-brand-ivory"
            >
              <div className="flex-grow space-y-6 px-4 pb-10 pt-2 md:space-y-10 md:p-16 xl:p-20">
                <div className="space-y-4 md:space-y-6">
                  <h1 className="max-w-full break-words font-sans text-4xl font-semibold leading-tight tracking-tight text-black sm:text-5xl md:text-7xl">
                    {product.name}
                  </h1>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center font-sans text-2xl font-semibold text-black">
                      <span>৳</span>
                      <Counter end={selectedBundle.amount} fontSize={24} className="text-black font-semibold !px-0" />
                    </div>
                    {Number.isFinite(compareAtAmount) && compareAtAmount > selectedBundle.amount ? (
                      <span className="text-sm font-semibold text-black/35 line-through">৳{compareAtAmount.toLocaleString()}</span>
                    ) : null}
                    <div className="h-px flex-grow bg-black/5" />
                  </div>

                  {product.description ? (
                    <p className="text-xs font-medium leading-[1.8] text-black/60 md:text-sm">
                      {product.description}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-3 md:space-y-4">
                  <span className="block pb-1 text-[10px] font-bold uppercase tracking-[0.4em] text-black/60 md:pb-2">
                    Select Bundle
                  </span>
                  <div className="grid grid-cols-3 gap-2 md:pt-3">
                    {staticBundles.map((bundle, idx) => (
                      <button
                        key={bundle.id}
                        type="button"
                        onClick={() => setSelectedBundleIdx(idx)}
                        className={`relative flex flex-col items-center justify-center rounded-[8px] border px-1 py-1.5 text-center transition-all md:px-3 md:py-2.5 ${
                          selectedBundleIdx === idx
                            ? "border-black bg-black text-white"
                            : "border-black/20 bg-transparent text-black hover:border-black/50"
                        }`}
                      >
                        <span className="mb-1 block text-[11px] font-bold uppercase tracking-widest">
                          {bundle.title}
                        </span>
                        <span className="block text-[13px] font-garet">{bundle.price}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {isUnavailable ? (
                  <div className="rounded-[8px] border border-black/10 bg-white/35 p-4 text-center text-[10px] font-bold uppercase tracking-[0.35em] text-black/45">
                    Unavailable
                  </div>
                ) : null}

                <div className="space-y-3 md:space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Button
                      disabled={isUnavailable || selectedBundle.amount <= 0}
                      onClick={async () => {
                        if (!(await verifyOrderable())) {
                          return;
                        }

                        addToCart(
                          {
                            id: getProductNumericId(product),
                            title: `${product.name} (${selectedBundle.title})`,
                            price: selectedBundle.price,
                            image: displayImage,
                          },
                          selectedBundle.title,
                        );
                      }}
                      className="group flex h-12 items-center justify-center gap-2 rounded-[8px] border border-black/20 bg-transparent px-2 text-[10px] font-bold uppercase tracking-[0.4em] text-black transition-all hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Add to Cart
                    </Button>
                    <Button
                      disabled={isUnavailable || selectedBundle.amount <= 0}
                      onClick={async () => {
                        if (await verifyOrderable()) {
                          setOrderOpen(true);
                        }
                      }}
                      className="group flex h-12 items-center justify-center gap-2 rounded-[8px] bg-black px-2 text-[10px] font-bold uppercase tracking-[0.4em] text-white transition-all hover:bg-brand-gold disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Buy it Now
                      <ArrowDownRight className="h-5 w-5 stroke-[1px] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                    </Button>
                  </div>

                  <div className="rounded-[8px] border border-black/10 bg-white/35 px-4 py-5 md:px-5">
                    <div className="relative pb-1 pt-5">
                      <div className="absolute left-[12%] right-[12%] top-8 h-px bg-black/15" />
                      <div className="relative z-20 grid grid-cols-3 gap-3">
                        {deliveryTimeline.map((item) => (
                          <div key={item.title} className="flex flex-col items-center text-center">
                            <span className="mb-3 h-3 w-3 rounded-full border border-brand-gold bg-brand-ivory shadow-[0_0_0_4px_rgba(242,241,240,0.95)]" />
                            <span className="font-garet text-[11px] font-bold uppercase tracking-[0.12em] text-brand-gold">
                              {item.date}
                            </span>
                            <span className="mt-2 block text-[8px] font-bold uppercase leading-4 tracking-[0.18em] text-black md:text-[9px] md:tracking-[0.24em]">
                              {item.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Specifications */}
                <div className="border border-black/10 bg-white/35 rounded-[8px] p-5 md:p-6">
                  <div className="mb-5 flex items-center justify-between gap-4 border-b border-black/10 pb-4">
                    <span className="text-[9px] uppercase tracking-[0.36em] font-bold text-brand-gold">
                      Details
                    </span>
                    <span className="h-px flex-1 bg-black/10" />
                    <span className="font-garet text-[10px] font-bold uppercase tracking-[0.24em] text-black/35">
                      Features
                    </span>
                  </div>
                  <div className="w-full">
                    {featureGroups.map((item) => {
                      const isOpen = openFeature === item.label;

                      return (
                        <div key={item.label} className="border-b border-black/5 last:border-b-0">
                          <button
                            type="button"
                            aria-expanded={isOpen}
                            onClick={() => setOpenFeature(isOpen ? null : item.label)}
                            className="flex w-full items-center justify-between py-4 text-left"
                          >
                            <span className="text-[8px] uppercase tracking-[0.28em] font-bold text-black/35">
                              {item.label}
                            </span>
                            <motion.span
                              animate={{ rotate: isOpen ? 180 : 0 }}
                              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                              className="text-black/35"
                              aria-hidden="true"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </motion.span>
                          </button>

                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                                className="overflow-hidden"
                              >
                                <motion.div
                                  initial={{ y: -6 }}
                                  animate={{ y: 0 }}
                                  exit={{ y: -6 }}
                                  transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                                  className="grid gap-2 pb-4 pt-0"
                                >
                                  {item.details.map((detail) => (
                                    <span
                                      key={detail}
                                      className="block text-[11px] uppercase tracking-[0.16em] font-medium leading-6 text-black/75 md:text-[12px]"
                                    >
                                      {detail}
                                    </span>
                                  ))}
                                </motion.div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reels Section */}
                <div className="pt-8 space-y-4 border-t border-black/5 mt-8 -mx-4 md:mx-0 overflow-hidden">
                  <div ref={reelsRef} className="w-full cursor-grab active:cursor-grabbing pb-4">
                    <div className="flex touch-pan-y items-center">
                      {[1, 2, 3].map((idx, reelIdx) => (
                        <div key={idx} className="relative h-[340px] flex-[0_0_220px] mx-2 rounded-[8px] overflow-hidden bg-black shadow-lg group">
                          <motion.div
                            initial={false}
                            animate={shouldReduceMotion ? { opacity: 1, scale: 1, y: 0 } : {
                              opacity: activeReel === reelIdx ? 1 : 0.72,
                              scale: activeReel === reelIdx ? 1 : 0.92,
                              y: activeReel === reelIdx ? 0 : 8,
                            }}
                            whileHover={shouldReduceMotion ? undefined : { opacity: 1, scale: 0.98, y: 0 }}
                            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute inset-0"
                          >
                            <video
                              autoPlay
                              muted
                              loop
                              playsInline
                              preload="metadata"
                              className="w-full h-full object-cover brightness-95"
                            >
                              <source src={`/vid_0${idx}.mp4`} type="video/mp4" />
                            </video>

                            <div className="absolute inset-x-2 bottom-2 p-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-[8px] flex items-center justify-between shadow-lg opacity-80 transition-all duration-300 group-hover:opacity-100">
                              <div className="flex flex-col justify-center px-1.5 overflow-hidden">
                                <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-white truncate">Product {idx}</span>
                                <span className="text-[9px] font-garet font-bold text-white mt-0.5">Demo</span>
                              </div>
                              <button
                                onClick={async () => {
                                  if (await verifyOrderable()) {
                                    setOrderOpen(true);
                                  }
                                }}
                                className="shrink-0 bg-white/20 hover:bg-white text-white hover:text-black px-4 py-2 rounded-[8px] text-[8px] font-bold uppercase tracking-widest transition-colors backdrop-blur-sm"
                              >
                                Shop
                              </button>
                            </div>
                          </motion.div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>

      {/* You May Also Like Section */}
      <section className="w-full bg-brand-ivory border-t border-black/20 pt-6 pb-16">
        <motion.div
          ref={mayAlsoRef}
          initial="hidden"
          animate={mayAlsoInView ? "visible" : "hidden"}
          transition={{ staggerChildren: 0.12 }}
          className="mx-auto max-w-[1440px] px-4 md:px-16"
        >
          <motion.h2
            variants={reveal}
            transition={transition}
            className="text-[12px] md:text-sm font-sans uppercase tracking-[0.15em] text-black mb-5 md:mb-6"
          >
            You May Also Like
          </motion.h2>

          <motion.div
            variants={reveal}
            transition={transition}
            className="grid grid-cols-3 gap-1.5 md:gap-2 pb-2 mb-4 md:mb-6"
          >
            <button className="bg-black text-white px-1 md:px-5 py-2.5 md:py-3 rounded-[8px] text-[8px] md:text-[9px] uppercase tracking-[0.1em] md:tracking-[0.2em] font-medium text-center">
              New Arrivals
            </button>
            <button className="border border-black/10 bg-white text-black/40 px-1 md:px-5 py-2.5 md:py-3 rounded-[8px] text-[8px] md:text-[9px] uppercase tracking-[0.1em] md:tracking-[0.2em] font-medium hover:text-black hover:border-black/30 transition-colors text-center">
              Best Sellers
            </button>
            <button className="border border-black/10 bg-white text-black/40 px-1 md:px-5 py-2.5 md:py-3 rounded-[8px] text-[8px] md:text-[9px] uppercase tracking-[0.1em] md:tracking-[0.2em] font-medium hover:text-black hover:border-black/30 transition-colors text-center">
              Essentials
            </button>
          </motion.div>

          <motion.div
            transition={{ staggerChildren: 0.08 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-[1px] md:gap-8 bg-black/10 md:bg-transparent"
          >
            {placeholderProducts.map((p) => (
              <motion.div
                key={p.id}
                variants={reveal}
                transition={transition}
                className="group flex cursor-pointer flex-col bg-brand-ivory"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-[#f6f6f6] flex items-center justify-center">
                  <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-black/25">
                    No image
                  </span>
                </div>
                <div className="px-3 md:px-0 pt-3 pb-4 md:pt-4 md:pb-6 flex flex-col gap-1 md:gap-1.5 border-t border-black/5">
                  <h3 className="text-[11px] md:text-lg font-display font-light uppercase tracking-tight leading-tight text-black line-clamp-1">
                    {p.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] md:text-[10px] font-garet font-bold">
                      {p.price}
                    </span>
                    <span className="text-[7px] md:text-[9px] uppercase tracking-[0.2em] md:tracking-[0.3em] font-medium opacity-30 line-clamp-1">
                      {p.type}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <OrderDialog open={orderOpen} onOpenChange={setOrderOpen} bundle={orderBundle} />
    </Layout>
  );
}
