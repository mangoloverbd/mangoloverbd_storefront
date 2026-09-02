import Layout from "@/components/layout";
import {
  fetchStorefrontProducts,
  formatProductPriceRange,
  getProductImage,
  STOREFRONT_POLL_INTERVAL_MS,
} from "@/lib/storefront-products";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

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
    // Fallback: some mobile Safari engines never fire the initial
    // intersection callback, leaving content stuck at opacity:0 (blank page).
    // Reveal after a short delay so the page is never invisible.
    const fallback = window.setTimeout(() => setInView(true), 1000);
    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return [ref, inView] as const;
}

export default function Home() {
  const {
    data: catalogProducts = [],
    isError: isCatalogError,
    isLoading: isCatalogLoading,
  } = useQuery({
    queryKey: ["merchant-suite-products-listing"],
    queryFn: fetchStorefrontProducts,
    refetchInterval: STOREFRONT_POLL_INTERVAL_MS,
  });

  const transition = { duration: 1, ease: [0.25, 0.1, 0.25, 1] as const };

  const reveal = {
    hidden: { filter: "blur(2px)", transform: "translateY(20%)", opacity: 0 },
    visible: { filter: "blur(0)", transform: "translateY(0)", opacity: 1 },
  };

  const [heroRef] = useReveal();
  const [whatsNewRef, whatsNewInView] = useReveal();
  const [latestDropRef, latestDropInView] = useReveal();
  const [justArrivedRef, justArrivedInView] = useReveal();
  const [specialRef, specialInView] = useReveal();
  const [editorialRef, editorialInView] = useReveal();
  const [essentialsRef, essentialsInView] = useReveal();
  const whatsNewGridRef = useRef<HTMLDivElement>(null);
  const justArrivedGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grids = [whatsNewGridRef.current, justArrivedGridRef.current];
    const cleanups: Array<() => void> = [];
    for (const el of grids) {
      if (!el) continue;
      const onWheel = (event: WheelEvent) => {
        if (event.deltaX !== 0) return;
        const canScrollLeft = el.scrollLeft > 0;
        const canScrollRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 1;
        if ((event.deltaY > 0 && !canScrollRight) || (event.deltaY < 0 && !canScrollLeft)) {
          return;
        }
        event.preventDefault();
        el.scrollLeft += event.deltaY;
      };
      let startX = 0;
      let startY = 0;
      let startScrollLeft = 0;
      let dir: "v" | "h" | null = null;
      const onTouchStart = (event: TouchEvent) => {
        if (event.touches.length !== 1) {
          dir = null;
          return;
        }
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
        startScrollLeft = el.scrollLeft;
        dir = null;
      };
      const onTouchMove = (event: TouchEvent) => {
        if (dir === null && event.touches.length === 1) {
          const dx = event.touches[0].clientX - startX;
          const dy = event.touches[0].clientY - startY;
          if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
            dir = Math.abs(dy) > Math.abs(dx) ? "v" : "h";
          }
        }
        if (dir === "v") {
          el.scrollLeft = startScrollLeft;
        }
      };
      el.addEventListener("wheel", onWheel, { passive: false });
      el.addEventListener("touchstart", onTouchStart, { passive: true });
      el.addEventListener("touchmove", onTouchMove, { passive: true });
      cleanups.push(() => {
        el.removeEventListener("wheel", onWheel);
        el.removeEventListener("touchstart", onTouchStart);
        el.removeEventListener("touchmove", onTouchMove);
      });
    }
    return () => cleanups.forEach((fn) => fn());
  }, []);

  const categories = [
    { label: "Homemade-হোমমেড", image: "/categories/homemade-3.webp" },
    { label: "Honey-মধু", image: "/categories/honey-4.webp" },
    { label: "Oil & Ghee-তেল ও ঘি", image: "/categories/oil-2.webp" },
    { label: "Jaggery-গুড়", image: "/categories/jaggery-1.webp" },
    { label: "Semai-সেমাই", image: "/categories/lachcha-1.webp" },
    { label: "Fresh Mango-ফ্রেশ আম", image: "/categories/mango-1.webp" },
    { label: "Dates-খেজুর", image: "/categories/dates-1.webp" },
    { label: "Nuts & Seeds-বাদাম ও বীজ", image: "/categories/nuts-1.webp" },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="w-full bg-[#f6f6f6] pt-0 pb-0">
        <div className="relative w-full px-0 pt-0 md:px-0 md:pt-0">
          <div
            ref={heroRef}
            className="relative z-10 aspect-[940/1080] w-full overflow-hidden rounded-[6px] bg-white md:aspect-auto md:min-h-[600px]"
          >
            <Link href="/products" className="absolute inset-0 block">
              <img
                src="/hero-mango-lover.webp?v=2"
                alt="ম্যাংগো লাভার — বাংলার সেরা সকল মৌসুমি আম, সরাসরি বাগান থেকে আপনার ঘরে"
                className="h-full w-full object-cover object-top md:hidden"
              />
              <img
                src="/hero-desktop.webp"
                alt="ম্যাংগো লাভার — বাংলার সেরা সকল মৌসুমি আম, সরাসরি বাগান থেকে আপনার ঘরে"
                className="hidden md:block h-full w-full object-cover object-top"
              />
            </Link>
            {/* Foggy gradient bottom blend */}
            <div
              className="absolute bottom-0 left-0 right-0 h-32 md:h-48 pointer-events-none"
              style={{ background: "linear-gradient(to top, #f6f6f6 0%, #f6f6f6 15%, transparent 100%)" }}
            />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-20 w-14 bg-gradient-to-r from-[#f6f6f6]/65 via-[#f6f6f6]/30 to-transparent blur-[2px] md:hidden"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-20 w-14 bg-gradient-to-l from-[#f6f6f6]/65 via-[#f6f6f6]/30 to-transparent blur-[2px] md:hidden"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 z-20 h-28 w-24 bg-gradient-to-br from-[#f6f6f6]/75 via-[#f6f6f6]/35 to-transparent blur-[2px] md:hidden"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 z-20 h-28 w-24 bg-gradient-to-bl from-[#f6f6f6]/75 via-[#f6f6f6]/35 to-transparent blur-[2px] md:hidden"
          />
        </div>
      </section>

      {/* Categories Section */}
      <section className="w-full bg-[#f5f5f5] pb-2 pt-8 md:pb-3 md:pt-12">
        <div className="mx-auto max-w-[1500px] px-4 md:px-8 xl:px-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center"
          >
            <h2 className="text-[clamp(1.9rem,5vw,3rem)] font-normal tracking-[-0.02em] text-black">
              <span className="font-medium">আমাদের</span>{" "}
              <span
                className="relative inline-block"
                style={{ fontFamily: "'IhtishamDeshlipi', serif" }}
              >
                ক্যাটাগরিসমূহ
                <svg
                  aria-hidden="true"
                  viewBox="0 0 120 60"
                  preserveAspectRatio="none"
                  className="pointer-events-none absolute left-1/2 top-1/2 h-[165%] w-[140%] -translate-x-1/2 -translate-y-1/2"
                  style={{ overflow: "visible" }}
                >
                  <path
                    d="M14,32 C9,15 48,6 72,8 C108,11 116,22 112,34 C108,49 56,56 32,52 C13,49 9,42 15,30"
                    fill="none"
                    stroke="#FBBB14"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.05 }}
            className="no-scrollbar -mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 sm:mx-auto sm:max-w-[820px] sm:grid sm:grid-cols-4 sm:gap-x-6 sm:gap-y-8 sm:overflow-visible sm:pb-0"
          >
            {categories.map(({ label, image }) => (
              <Link
                key={label}
                href="/products"
                className="group flex w-[96px] shrink-0 snap-start flex-col items-center text-center sm:w-auto"
              >
                <div className="aspect-square w-[104px] overflow-hidden rounded-full sm:w-[112px]">
                  <img
                    src={image}
                    alt={label}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
                <span className="mt-3 block text-center text-[13px] font-semibold leading-tight tracking-[0.01em] text-black/80 transition-colors duration-300 group-hover:text-black md:text-[14px]">
                  {label.includes("-") ? (
                    <>
                      <span className="block md:inline">{label.split("-")[0]}</span>
                      <span className="hidden md:inline">-</span>
                      <span className="block md:inline">{label.split("-")[1]}</span>
                    </>
                  ) : (
                    <span>{label}</span>
                  )}
                </span>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* What's New Section */}
      <section className="w-full overflow-hidden bg-[#f6f6f6] py-10 md:py-16">
        <motion.div
          ref={whatsNewRef}
          className="mx-auto max-w-[1500px] px-4 md:px-8 xl:px-12"
          initial="hidden"
          animate={whatsNewInView ? "visible" : "hidden"}
          transition={{ staggerChildren: 0.12 }}
        >
          <motion.div
            variants={reveal}
            transition={transition}
            className="flex items-center justify-between gap-2 overflow-hidden"
          >
            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto no-scrollbar md:gap-3">
              <span className="shrink-0 whitespace-nowrap text-[21px] font-medium text-black md:text-[22px]" style={{ fontFamily: "'IhtishamDeshlipi', serif" }}>বাদাম ও বীজ</span>
              <span className="shrink-0 whitespace-nowrap text-[21px] font-light text-black/30 md:text-[22px]">|</span>
              <span className="shrink-0 whitespace-nowrap text-[21px] font-medium text-black/60 md:text-[22px]" style={{ fontFamily: "'IhtishamDeshlipi', serif" }}>তেল ও ঘি</span>
              <span className="shrink-0 whitespace-nowrap text-[21px] font-light text-black/30 md:text-[22px]">|</span>
              <span className="shrink-0 whitespace-nowrap text-[21px] font-medium text-black/60 md:text-[22px]" style={{ fontFamily: "'IhtishamDeshlipi', serif" }}>মধু</span>
            </div>
            <Link
              href="/products"
              className="shrink-0 whitespace-nowrap border-b-2 border-black pb-1 text-[15px] font-medium text-black transition-opacity hover:opacity-60 md:text-[18px]"
              style={{ fontFamily: "'IhtishamDeshlipi', serif" }}
            >
              এখনই কিনুন
            </Link>
          </motion.div>

          <motion.div
            ref={whatsNewGridRef}
            transition={{ staggerChildren: 0.08 }}
            className="mt-8 grid grid-cols-2 gap-2 md:mt-12 md:gap-4 lg:grid-cols-4"
          >
            {isCatalogLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-[3/4] animate-pulse bg-[#e5e5e5] motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                ))
              : isCatalogError && catalogProducts.length === 0
                ? (
                    <div className="w-full border border-black/10 bg-white px-6 py-10 text-center">
                      <p className="text-sm uppercase tracking-[0.2em] text-black/60">Could not load products right now.</p>
                      <p className="mt-2 text-xs text-black/40">Please try again shortly.</p>
                    </div>
                  )
                : catalogProducts.slice(0, 6).map((product) => {
                    const image = getProductImage(product);

                    return (
                      <motion.article
                        key={product.id || product.slug}
                        variants={reveal}
                        transition={transition}
                        className="group min-w-0"
                      >
                        <Link href={`/product/${product.slug}`} className="block h-full">
                          <div className="relative aspect-[3/4] overflow-hidden bg-[#e5e5e5]">
                            {image ? (
                              <img
                                src={image}
                                alt={product.name}
                                loading="lazy"
                                className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.3em] text-black/30">
                                No image
                              </div>
                            )}
                            {product.available === false && (
                              <span className="absolute left-4 top-4 bg-neutral-500/70 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.3em] text-white">
                                Sold out
                              </span>
                            )}
                          </div>

                          <div className="space-y-2 pl-0 pr-3 pb-4 pt-3 md:pl-0 md:pr-4 md:pb-5">
                            <h3 className="line-clamp-2 min-h-[2.4em] text-sm font-bold uppercase leading-tight tracking-[0.06em] md:min-h-[2.35em] md:text-base md:tracking-[0.08em]">
                              {product.name}
                            </h3>
                            <p className="mt-4 whitespace-nowrap text-sm font-normal tracking-[0.02em] md:text-xl">
                              {formatProductPriceRange(product)}
                            </p>
                          </div>
                        </Link>
                      </motion.article>
                    );
                  })}
          </motion.div>
        </motion.div>
      </section>

      {/* Latest Drop Section */}
      <section className="w-full bg-[#f6f6f6] py-10 md:py-16">
        <motion.div
          ref={latestDropRef}
          className="mx-auto max-w-[1500px] px-4 md:px-8 xl:px-12"
          initial="hidden"
          animate={latestDropInView ? "visible" : "hidden"}
          transition={{ staggerChildren: 0.12 }}
        >
          <motion.div
            variants={reveal}
            transition={transition}
            className="mb-7 flex items-start justify-between gap-6 md:mb-12"
          >
            <motion.h2
              className="text-[clamp(2rem,5vw,2.6rem)] font-bold leading-none tracking-[-0.04em] text-black"
            >
              Latest <span className="font-display italic text-[1.15em]">Drop</span>
            </motion.h2>

            <Link
              href="/products"
              className="mt-1.5 shrink-0 border-b-2 border-black pb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-black transition-opacity hover:opacity-60 md:mt-2 md:text-base md:tracking-[0.24em]"
            >
              Discover More
            </Link>
          </motion.div>

          <motion.div
            transition={{ staggerChildren: 0.08 }}
            className="grid grid-cols-2 gap-2 md:gap-4 lg:grid-cols-4"
          >
            {isCatalogLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-[3/4] animate-pulse bg-[#e5e5e5] motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                ))
              : isCatalogError && catalogProducts.length === 0
                ? (
                    <div className="col-span-full border border-black/10 bg-white px-6 py-10 text-center">
                      <p className="text-sm uppercase tracking-[0.2em] text-black/60">Could not load products right now.</p>
                      <p className="mt-2 text-xs text-black/40">Please try again shortly.</p>
                    </div>
                  )
                : catalogProducts.slice(0, 4).map((product) => {
                    const image = getProductImage(product);

                    return (
                      <motion.article
                        key={product.id || product.slug}
                        variants={reveal}
                        transition={transition}
                        className="group min-w-0"
                      >
                        <Link href={`/product/${product.slug}`} className="block h-full">
                          <div className="relative aspect-[3/4] overflow-hidden bg-[#e5e5e5]">
                            {image ? (
                              <img
                                src={image}
                                alt={product.name}
                                loading="lazy"
                                className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.3em] text-black/30">
                                No image
                              </div>
                            )}
                            {product.available === false && (
                              <span className="absolute left-4 top-4 bg-neutral-500/70 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.3em] text-white">
                                Sold out
                              </span>
                            )}
                          </div>
                          <div className="space-y-2 pl-0 pr-3 pb-4 pt-3 md:pl-0 md:pr-4 md:pb-5">
                            <h3 className="line-clamp-2 min-h-[2.4em] text-sm font-bold uppercase leading-tight tracking-[0.06em] md:min-h-[2.35em] md:text-base md:tracking-[0.08em]">
                              {product.name}
                            </h3>
                            <p className="mt-4 whitespace-nowrap text-sm font-normal tracking-[0.02em] md:text-xl">
                              {formatProductPriceRange(product)}
                            </p>
                          </div>
                        </Link>
                      </motion.article>
                    );
                  })}
          </motion.div>
        </motion.div>
      </section>

      {/* Just Arrived Section */}
      <section className="w-full bg-[#f6f6f6] pb-12 pt-2 md:pb-20 md:pt-4">
        <motion.div
          ref={justArrivedRef}
          className="mx-auto max-w-[1500px] pl-4 md:px-8 xl:px-12"
          initial="hidden"
          animate={justArrivedInView ? "visible" : "hidden"}
          transition={{ staggerChildren: 0.12 }}
        >
          <motion.div
            variants={reveal}
            transition={transition}
            className="mb-7 flex items-start justify-between gap-6 pr-4 md:mb-12 md:pr-0"
          >
            <motion.h2
              className="text-[clamp(2rem,5vw,2.6rem)] font-bold leading-none tracking-[-0.04em] text-black"
            >
              Just <span className="font-display italic text-[1.15em]">arrived</span>
            </motion.h2>

            <Link
              href="/products"
              className="mt-1.5 shrink-0 border-b-2 border-black pb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-black transition-opacity hover:opacity-60 md:mt-2 md:text-base md:tracking-[0.24em]"
            >
              VIEW ALL
            </Link>
          </motion.div>

          <motion.div
            ref={justArrivedGridRef}
            transition={{ staggerChildren: 0.08 }}
            className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden [touch-action:pan-x_pan-y] overscroll-x-contain md:grid md:grid-cols-4 md:gap-4 md:overflow-visible"
          >
            {isCatalogLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-[3/4] min-w-[78vw] snap-start snap-always animate-pulse bg-[#eeeeee] motion-reduce:animate-none md:min-w-0"
                    aria-hidden="true"
                  />
                ))
              : isCatalogError && catalogProducts.length === 0
                ? (
                    <div className="w-full border border-black/10 bg-white px-6 py-10 text-center">
                      <p className="text-sm uppercase tracking-[0.2em] text-black/60">Could not load products right now.</p>
                      <p className="mt-2 text-xs text-black/40">Please try again shortly.</p>
                    </div>
                  )
                : catalogProducts.slice(0, 4).map((product) => {
                    const image = getProductImage(product);

                    return (
                      <motion.article
                        key={product.id || product.slug}
                        variants={reveal}
                        transition={transition}
                        className="group min-w-[78vw] snap-start snap-always md:min-w-0"
                      >
                        <Link href={`/product/${product.slug}`} className="block h-full">
                          <div className="relative aspect-[3/4] overflow-hidden bg-[#eeeeee]">
                            {image ? (
                              <img
                                src={image}
                                alt={product.name}
                                loading="lazy"
                                className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.3em] text-black/30">
                                No image
                              </div>
                            )}
                            {product.available === false && (
                              <span className="absolute left-4 top-4 bg-neutral-500/70 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.3em] text-white">
                                Sold out
                              </span>
                            )}
                          </div>

                          <div className="px-0 pb-2 pt-5 text-black md:pt-7">
                            <h3 className="text-base font-bold uppercase leading-tight tracking-[0.06em] md:min-h-[2.35em] md:text-xl md:tracking-[0.08em]">
                              {product.name}
                            </h3>
                            <p className="mt-4 text-xl font-normal tracking-[0.02em] md:text-2xl">
                              {formatProductPriceRange(product)}
                            </p>
                          </div>
                        </Link>
                      </motion.article>
                    );
                  })}
          </motion.div>
        </motion.div>
      </section>

      {/* Editorial Section */}
      <section className="w-full bg-[#f6f6f6]">
        <motion.div
          ref={editorialRef}
          className="w-full"
          initial="hidden"
          animate={editorialInView ? "visible" : "hidden"}
          transition={{ staggerChildren: 0.12 }}
        >
          <div className="relative w-full overflow-hidden">
            <img
              src="/curated-edit-bg-mobile.webp"
              alt="Editorial collection"
              loading="lazy"
              className="w-full object-cover md:hidden"
            />
            <img
              src="/curated-edit-bg.webp"
              alt="Editorial collection"
              loading="lazy"
              className="hidden md:block w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/35" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <motion.h2
                variants={reveal}
                transition={transition}
                className="text-[clamp(2rem,5vw,3rem)] font-bold leading-none tracking-[-0.04em] text-white"
                style={{ fontFamily: "'IhtishamDeshlipi', serif" }}
              >
                খাঁটি ঘি
              </motion.h2>
              <motion.p
                variants={reveal}
                transition={transition}
                className="mt-4 max-w-lg text-sm leading-relaxed text-white/80 md:text-base"
                style={{ fontFamily: "'IhtishamDeshlipi', serif" }}
              >
                উন্নত মানের দুধ থেকে তৈরি, সমৃদ্ধ স্বাদ ও সুগন্ধের খাঁটি ঘি
              </motion.p>
              <motion.div variants={reveal} transition={transition} className="mt-8">
                <Link
                  href="/products"
                  className="border-b-2 border-white pb-1 text-[18px] font-medium text-white transition-opacity hover:opacity-60 md:text-lg"
                  style={{ fontFamily: "'IhtishamDeshlipi', serif" }}
                >
                  এখনই কিনুন
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Essentials Section */}
      <section className="w-full bg-[#f6f6f6] pb-12 pt-2 md:pb-20 md:pt-4">
        <motion.div
          ref={essentialsRef}
          className="w-full"
          initial="hidden"
          animate={essentialsInView ? "visible" : "hidden"}
          transition={{ staggerChildren: 0.12 }}
        >
          <div className="relative w-full overflow-hidden">
            <img
              src="/essentials-bg-mobile.webp"
              alt="Daily essentials"
              loading="lazy"
              className="w-full object-cover md:hidden"
            />
            <img
              src="/essentials-bg.webp"
              alt="Daily essentials"
              loading="lazy"
              className="hidden md:block w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <motion.h2
                variants={reveal}
                transition={transition}
                className="text-[clamp(2rem,5vw,3rem)] font-bold leading-none tracking-[-0.04em] text-white"
                style={{ fontFamily: "'IhtishamDeshlipi', serif" }}
              >
                কালোজিরা মিক্সড
              </motion.h2>
              <motion.p
                variants={reveal}
                transition={transition}
                className="mt-4 max-w-lg text-sm leading-relaxed text-white/80 md:text-base"
                style={{ fontFamily: "'IhtishamDeshlipi', serif" }}
              >
                প্রাকৃতিক কালোজিরার গুণে তৈরি, অনন্য স্বাদ ও পুষ্টিগুণে ভরপুর স্বাস্থ্যকর মিশ্রণ
              </motion.p>
              <motion.div variants={reveal} transition={transition} className="mt-8">
                <Link
                  href="/products"
                  className="border-b-2 border-white pb-1 text-[18px] font-medium text-white transition-opacity hover:opacity-60 md:text-lg"
                  style={{ fontFamily: "'IhtishamDeshlipi', serif" }}
                >
                  এখনই কিনুন
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Special Collections Section */}
      <section className="w-full bg-[#f6f6f6] pb-12 pt-2 md:pb-20 md:pt-4">
        <motion.div
          ref={specialRef}
          className="mx-auto max-w-[1500px] pl-4 md:px-8 xl:px-12"
          initial="hidden"
          animate={specialInView ? "visible" : "hidden"}
          transition={{ staggerChildren: 0.12 }}
        >
          <motion.div
            variants={reveal}
            transition={transition}
            className="mb-7 flex items-start justify-between gap-6 pr-4 md:mb-12 md:pr-0"
          >
            <motion.h2 className="text-[clamp(2rem,5vw,2.6rem)] font-bold leading-none tracking-[-0.04em] text-black">
              Our <span className="font-display italic text-[1.15em]">special</span> collections
            </motion.h2>
            <Link
              href="/products"
              className="mt-8 shrink-0 border-b-2 border-black pb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-black transition-opacity hover:opacity-60 md:mt-2 md:text-base md:tracking-[0.24em]"
            >
              EXPLORE ALL
            </Link>
          </motion.div>

          <motion.div
            className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden [touch-action:pan-x_pan-y] overscroll-x-contain md:grid md:grid-cols-3 md:gap-4 md:overflow-visible"
          >
            {isCatalogLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-[3/4] min-w-[78vw] snap-start snap-always animate-pulse bg-[#eeeeee] motion-reduce:animate-none md:min-w-0"
                    aria-hidden="true"
                  />
                ))
              : isCatalogError && catalogProducts.length === 0
                ? (
                    <div className="w-full border border-black/10 bg-white px-6 py-10 text-center">
                      <p className="text-sm uppercase tracking-[0.2em] text-black/60">Could not load products right now.</p>
                      <p className="mt-2 text-xs text-black/40">Please try again shortly.</p>
                    </div>
                  )
                : catalogProducts.slice(0, 3).map((product) => {
                    const image = getProductImage(product);

                    return (
                      <motion.article
                        key={product.id || product.slug}
                        variants={reveal}
                        transition={transition}
                        className="group min-w-[78vw] snap-start snap-always md:min-w-0"
                      >
                        <Link href={`/product/${product.slug}`} className="block h-full">
                          <div className="relative aspect-[3/4] overflow-hidden bg-[#eeeeee]">
                            {image ? (
                              <img
                                src={image}
                                alt={product.name}
                                loading="lazy"
                                className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.3em] text-black/30">
                                No image
                              </div>
                            )}
                            {product.available === false && (
                              <span className="absolute left-4 top-4 bg-neutral-500/70 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.3em] text-white">
                                Sold out
                              </span>
                            )}
                          </div>

                          <div className="px-0 pb-2 pt-5 text-center text-black md:pt-7">
                            <h3 className="text-base font-bold uppercase leading-tight tracking-[0.06em] md:text-xl md:tracking-[0.08em]">
                              {product.name}
                            </h3>
                            <p className="mt-4 text-xl font-normal tracking-[0.02em] md:text-2xl">
                              {formatProductPriceRange(product)}
                            </p>
                          </div>
                        </Link>
                      </motion.article>
                    );
                  })}
          </motion.div>
        </motion.div>
      </section>

    </Layout>
  );
}
