import Layout from "@/components/layout";
import { useCart } from "@/contexts/cart-context";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { Link } from "wouter";
import { TypingEffect } from "@/components/ui/typing-effect";

const latestDropProducts = [
  {
    title: "Linen Baggy Trouser - Clean White",
    price: "৳ 799.00",
    image: "/new1.webp",
  },
  {
    title: "Linen Baggy Trouser - Earthy Olive",
    price: "৳ 799.00",
    image: "/new2.webp",
  },
  {
    title: "Linen Baggy Trouser - Black",
    price: "৳ 799.00",
    image: "/new3.webp",
  },
  {
    title: "Linen Baggy Trouser - Cocoa Brown",
    price: "৳ 799.00",
    image: "/new4.webp",
  },
];

const whatsNewProducts = [
  {
    id: 201,
    title: "Black Blazer Dress",
    price: "৳ 1,690.00",
    sizeLabel: "Default",
    image: "/new1.webp",
  },
  {
    id: 202,
    title: "Black High Leggings",
    price: "৳ 990.00",
    sizeLabel: "Default",
    image: "/new2.webp",
  },
  {
    id: 203,
    title: "Clean White Trouser",
    price: "৳ 799.00",
    sizeLabel: "Default",
    image: "/new3.webp",
  },
  {
    id: 204,
    title: "Cocoa Brown Trouser",
    price: "৳ 799.00",
    sizeLabel: "Default",
    image: "/new4.webp",
  },
];

const justArrivedProducts = [
  {
    id: 101,
    title: "Black Blazer Dress",
    price: "৳ 1,690.00",
    sizeLabel: "Default",
    sizes: 5,
    image: "/new1.webp",
  },
  {
    id: 102,
    title: "Black High Leggings",
    price: "৳ 990.00",
    sizeLabel: "Default",
    sizes: 4,
    image: "/new2.webp",
  },
  {
    id: 103,
    title: "Clean White Trouser",
    price: "৳ 799.00",
    sizeLabel: "Default",
    sizes: 5,
    image: "/new3.webp",
  },
  {
    id: 104,
    title: "Cocoa Brown Trouser",
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
    count: "10",
    price: "৳ 1,290.00",
    sizeLabel: "Default",
    image: "/new4.webp",
  },
  {
    id: 302,
    title: "Accessories",
    count: "12",
    price: "৳ 890.00",
    sizeLabel: "Default",
    image: "/pexels-ekrulila-26316180_1.jpg",
  },
  {
    id: 303,
    title: "Bottoms",
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

  return (
    <Layout>
      {/* Hero Section */}
      <section className="w-full bg-[#f6f6f6] pt-0 pb-0">
        <div className="w-full px-0">
          <div
            ref={heroRef}
            className="relative min-h-[640px] w-full overflow-hidden bg-black md:min-h-[760px]"
          >
            <Link href="/product/stepprs-massage-insoles" className="absolute inset-0 block">
              <img
                src="/hero1.webp"
                alt="Latest Fashion Drop"
                className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-105"
              />
            </Link>

            <motion.div
              variants={reveal}
              initial="hidden"
              animate={heroInView ? "visible" : "hidden"}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const, staggerChildren: 0.08, delayChildren: 0.1 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pb-10 text-center text-white md:items-center md:justify-center md:text-center md:px-16 md:pb-0"
            >
              <motion.p
                variants={reveal}
                className="mb-6 text-xs font-medium uppercase tracking-[0.36em] md:mb-7 md:text-base md:tracking-[0.36em]"
              >
                SS26 STATEMENT PIECES
              </motion.p>
              <motion.h1
                variants={reveal}
                className="max-w-[760px] text-[clamp(2.6rem,11vw,4rem)] font-bold leading-[0.9] tracking-[-0.06em] md:text-[clamp(4rem,5vw,7rem)] md:leading-[0.88] md:tracking-[-0.08em]"
              >
                Bold by<br />
                <TypingEffect
                  texts={['design']}
                  className="font-display italic tracking-[0.55em] text-[1.15em] ml-1"
                />
              </motion.h1>
              <motion.div variants={reveal}>
                <Link
                  href="/product/stepprs-massage-insoles"
                  className="mt-6 inline-flex w-fit items-center justify-center rounded-[4px] border-2 border-white px-5 py-2.5 text-xs font-medium uppercase tracking-[0.28em] text-white transition-colors hover:bg-white hover:text-black md:mt-10 md:px-7 md:py-3 md:text-base"
                >
                  DISCOVER MORE
                </Link>
              </motion.div>
            </motion.div>
          </div>
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
                  <Link href="/product/stepprs-massage-insoles" className="block h-full">
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

                <Link href="/product/stepprs-massage-insoles" className="block pb-2 pt-5 text-black md:pt-7">
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
              href="/product/stepprs-massage-insoles"
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
                <Link href="/product/stepprs-massage-insoles" className="block h-full">
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
                    <p className="mt-4 text-xl font-normal tracking-[0.02em] md:text-2xl">{product.price}</p>
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
              href="/product/stepprs-massage-insoles"
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
                    <Link href="/product/stepprs-massage-insoles" className="block h-full">
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

                  <Link href="/product/stepprs-massage-insoles" className="block px-0 pb-2 pt-5 text-black md:pt-7">
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
                  href="/product/stepprs-massage-insoles"
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
                  href="/product/stepprs-massage-insoles"
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
              href="/product/stepprs-massage-insoles"
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
                    <Link href="/product/stepprs-massage-insoles" className="block h-full">
                      <img
                        src={product.image}
                        alt={product.title}
                        loading="lazy"
                        className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      />
                    </Link>
                  </div>
                  <Link href="/product/stepprs-massage-insoles" className="block px-0 pb-2 pt-5 text-center text-black md:pt-7">
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
