import { Switch, Route, useLocation } from "wouter";
import { AnimatePresence, motion, useIsPresent } from "framer-motion";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/cart-context";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ProductPage from "@/pages/product";
import ProductsPage from "@/pages/products";
import BookingPage from "@/pages/booking";
import { createEventId, initMetaPixel, trackMetaEvent } from "@/lib/meta";
import { useEffect, useRef, type ReactNode } from "react";

function PageTransition({ children }: { children: ReactNode }) {
  const isPresent = useIsPresent();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={
        isPresent
          ? undefined
          : { position: "fixed", inset: 0, zIndex: 50, background: "#FAFAF8" }
      }
    >
      {children}
    </motion.div>
  );
}

function Router() {
  const [location] = useLocation();
  const scrollPositions = useRef(new Map<string, number>());
  const currentLocation = useRef(location);
  const isHistoryNavigation = useRef(false);
  const isInitialLoad = useRef(true);

  const restoreScrollPosition = (top: number) => {
    const restoreScroll = () => window.scrollTo({ top, left: 0, behavior: "auto" });
    window.requestAnimationFrame(restoreScroll);
    [80, 240, 520, 900, 1300].forEach((delay) => {
      window.setTimeout(restoreScroll, delay);
    });
  };

  useEffect(() => {
    initMetaPixel();
  }, []);

  useEffect(() => {
    trackMetaEvent({ eventName: "PageView", eventId: createEventId(), capi: true });
  }, [location]);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const saveCurrentScroll = () => {
      scrollPositions.current.set(currentLocation.current, window.scrollY);
    };

    const saveBeforeInternalNavigation = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      if (anchor.origin === window.location.origin) {
        saveCurrentScroll();
      }
    };

    const markHistoryNavigation = () => {
      saveCurrentScroll();
      isHistoryNavigation.current = true;
      const targetLocation = `${window.location.pathname}${window.location.search}`;
      const savedY = scrollPositions.current.get(targetLocation);
      if (savedY !== undefined) {
        restoreScrollPosition(savedY);
      }
    };

    window.addEventListener("scroll", saveCurrentScroll, { passive: true });
    document.addEventListener("click", saveBeforeInternalNavigation, true);
    document.addEventListener("touchstart", saveBeforeInternalNavigation, { capture: true, passive: true });
    window.addEventListener("popstate", markHistoryNavigation);
    window.addEventListener("beforeunload", saveCurrentScroll);

    return () => {
      window.removeEventListener("scroll", saveCurrentScroll);
      document.removeEventListener("click", saveBeforeInternalNavigation, true);
      document.removeEventListener("touchstart", saveBeforeInternalNavigation, true);
      window.removeEventListener("popstate", markHistoryNavigation);
      window.removeEventListener("beforeunload", saveCurrentScroll);
    };
  }, []);

  useEffect(() => {
    // On a full page load (refresh), the browser has already restored the
    // scroll position — forcing it to 0 here causes a visible flick to the hero.
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      currentLocation.current = location;
      return;
    }

    const savedY = scrollPositions.current.get(location);
    const targetY = isHistoryNavigation.current && savedY !== undefined ? savedY : 0;
    isHistoryNavigation.current = false;
    currentLocation.current = location;

    const restoreScroll = () => window.scrollTo({ top: targetY, left: 0, behavior: "auto" });
    const timeoutIds = [80, 240, 520, 900].map((delay) =>
      window.setTimeout(restoreScroll, delay),
    );

    return () => {
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [location]);

  return (
    <AnimatePresence>
      <Switch location={location} key={location}>
        <Route path="/">
          <PageTransition>
            <Home />
          </PageTransition>
        </Route>
        <Route path="/products">
          <PageTransition>
            <ProductsPage />
          </PageTransition>
        </Route>
        <Route path="/booking">
          <PageTransition>
            <BookingPage />
          </PageTransition>
        </Route>
        <Route path="/product/:id">
          {(params) => (
            <PageTransition key={params.id}>
              <ProductPage params={params} />
            </PageTransition>
          )}
        </Route>
        <Route>
          <PageTransition>
            <NotFound />
          </PageTransition>
        </Route>
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
