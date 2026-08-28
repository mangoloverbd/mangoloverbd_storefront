import Layout from "@/components/layout";
import { useCart } from "@/contexts/cart-context";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { Link } from "wouter";

const latestDropProducts = [
  {
    title: "কালোজিরা ফুলের মধু | Black Seed Flower Honey",
    slug: "black-seed-flower-honey",
    price: "৳ 700.00 – ৳ 1,400.00",
    image: "https://ldiktvcavyabivpxfwpn.supabase.co/storage/v1/object/public/product-images/3cd26e57-85ef-4970-94a4-cd99c0f1b554/814979aa-8446-429b-917f-e6d94cf6b334/05e5a077-a545-4e4d-8402-cc5b1204a6c7.webp",
  },
  {
    title: "সুন্দরবনের চাকের মধু | Sundarbans Natural Honey",
    slug: "sundarbans-natural-honey",
    price: "৳ 750.00 – ৳ 1,400.00",
    image: "https://ldiktvcavyabivpxfwpn.supabase.co/storage/v1/object/public/product-images/3cd26e57-85ef-4970-94a4-cd99c0f1b554/4d3a76b0-89e7-4601-96e5-86a3b971791c/977eb6df-1f95-4f3c-9539-becdd54250e3.webp",
  },
  {
    title: "Linen Baggy Trouser - Clean White",
    slug: "linen-baggy-trouser-clean-white",
    price: "৳ 799.00",
    image: "/new1.webp",
  },
  {
    title: "Linen Baggy Trouser - Earthy Olive",
    slug: "linen-baggy-trouser-earthy-olive",
    price: "৳ 799.00",
    image: "/new2.webp",
  },
  {
    title: "Linen Baggy Trouser - Black",
    slug: "linen-baggy-trouser-black",
    price: "৳ 799.00",
    image: "/new3.webp",
  },
  {
    title: "Linen Baggy Trouser - Cocoa Brown",
    slug: "linen-baggy-trouser-cocoa-brown",
    price: "৳ 799.00",
    image: "/new4.webp",
  },
];

const whatsNewProducts = [
  {
    id: 205,
    title: "কালোজিরা ফুলের মধু | Black Seed Flower Honey",
    slug: "black-seed-flower-honey",
    price: "৳ 700.00 – ৳ 1,400.00",
    sizeLabel: "Default",
    image: "https://ldiktvcavyabivpxfwpn.supabase.co/storage/v1/object/public/product-images/3cd26e57-85ef-4970-94a4-cd99c0f1b554/814979aa-8446-429b-917f-e6d94cf6b334/05e5a077-a545-4e4d-8402-cc5b1204a6c7.webp",
  },
  {
    id: 206,
    title: "সুন্দরবনের চাকের মধু | Sundarbans Natural Honey",
    slug: "sundarbans-natural-honey",
    price: "৳ 750.00 – ৳ 1,400.00",
    sizeLabel: "Default",
    image: "https://ldiktvcavyabivpxfwpn.supabase.co/storage/v1/object/public/product-images/3cd26e57-85ef-4970-94a4-cd99c0f1b554/4d3a76b0-89e7-4601-96e5-86a3b971791c/977eb6df-1f95-4f3c-9539-becdd54250e3.webp",
  },
  {
    id: 201,
    title: "Black Blazer Dress",
    slug: "black-blazer-dress",
    price: "৳ 1,690.00",
    sizeLabel: "Default",
    image: "/new1.webp",
  },
  {
    id: 202,
    title: "Black High Leggings",
    slug: "black-high-leggings",
    price: "৳ 990.00",
    sizeLabel: "Default",
    image: "/new2.webp",
  },
  {
    id: 203,
    title: "Clean White Trouser",
    slug: "clean-white-trouser",
    price: "৳ 799.00",
    sizeLabel: "Default",
    image: "/new3.webp",
  },
  {
    id: 204,
    title: "Cocoa Brown Trouser",
    slug: "cocoa-brown-trouser",
    price: "৳ 799.00",
    sizeLabel: "Default",
    image: "/new4.webp",
  },
];

