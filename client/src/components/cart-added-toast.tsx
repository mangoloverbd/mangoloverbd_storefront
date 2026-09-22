import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCart } from "@/contexts/cart-context";

// Must match the cart-toast-progress keyframe duration in index.css.
const NOTICE_DURATION_MS = 3500;

export default function CartAddedToast() {
  const { notice, dismissNotice, setIsOpen, signalCartPulse } = useCart();
  const [location] = useLocation();
  const reduceMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const prevKey = useRef<number | null>(null);
  const prevLocation = useRef(location);
  const remaining = useRef(NOTICE_DURATION_MS);
  const startedAt = useRef(0);

  // A new notice restarts the lifecycle; a route change clears a stale one.
  // Effects are intentionally dependency-free and guarded by refs: the
  // context callbacks are recreated every render, so listing them as deps
  // would re-fire the timer on each render.
  useEffect(() => {
    if (notice && prevKey.current !== notice.key) {
      prevKey.current = notice.key;
      remaining.current = NOTICE_DURATION_MS;
      setPaused(false);
    }
    if (prevLocation.current !== location) {
      prevLocation.current = location;
      dismissNotice();
    }
  });

  // Pause-aware dismissal: hovering or focusing the toast freezes both the
  // timer and the CSS progress bar (via animationPlayState below).
  useEffect(() => {
    if (!notice || paused) return;
    startedAt.current = Date.now();
    const id = window.setTimeout(() => {
      remaining.current = NOTICE_DURATION_MS;
      // Only the automatic timeout hands off to the dock. Manual dismissal
      // (View cart, route change, replaced notice) never pulses.
      if (window.innerWidth < 768) signalCartPulse();
      dismissNotice();
    }, remaining.current);
    return () => {
      remaining.current -= Date.now() - startedAt.current;
      window.clearTimeout(id);
    };
  });

  const viewCart = () => {
    dismissNotice();
    setIsOpen(true);
  };

  return (
    <AnimatePresence>
      {notice && (
        <motion.div
          key={notice.key}
          role="status"
          aria-live="polite"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 64, scale: 0.75 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          className="fixed z-[90] left-3 right-3 bottom-[calc(env(safe-area-inset-bottom)+96px)] md:left-auto md:right-6 md:bottom-6 md:w-[380px]"
        >
          <div className="relative flex items-center gap-3 overflow-hidden rounded-full bg-[#163B33] py-2 pl-2 pr-2 text-white shadow-2xl">
            {notice.image ? (
              <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
                <img src={notice.image} alt="" className="h-full w-full object-cover" />
                <span className="absolute bottom-0 right-0 grid h-4 w-4 place-items-center rounded-full bg-[#FBBB14] text-[9px] font-black text-[#163B33]">
                  ✓
                </span>
              </span>
            ) : null}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11px] font-bold">Added to cart</span>
              <span className="block truncate text-[10px] text-white/65">
                {notice.title} · {notice.size}
              </span>
            </span>
            <button
              type="button"
              onClick={viewCart}
              aria-label={`View cart, ${notice.quantityAdded} added`}
              className="min-h-11 shrink-0 rounded-full bg-[#FBBB14] px-4 text-[9px] font-bold uppercase tracking-[0.12em] text-black transition-colors hover:bg-white"
            >
              View cart
            </button>
            {!reduceMotion && (
              <span
                key={notice.key}
                aria-hidden="true"
                className="cart-toast-progress pointer-events-none absolute bottom-1 left-6 right-6 h-[2px] rounded-full bg-[#FBBB14]/80"
                style={{ animationPlayState: paused ? "paused" : "running" }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
