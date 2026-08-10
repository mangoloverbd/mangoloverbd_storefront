import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

const HERO_IMAGES = [
  {
    src: "/hero_mobile_no_makeup.png",
    alt: "",
    fit: "cover",
  },
  {
    src: "/hf_20260311_145847_43310d40-2ddd-4227-9283-2c3fe9830d15.webp",
    alt: "",
    fit: "contain",
  },
  {
    src: "/hf_20260311_151900_cff2b5db-4d48-4ede-b8cf-67eaacfac089.webp",
    alt: "",
    fit: "contain",
  },
  {
    src: "/hf_20260311_155853_1d38cb61-6e7f-4e18-9f98-5b871c571abd.webp",
    alt: "",
    fit: "contain",
  },
];

export default function Hero() {
  const [activeImage, setActiveImage] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: false,
    loop: false,
    skipSnaps: false,
  });

  const goToImage = (idx: number) => {
    emblaApi?.scrollTo(idx);
  };

  const syncActiveImage = useCallback(() => {
    if (!emblaApi) {
      return;
    }

    setActiveImage(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    syncActiveImage();
    emblaApi.on("select", syncActiveImage);
    emblaApi.on("reInit", syncActiveImage);

    return () => {
      emblaApi.off("select", syncActiveImage);
      emblaApi.off("reInit", syncActiveImage);
    };
  }, [emblaApi, syncActiveImage]);

  return (
    <section className="relative w-full bg-brand-ivory px-0 pt-0 pb-12 overflow-hidden md:px-16 md:pt-8 md:pb-16">
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto aspect-square w-full max-w-[min(100%,780px)] overflow-hidden bg-[#f6f6f6] md:max-w-[min(100%,880px)]"
      >
        <div ref={emblaRef} className="h-full overflow-hidden">
          <div className="flex h-full touch-pan-y">
            {HERO_IMAGES.map((image) => (
              <div key={image.src} className="relative h-full min-w-0 flex-[0_0_100%]">
                <img
                  src={image.src}
                  alt={image.alt}
                  aria-hidden="true"
                  loading="eager"
                  draggable={false}
                  className={`absolute inset-0 h-full w-full select-none object-center brightness-95 contrast-105 ${
                    image.fit === "cover" ? "object-cover" : "object-contain"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 border border-black/10 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-black/18 to-transparent pointer-events-none" />

        <div className="absolute inset-x-0 bottom-5 z-20 flex justify-center">
          <div className="flex items-center gap-3 border border-white/20 bg-black/15 px-4 py-3 backdrop-blur-sm rounded-[8px]">
            {HERO_IMAGES.map((image, idx) => (
              <button
                key={image.src}
                type="button"
                onClick={() => goToImage(idx)}
                aria-label={`Show hero image ${idx + 1}`}
                className="group flex h-5 w-5 items-center justify-center"
              >
                <span
                  className={`block h-2 w-2 rounded-full transition-all duration-300 ${
                    activeImage === idx
                      ? "w-6 rounded-full bg-brand-gold"
                      : "bg-white/70 group-hover:bg-white"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

      </motion.div>
    </section>
  );
}