const justArrivedProducts = [
  {
    id: 101,
    title: "Black Blazer Dress",
    slug: "black-blazer-dress",
    price: "৳ 1,690.00",
    sizeLabel: "Default",
    sizes: 5,
    image: "/new1.webp",
  },
  {
    id: 102,
    title: "Black High Leggings",
    slug: "black-high-leggings",
    price: "৳ 990.00",
    sizeLabel: "Default",
    sizes: 4,
    image: "/new2.webp",
  },
  {
    id: 103,
    title: "Clean White Trouser",
    slug: "clean-white-trouser",
    price: "৳ 799.00",
    sizeLabel: "Default",
    sizes: 5,
    image: "/new3.webp",
  },
  {
    id: 104,
    title: "Cocoa Brown Trouser",
    slug: "cocoa-brown-trouser",
    price: "৳ 799.00",
    sizeLabel: "Default",
    sizes: 3,
    image: "/new4.webp",
  },
];

const specialProducts = [
  {
    id: 301,
    title: "Top 10",
    slug: "cocoa-brown-trouser",
    count: "10",
    price: "৳ 1,290.00",
    sizeLabel: "Default",
    image: "/new4.webp",
  },
  {
    id: 302,
    title: "Accessories",
    slug: "clean-white-trouser",
    count: "12",
    price: "৳ 890.00",
    sizeLabel: "Default",
    image: "/pexels-ekrulila-26316180_1.jpg",
  },
  {
    id: 303,
    title: "Bottoms",
    slug: "black-high-leggings",
    count: "08",
    price: "৳ 1,190.00",
    sizeLabel: "Default",
    image: "/new3.webp",
  },
];

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

export default function Home() {
  const { addToCart } = useCart();

  const transition = { duration: 1, ease: [0.25, 0.1, 0.25, 1] as const };

  const reveal = {
    hidden: { filter: "blur(10px)", transform: "translateY(20%)", opacity: 0 },
    visible: { filter: "blur(0)", transform: "translateY(0)", opacity: 1 },
  };

  const [heroRef, heroInView] = useReveal();
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

  function quickAddJustArrived(
    event: MouseEvent<HTMLButtonElement>,
    product: (typeof justArrivedProducts)[number],
  ) {
    event.preventDefault();
    event.stopPropagation();
    addToCart(
      {
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
      },
      product.sizeLabel,
    );
  }

  function quickAddSpecial(
    event: MouseEvent<HTMLButtonElement>,
    product: (typeof specialProducts)[number],
  ) {
    event.preventDefault();
    event.stopPropagation();
    addToCart(
      {
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
      },
      product.sizeLabel,
    );
  }

  function quickAddWhatsNew(
    event: MouseEvent<HTMLButtonElement>,
    product: (typeof whatsNewProducts)[number],
  ) {
    event.preventDefault();
    event.stopPropagation();
    addToCart(
      {
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
      },
      product.sizeLabel,
    );
  }

  const categories = [
    { label: "Homemade-হোমমেড", image: "/categories/category-default.png" },
    { label: "Honey-মধু", image: "/categories/honey-4.webp" },
    { label: "Oil & Ghee-তেল ও ঘি", image: "/categories/oil-1.webp" },
    { label: "Jaggery & Sugar-গুড় ও চিনি", image: "/categories/jaggery-1.webp" },
    { label: "Lachcha Semai-লাচ্ছা সেমাই", image: "/categories/lachcha-1.webp" },
    { label: "Fresh Mango-ফ্রেশ আম", image: "/categories/mango-1.webp" },
    { label: "Dates-খেজুর", image: "/categories/dates-1.webp" },
    { label: "Nuts & Seeds-বাদাম ও বীজ", image: "/categories/nuts-1.webp" },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="w-full bg-[#f6f6f6] pt-0 pb-0">
        <div className="w-full px-0">
          <div
            ref={heroRef}
            className="relative aspect-[940/1298] w-full overflow-hidden bg-[#FBBB14] md:aspect-auto md:min-h-[760px]"
          >
            <Link href="/products" className="absolute inset-0 block">
              <img
                src="/hero-mango-lover.webp"
                alt="ম্যাংগো লাভার — বাংলার সেরা সকল মৌসুমি আম, সরাসরি বাগান থেকে আপনার ঘরে"
                className="h-full w-full object-cover object-bottom md:object-contain md:object-center"
              />
            </Link>

            <motion.div
              variants={reveal}
              initial="hidden"
              animate={heroInView ? "visible" : "hidden"}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const, staggerChildren: 0.08, delayChildren: 0.1 }}
              className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-end px-6 pb-12 text-center md:px-16 md:pb-12"
            >
              <motion.div variants={reveal}>
                <Link
                  href="/products"
                  className="pointer-events-auto inline-flex w-fit items-center justify-center rounded-[4px] border-2 border-[#163B33] bg-[#FBBB14]/80 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.28em] text-[#163B33] backdrop-blur-sm transition-colors hover:bg-[#163B33] hover:text-[#FBBB14] md:px-7 md:py-3 md:text-base"
                >
                  DISCOVER MORE
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="w-full bg-[#f5f5f5] py-8 md:py-12">
        <div className="mx-auto max-w-[1500px] px-4 md:px-8 xl:px-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
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
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
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
                  <span className="block md:inline">{label.split("-")[0]}-</span>
                  <span className="block md:inline">{label.split("-")[1]}</span>
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
          className="mx-auto max-w-[1500px] pl-4 md:px-8 xl:px-12"
          initial="hidden"
          animate={whatsNewInView ? "visible" : "hidden"}
          transition={{ staggerChildren: 0.12 }}
        >
          <motion.p
            variants={reveal}
            transition={transition}
            className="text-center text-sm font-bold uppercase tracking-[0.55em] text-black md:text-2xl"
          >
            WHAT'S NEW
          </motion.p>

          <motion.div
            variants={reveal}
            transition={transition}
            className="mt-9 grid grid-cols-3 gap-2 text-center text-[clamp(2rem,5vw,2.6rem)] font-bold leading-none tracking-[-0.04em] md:mt-14 md:flex md:justify-center md:gap-12"
          >
            <span className="text-black">Jackets</span>
            <span className="text-black/25">Hoodies</span>
            <span className="text-black/25">T-Shirt</span>
          </motion.div>

          <motion.div
            ref={whatsNewGridRef}
            transition={{ staggerChildren: 0.08 }}
            className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden [touch-action:pan-x_pan-y] overscroll-x-contain md:mt-16 md:grid md:grid-cols-4 md:overflow-visible"
          >
            {whatsNewProducts.map((product, index) => (
              <motion.article
                key={product.title}
                variants={reveal}
                transition={transition}
                className="group min-w-[78vw] snap-start snap-always md:min-w-0"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-[#ededed]">
                  <Link href={`/product/${product.slug}`} className="block h-full">
                    <img
                      src={product.image}
                      alt={product.title}
                      loading="lazy"
                      className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    />
                  </Link>
                  <span className="absolute left-5 top-5 bg-neutral-500/60 text-xs font-bold uppercase tracking-[0.35em] text-white backdrop-blur-md md:left-6 md:top-6 md:text-lg">
                    LAST FEW
                  </span>
                  <button
                    type="button"
                    aria-label={`Quick add ${product.title} from What's New to cart`}
                    onClick={(event) => quickAddWhatsNew(event, product)}
                      className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-black text-2xl font-extralight leading-none text-white shadow-xl shadow-black/20 transition-transform duration-300 hover:scale-105 md:bottom-5 md:right-5 md:h-12 md:w-12 md:text-3xl"
                    >
                      +
                  </button>
                </div>

                <Link href={`/product/${product.slug}`} className="block pb-2 pt-5 text-black md:pt-7">
                  <h3 className="text-lg font-medium uppercase leading-tight tracking-[0.08em] md:min-h-[2.4em] md:text-2xl">
                    {product.title}
                  </h3>
                  <p className="mt-3 text-xl font-normal tracking-[0.01em] text-black md:text-2xl">{product.price}</p>
                </Link>
              </motion.article>
            ))}
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
            {latestDropProducts.map((product, index) => (
              <motion.article
                key={product.title}
                variants={reveal}
                transition={transition}
                className="group bg-[#f6f6f6]"
              >
                <Link href={`/product/${product.slug}`} className="block h-full">
                  <div className="aspect-[3/4] overflow-hidden bg-[#e5e5e5]">
                    <img
                      src={product.image}
                      alt={product.title}
                      loading="lazy"
                      className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-2 pl-0 pr-3 pb-4 pt-3 md:pl-0 md:pr-4 md:pb-5">
                    <h3 className="line-clamp-2 min-h-[2.4em] text-sm font-bold uppercase leading-tight tracking-[0.06em] md:min-h-[2.35em] md:text-base md:tracking-[0.08em]">
                      {product.title}
                    </h3>
                    <p className="mt-4 whitespace-nowrap text-sm font-normal tracking-[0.02em] md:text-xl">{product.price}</p>
                  </div>
                </Link>
              </motion.article>
            ))}
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
            {justArrivedProducts.map((product, index) => (
              <motion.article
                key={product.title}
                variants={reveal}
                transition={transition}
                className="group min-w-[78vw] snap-start snap-always md:min-w-0"
              >
                <div className="h-full">
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#eeeeee]">
                    <Link href={`/product/${product.slug}`} className="block h-full">
                    <img
                      src={product.image}
                      alt={product.title}
                      loading="lazy"
                      className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    />
                    </Link>
                    <button
                      type="button"
                      aria-label={`Quick add ${product.title} to cart`}
                      onClick={(event) => quickAddJustArrived(event, product)}
                      className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-black text-2xl font-extralight leading-none text-white shadow-xl shadow-black/20 transition-transform duration-300 hover:scale-105 md:bottom-5 md:right-5 md:h-12 md:w-12 md:text-3xl"
                    >
                      +
                    </button>
                  </div>

                  <Link href={`/product/${product.slug}`} className="block px-0 pb-2 pt-5 text-black md:pt-7">
                    <h3 className="text-base font-bold uppercase leading-tight tracking-[0.06em] md:min-h-[2.35em] md:text-xl md:tracking-[0.08em]">
                      {product.title}
                    </h3>
                    <p className="mt-4 text-xl font-normal tracking-[0.02em] md:text-2xl">{product.price}</p>
                    <p className="mt-8 text-lg font-normal tracking-[0.01em] text-black/45 md:text-2xl">
                      Available in {product.sizes} size
                    </p>
                  </Link>
                </div>
              </motion.article>
            ))}
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
              src="/pexels-alessandra-shalbe-859114866-20446138_1.webp"
              alt="Editorial collection"
              loading="lazy"
              className="w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/35" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <motion.h2
                variants={reveal}
                transition={transition}
                className="text-[clamp(2rem,5vw,3rem)] font-bold leading-none tracking-[-0.04em] text-white"
              >
                The Curated Edit
              </motion.h2>
              <motion.p
                variants={reveal}
                transition={transition}
                className="mt-4 max-w-lg text-sm leading-relaxed text-white/80 md:text-base"
              >
                Thoughtfully selected pieces to redefine your everyday wardrobe
              </motion.p>
              <motion.div variants={reveal} transition={transition} className="mt-8">
                <Link
                  href="/products"
                  className="border-b-2 border-white pb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-60 md:text-base md:tracking-[0.24em]"
                >
                  EXPLORE THE EDIT
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
              src="/pexels-ekrulila-26316180_1.jpg"
              alt="Daily essentials"
              loading="lazy"
              className="w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <motion.h2
                variants={reveal}
                transition={transition}
                className="text-[clamp(2rem,5vw,3rem)] font-bold leading-none tracking-[-0.04em] text-white"
              >
                Daily Essentials
              </motion.h2>
              <motion.p
                variants={reveal}
                transition={transition}
                className="mt-4 max-w-lg text-sm leading-relaxed text-white/80 md:text-base"
              >
                Minimal staples crafted for comfort and timeless style
              </motion.p>
              <motion.div variants={reveal} transition={transition} className="mt-8">
                <Link
                  href="/products"
                  className="border-b-2 border-white pb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-60 md:text-base md:tracking-[0.24em]"
                >
                  SHOP ESSENTIALS
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
            {specialProducts.map((product) => (
              <motion.article
                key={product.title}
                variants={reveal}
                transition={transition}
                className="group min-w-[78vw] snap-start snap-always md:min-w-0"
              >
                <div className="h-full">
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#eeeeee]">
                    <Link href={`/product/${product.slug}`} className="block h-full">
                      <img
                        src={product.image}
                        alt={product.title}
                        loading="lazy"
                        className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      />
                    </Link>
                  </div>
                  <Link href={`/product/${product.slug}`} className="block px-0 pb-2 pt-5 text-center text-black md:pt-7">
                    <h3 className="text-base font-bold uppercase leading-tight tracking-[0.06em] md:text-xl md:tracking-[0.08em]">
                      {product.title}
                      <sup className="ml-0.5 text-xs font-medium tracking-[0.1em] text-black/50 align-super md:text-sm">
                        {product.count}
                      </sup>
                    </h3>
                  </Link>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </motion.div>
      </section>

    </Layout>
  );
}
