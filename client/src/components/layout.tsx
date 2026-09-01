import { Link, useLocation } from "wouter";
import { ArrowUpRight, Globe, Clock, ShieldCheck, ShoppingBag, X } from "lucide-react";
import { Box as ReiconBox, MoneyReceive, TruckFast, ShieldTick, CheckCircle } from "reicon-react";
import { useState, useEffect, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/contexts/cart-context";
import CartDrawer from "@/components/cart-drawer";
import mangoLoverLogo from "@assets/mango-lover-logo.avif";
import { fetchStorefrontProducts, getProductImage, searchStorefrontProducts } from "@/lib/storefront-products";

function BagIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 5000 5000"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="m3712.8 3701.7c0 133.5-111.3 244.8-244.8 244.8h-1958.3c-133.5 0-244.8-111.3-244.8-244.8v-1758c0-111.3 111.3-222.5 244.8-222.5h1980.5c133.5 0 244.8 111.3 244.8 244.8v1735.8l-22.2-0.1zm-1223.9-2648.2c267 0 467.3 200.3 511.8 445.1h-1023.7c44.6-244.8 244.8-445.1 511.9-445.1zm979.1 445.1h-244.8c-44.5-378.3-356.1-667.6-734.4-667.6s-689.9 289.3-734.4 667.6h-244.8c-267 0-467.3 200.3-467.3 467.3v1758c0 244.8 200.3 445.1 467.3 445.1h1980.5c244.8 0 467.3-200.3 467.3-467.3v-1758c-22.1-244.8-222.3-445.1-489.4-445.1z" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 22L20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuLinesIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path fillRule="evenodd" clipRule="evenodd" d="M20.75 7C20.75 7.41421 20.4142 7.75 20 7.75L4 7.75C3.58579 7.75 3.25 7.41421 3.25 7C3.25 6.58579 3.58579 6.25 4 6.25L20 6.25C20.4142 6.25 20.75 6.58579 20.75 7Z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M20.75 12C20.75 12.4142 20.4142 12.75 20 12.75L4 12.75C3.58579 12.75 3.25 12.4142 3.25 12C3.25 11.5858 3.58579 11.25 4 11.25L20 11.25C20.4142 11.25 20.75 11.5858 20.75 12Z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M20.75 17C20.75 17.4142 20.4142 17.75 20 17.75L4 17.75C3.58579 17.75 3.25 17.4142 3.25 17C3.25 16.5858 3.58579 16.25 4 16.25L20 16.25C20.4142 16.25 20.75 16.5858 20.75 17Z" />
    </svg>
  );
}

function HomeDuotoneIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M9.44661 15.3975C9.11385 15.1508 8.64413 15.2206 8.39748 15.5534C8.15082 15.8862 8.22062 16.3559 8.55339 16.6025C9.5258 17.3233 10.715 17.75 12 17.75C13.285 17.75 14.4742 17.3233 15.4466 16.6025C15.7794 16.3559 15.8492 15.8862 15.6025 15.5534C15.3559 15.2208 14.8862 15.1508 14.5534 15.3975C13.825 15.9373 12.9459 16.25 12 16.25C11.0541 16.25 10.175 15.9373 9.44661 15.3975Z" fill="currentColor" opacity="0.55" />
      <path fillRule="evenodd" clipRule="evenodd" d="M12 1.25C11.2919 1.25 10.6485 1.45282 9.95055 1.79224C9.27585 2.12035 8.49642 2.60409 7.52286 3.20832L5.45628 4.4909C4.53509 5.06261 3.79744 5.5204 3.2289 5.95581C2.64015 6.40669 2.18795 6.86589 1.86131 7.46263C1.53535 8.05812 1.38857 8.69174 1.31819 9.4407C1.24999 10.1665 1.24999 11.0541 1.25 12.1672V13.7799C1.24999 15.6837 1.24998 17.1866 1.4027 18.3616C1.55937 19.567 1.88856 20.5401 2.63236 21.3094C3.37958 22.0824 4.33046 22.4277 5.50761 22.5914C6.64849 22.75 8.10556 22.75 9.94185 22.75H14.0581C15.8944 22.75 17.3515 22.75 18.4924 22.5914C19.6695 22.4277 20.6204 22.0824 21.3676 21.3094C22.1114 20.5401 22.4406 19.567 22.5973 18.3616C22.75 17.1866 22.75 15.6838 22.75 13.7799V12.1672C22.75 11.0541 22.75 10.1665 22.6818 9.4407C22.6114 8.69174 22.4646 8.05812 22.1387 7.46263C21.8121 6.86589 21.3599 6.40669 20.7711 5.95581C20.2026 5.5204 19.4649 5.06262 18.5437 4.49091L16.4771 3.20831C15.5036 2.60409 14.7241 2.12034 14.0494 1.79224C13.3515 1.45282 12.7081 1.25 12 1.25ZM8.27953 4.50412C9.29529 3.87371 10.0095 3.43153 10.6065 3.1412C11.1882 2.85833 11.6002 2.75 12 2.75C12.3998 2.75 12.8118 2.85833 13.3935 3.14119C13.9905 3.43153 14.7047 3.87371 15.7205 4.50412L17.7205 5.74537C18.6813 6.34169 19.3559 6.76135 19.8591 7.1467C20.3487 7.52164 20.6303 7.83106 20.8229 8.18285C21.0162 8.53589 21.129 8.94865 21.1884 9.58104C21.2492 10.2286 21.25 11.0458 21.25 12.2039V13.725C21.25 15.6959 21.2485 17.1012 21.1098 18.1683C20.9736 19.2163 20.717 19.8244 20.2892 20.2669C19.8649 20.7058 19.2871 20.9664 18.2858 21.1057C17.2602 21.2483 15.9075 21.25 14 21.25H10C8.09247 21.25 6.73983 21.2483 5.71422 21.1057C4.71286 20.9664 4.13514 20.7058 3.71079 20.2669C3.28301 19.8244 3.02642 19.2163 2.89019 18.1683C2.75149 17.1012 2.75 15.6959 2.75 13.725V12.2039C2.75 11.0458 2.75076 10.2286 2.81161 9.58104C2.87103 8.94865 2.98385 8.53589 3.17709 8.18285C3.36965 7.83106 3.65133 7.52164 4.14092 7.1467C4.6441 6.76135 5.31869 6.34169 6.27953 5.74537L8.27953 4.50412Z" fill="currentColor" />
    </svg>
  );
}

const DHAKA_TIME_ZONE = "Asia/Dhaka";
const SECONDS_PER_DAY = 24 * 60 * 60;

const pad = (value: number) => value.toString().padStart(2, "0");

// Wall-clock time in Bangladesh whatever timezone the visitor is in, so the
// clock and the sale countdown both follow the shop's own day.
function dhakaClock(now: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: DHAKA_TIME_ZONE,
    hourCycle: "h23",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(now);
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  return { hours: value("hour"), minutes: value("minute"), seconds: value("second") };
}

// The sale rolls over at midnight Bangladesh time, so there is no hardcoded end
// date here to go stale. Swap this for a dashboard-driven deadline if the sale
// ever needs a fixed one.
function saleCountdown({ hours, minutes, seconds }: ReturnType<typeof dhakaClock>) {
  const remaining = SECONDS_PER_DAY - (hours * 3600 + minutes * 60 + seconds);
  return `${pad(Math.floor(remaining / 3600))}:${pad(Math.floor((remaining % 3600) / 60))}:${pad(remaining % 60)}`;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [time, setTime] = useState('');
  const [countdown, setCountdown] = useState('');
  const { setIsOpen: setCartOpen, itemCount } = useCart();
  const { data: searchableProducts = [] } = useQuery({
    queryKey: ["merchant-suite-products-listing"],
    queryFn: fetchStorefrontProducts,
    enabled: isSearchOpen,
  });

  const openSearch = () => setIsSearchOpen(true);
  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    setLocation(query ? `/products?search=${encodeURIComponent(query)}` : "/products");
    setIsSearchOpen(false);
  };
  const suggestions = searchStorefrontProducts(searchableProducts, searchQuery).slice(0, 5);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const tick = () => {
      const clock = dhakaClock(new Date());
      setTime(`${pad(clock.hours)}:${pad(clock.minutes)}`);
      setCountdown(saleCountdown(clock));
    };

    tick();
    const intervalId = setInterval(tick, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:bg-brand-ivory text-black selection:bg-brand-gold selection:text-white">
      {/* Announcement Bar */}
      <div className="border-b border-[#163B33]/15 bg-[#FBBB14] px-4 md:px-16">
        <div className="mx-auto flex h-9 max-w-[1440px] items-center justify-center gap-3 text-[#163B33] md:justify-between">
          <div className="hidden items-center gap-2.5 text-[9px] font-bold uppercase tracking-[0.34em] md:flex">
            <span aria-hidden="true" className="text-[13px] leading-none">🥭</span>
              <span>Mango season</span>
            </div>
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="flex min-w-0 items-center gap-2 text-[8px] font-bold uppercase tracking-[0.12em] md:gap-4 md:text-[9px] md:tracking-[0.24em]"
            >
              <span className="whitespace-nowrap">Free delivery over ৳2500</span>
              <span className="h-3 w-px shrink-0 bg-[#163B33]/25" />
              <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap">
                <span className="hidden md:inline">Sale&nbsp;</span>ends in
                <span className="rounded-[3px] bg-[#163B33] px-1.5 py-0.5 tabular-nums tracking-[0.08em] text-[#FBBB14]">
                  {countdown}
                </span>
              </span>
            </motion.div>
            <div className="hidden items-center gap-2 text-[9px] font-bold uppercase tracking-[0.34em] md:flex">
              <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#163B33]/60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#163B33]" />
              </span>
              <span>Dhaka {time}</span>
            </div>
          </div>
        </div>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full bg-white backdrop-blur-xl md:bg-brand-ivory/80 md:backdrop-blur-md transition-all duration-300">
        <div className="flex h-14 items-center justify-between pl-2.5 pr-1.5 md:h-24 md:px-16">
          <div className="flex-1 flex items-center justify-start">
            <div className="hidden md:flex items-center gap-10 text-[10px] uppercase tracking-[0.3em] font-medium opacity-70">
              <Link href="/collection"><a className="hover:text-brand-gold transition-colors">Collection</a></Link>
              <Link href="/atelier"><a className="hover:text-brand-gold transition-colors">Atelier</a></Link>
            </div>
            <div className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Open menu" className="group flex h-9 w-auto items-center justify-center rounded-[8px] px-0 [&_svg]:size-7 md:h-12" onClick={() => setIsOpen(true)}>
                <MenuLinesIcon className="opacity-70 transition-opacity group-hover:opacity-100" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <Link href="/">
              <a className="flex items-center text-black">
                <img
                  src={mangoLoverLogo}
                  alt="Mango Lover"
                  className="h-7 w-auto md:h-11"
                />
              </a>
            </Link>
          </div>

          <div className="flex-1 flex items-center justify-end gap-6 md:gap-10">
            {/* Search + Cart grouped so the search sits directly left of the cart on mobile */}
            <div className="flex items-center gap-1">
            {/* Search Button - Mobile only, left of cart */}
            <Button
              variant="ghost"
              onClick={openSearch}
              aria-label="Search"
              className="group flex h-9 w-auto items-center justify-center rounded-[8px] px-0 hover:bg-transparent [&_svg]:size-5 md:hidden"
            >
              <SearchIcon className="opacity-70 transition-opacity group-hover:opacity-100" />
            </Button>

            {/* Cart Button - Mobile & Desktop */}
            <Button
              variant="ghost"
              onClick={() => setCartOpen(true)}
              className="group relative flex h-9 items-center justify-center rounded-[8px] px-1 hover:bg-transparent [&_svg]:size-7 md:h-12 md:px-3"
            >
              <BagIcon className="opacity-70 transition-opacity group-hover:opacity-100 md:hidden" />
              {/* Icon on mobile, wordmark on desktop — the label stays in the
                  accessibility tree at both sizes. */}
              <span className="sr-only text-[10px] uppercase tracking-[0.3em] font-bold opacity-70 transition-opacity group-hover:opacity-100 md:not-sr-only">
                Cart
              </span>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-gold text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>
            </div>

            <div className="hidden md:flex items-center gap-10 text-[10px] uppercase tracking-[0.3em] font-medium opacity-70">
              <Link href="/journal"><a className="hover:text-brand-gold transition-colors">Journal</a></Link>
              <Link href="/booking"><a className="hover:text-brand-gold transition-colors">Booking</a></Link>

            </div>

            <Button variant="ghost" className="hidden md:flex h-12 px-8 rounded-[8px] border border-black/10 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-black hover:text-white transition-all">
              Private Fitting
            </Button>

          </div>
        </div>
      </nav>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-3 bottom-3 z-[80] flex h-16 items-center justify-around rounded-[8px] border border-white/40 bg-white/20 px-2 text-black shadow-[0_8px_32px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.55),inset_0_-1px_0_rgba(255,255,255,0.18)] backdrop-blur-2xl backdrop-saturate-150 md:hidden"
      >
        <Link href="/">
          <a
            aria-label="Home"
            aria-current={location === "/" ? "page" : undefined}
            className={`flex min-w-[52px] flex-col items-center gap-1 text-[9px] font-medium tracking-[0.04em] transition-colors ${location === "/" ? "text-black" : "text-black/55"}`}
          >
            <HomeDuotoneIcon className="h-5 w-5" />
            <span>Home</span>
          </a>
        </Link>
        <Link href="/products">
          <a
            aria-label="Products"
            aria-current={location === "/products" ? "page" : undefined}
            className={`flex min-w-[52px] flex-col items-center gap-1 text-[9px] font-medium tracking-[0.04em] transition-colors ${location === "/products" ? "text-black" : "text-black/55"}`}
          >
            <ReiconBox size={20} color="currentColor" weight="light" />
            <span>Products</span>
          </a>
        </Link>
        <Button
          variant="ghost"
          aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ""}`}
          onClick={() => setCartOpen(true)}
          className="relative flex h-12 w-16 flex-col items-center justify-center rounded-full bg-[#C8F45A] p-0 text-black shadow-none hover:bg-[#C8F45A]"
        >
          <BagIcon className="!h-8 !w-8" />
          {itemCount > 0 && (
            <span className="absolute right-3 top-2 h-1.5 w-1.5 rounded-full bg-[#163B33]" aria-label={`${itemCount} items in cart`} />
          )}
          <span className="sr-only">Cart</span>
        </Button>
        <button type="button" aria-label="Search products" onClick={openSearch} className="flex min-w-[52px] flex-col items-center gap-1 text-[9px] font-medium tracking-[0.04em] text-black/55 transition-colors hover:text-black">
            <SearchIcon className="h-5 w-5" />
            <span>Search</span>
        </button>
        <Button
          variant="ghost"
          aria-label="Open menu"
          onClick={() => setIsOpen(true)}
          className="flex min-w-[52px] flex-col items-center gap-1 rounded-none p-0 text-[9px] font-medium tracking-[0.04em] text-black/55 shadow-none transition-colors hover:bg-transparent hover:text-black"
        >
          <MenuLinesIcon className="!h-5 !w-5 scale-125 opacity-70" />
          <span>Menu</span>
        </Button>
      </nav>

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSearchOpen(false)}
            className="fixed inset-0 z-[100] flex items-start justify-center bg-black/15 px-4 pt-[12vh] backdrop-blur-md md:pt-[16vh]"
          >
            <motion.div
            initial={{ opacity: 0, y: -28, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 360, damping: 28, mass: 0.7 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/60 bg-white/55 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.2)] backdrop-blur-2xl backdrop-saturate-150"
            >
              <form onSubmit={submitSearch} className="flex items-center gap-3 rounded-xl border border-black/10 bg-white/45 px-4 py-3">
                <SearchIcon className="h-5 w-5 shrink-0 text-black/60" />
                <input autoFocus value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search products" aria-label="Search products" className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-black/40" />
                <button type="button" onClick={() => setIsSearchOpen(false)} aria-label="Close search" className="rounded-full p-1 text-black/50 transition-colors hover:bg-black/5 hover:text-black">
                  <X size={19} strokeWidth={1.5} />
                </button>
              </form>
              <div className="px-2 pb-2 pt-5">
                <p className="mb-3 text-[9px] font-medium uppercase tracking-[0.3em] text-black/45">
                  {searchQuery ? "Suggestions" : "Popular searches"}
                </p>
                <div className="space-y-1">
                  {suggestions.length > 0 ? suggestions.map((product) => (
                    <button
                      key={product.slug}
                      type="button"
                      onClick={() => {
                        setSearchQuery(product.name);
                        setLocation(`/products?search=${encodeURIComponent(product.name)}`);
                        setIsSearchOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-black/75 transition-colors hover:bg-white/60 hover:text-black"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-black/5">
                          {getProductImage(product) ? (
                            <img src={getProductImage(product)} alt="" className="h-full w-full object-cover" />
                          ) : null}
                        </span>
                        <span className="truncate">{product.name}</span>
                      </span>
                      <ArrowUpRight size={15} strokeWidth={1.5} className="ml-3 shrink-0 text-black/35" />
                    </button>
                  )) : (
                    <p className="px-3 py-2 text-sm text-black/45">No matching products.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence initial={true}>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[100] w-full h-[100dvh] supports-[height:100dvh]:h-dvh p-3 sm:p-4 pointer-events-none md:hidden"
          >
            <motion.div
              className="absolute inset-0 bg-black/10 pointer-events-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.3 } }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1, transition: { duration: 0.58, ease: [0.22, 1, 0.36, 1] } }}
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } }}
              className="relative w-full h-full flex flex-col pointer-events-auto text-white rounded-[12px] bg-neutral-500/60 backdrop-blur-md shadow-2xl overflow-hidden"
            >
              <div className="flex flex-col h-full px-6 py-6 md:px-12 md:py-10 justify-between overflow-y-auto">
                {/* Header */}
                <div className="flex justify-end items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full hover:bg-white/10 text-white transition-all h-10 w-10"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Navigation Links */}
                <div className="flex flex-col gap-6 md:gap-8 py-8 flex-1 justify-center px-2">
                  {[
                    { label: "Home", href: "/" },
                    { label: "Best Sellers", href: "/best-sellers" },
                    { label: "New Arrival", href: "/new-arrival" },
                    { label: "Contact Us", href: "/contact-us" }
                  ].map((item, idx) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: idx * 0.1 + 0.2, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Link href={item.href} onClick={() => setIsOpen(false)}>
                        <a className="group flex items-baseline">
                          <span className="text-3xl font-sans font-medium tracking-tight text-white transition-opacity duration-300 hover:opacity-70">
                            {item.label}
                          </span>
                        </a>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Footer Info */}
                <div className="space-y-6 mt-12 pb-4">
                  <div className="h-px w-full bg-white/10" />
                  <div className="flex justify-between items-center text-white/80 text-sm font-medium">
                    <span className="flex items-center gap-3">
                      Shipping to:
                      <span className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-md text-xs">
                        <span>BD</span> Bangladesh
                      </span>
                    </span>
                  </div>
                  <div className="text-white/60 text-sm">
                    © 2026 Stepprs. All rights reserved.
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Main Content with Transition */}
      <main className="flex-grow overflow-hidden bg-brand-ivory pb-20 md:pb-0">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Luxury Swiss Grid Footer */}
      <footer className="relative border-t border-black/10 text-black/70 pt-12 md:pt-24 overflow-hidden">
        {/* Background image — desktop */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 md:opacity-40 hidden md:block"
          style={{ backgroundImage: "url('/footer-bg.webp')" }}
        />
        {/* Background image — mobile */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-35 md:opacity-40 md:hidden"
          style={{ backgroundImage: "url('/footer-bg-mobile-v2.webp')" }}
        />
        {/* Foggy gradient on left for mobile */}
        <div
          className="absolute inset-0 md:hidden"
          style={{ background: "linear-gradient(to right, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 25%, rgba(255,255,255,0.2) 50%, transparent 70%)" }}
        />
        {/* Foggy gradient on bottom for mobile */}
        <div
          className="absolute inset-0 md:hidden"
          style={{ background: "linear-gradient(to top, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 15%, transparent 40%)" }}
        />
        {/* White overlay for text readability */}
        <div className="absolute inset-0 bg-white/60" />

        {/* Main Grid Content */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 max-w-[1440px] mx-auto px-4 sm:px-8 md:px-16 gap-16 mb-8 md:mb-24">
          {/* Brand Col */}
          <div className="md:col-span-4 space-y-8">
            <img
              src={mangoLoverLogo}
              alt="Mango Lover"
              className="h-9 w-auto md:hidden"
            />
            <p className="text-[13px] font-bold leading-[2] text-black/60 md:max-w-md">
              সাধ্যের মধ্যে সেরা মানের পন্য আপনার ও আপনার পরিবারের জন্য, যা আমরা পাঠাই একদম মাঠ পর্যায় থেকে, তাই পাচ্ছেন সাশ্রয়ী দামে সেরা মানের পন্যের নিশ্চয়তা।
            </p>
            <div className="flex gap-6 items-center">
              <a href="https://www.facebook.com/WeAreMangoLover" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:opacity-80 transition-opacity">
                <img src="https://cdn.reicon.dev/logos/facebook/original.svg" alt="Facebook" width={20} height={20} className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/wearemangolover" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:opacity-80 transition-opacity">
                <img src="https://cdn.reicon.dev/logos/instagram/original.svg" alt="Instagram" width={20} height={20} className="w-5 h-5" />
              </a>
              <a href="https://www.youtube.com/@mango.lover.11" target="_blank" rel="noopener noreferrer" aria-label="Youtube" className="hover:opacity-80 transition-opacity">
                <img src="https://cdn.reicon.dev/logos/youtube/original.svg" alt="Youtube" width={24} height={24} className="w-6 h-6" />
              </a>
            </div>
            <div className="space-y-6 pt-2">
              <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-[#FBBB14] block [-webkit-text-stroke:1px_rgba(0,0,0,0.06)]">Newsletter</span>
              <div className="flex border-b border-black/10 pb-4">
                <input
                  type="email"
                  placeholder="JOIN THE ATELIER"
                  className="bg-transparent border-none outline-none flex-grow text-[9px] uppercase tracking-[0.4em] font-medium placeholder:text-black/20"
                />
                <button className="text-[9px] uppercase tracking-[0.4em] font-bold hover:text-brand-gold transition-colors">Join</button>
              </div>
            </div>
          </div>

          {/* Link Columns */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-x-8 gap-y-8">
            <div className="space-y-8">
              <span className="text-[28px] md:text-[22px] font-bold text-[#FBBB14] block" style={{ fontFamily: "'IhtishamDeshlipi', serif" }}>তথ্য</span>
              <ul className="space-y-3 text-[15px] md:text-[15px] font-bold text-black">
                {["আমাদের সম্পর্কে", "যোগাযোগ", "কোম্পানির তথ্য", "ম্যাংগো লাভারের গল্প", "শর্তাবলী", "গোপনীয়তা নীতি", "ক্যারিয়ার", "রিফান্ড ও এক্সচেঞ্জ"].map((label) => (
                  <li key={label}><a href="#" className="hover:text-black transition-colors block">{label}</a></li>
                ))}
              </ul>
            </div>

            <div className="space-y-8">
              <span className="text-[28px] md:text-[22px] font-bold text-[#FBBB14] block" style={{ fontFamily: "'IhtishamDeshlipi', serif" }}>কেনুন</span>
              <ul className="space-y-3 text-[17px] md:text-[15px] font-bold text-black">
                {["তেল ও ঘি", "মধু", "খেজুর", "মসলা", "বাদাম ও বীজ", "পানীয়", "ঘরোয়া খাবার"].map((label) => (
                  <li key={label}><a href="#" className="hover:text-black transition-colors block">{label}</a></li>
                ))}
              </ul>
            </div>

            <div className="space-y-8">
              <span className="text-[28px] md:text-[22px] font-bold text-[#FBBB14] block" style={{ fontFamily: "'IhtishamDeshlipi', serif" }}>সহায়তা</span>
              <ul className="space-y-3 text-[17px] md:text-[15px] font-bold text-black">
                {["সহায়তা কেন্দ্র", "কিভাবে অর্ডার করবেন", "অর্ডার ট্র্যাকিং", "পেমেন্ট ও শিপিং", "সচরাচর জিজ্ঞাসা", "ভোক্তা নীতি"].map((label) => (
                  <li key={label}><a href="#" className="hover:text-black transition-colors block">{label}</a></li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* Decorative Divider + Brand Name + Trust Badges */}
        <div className="relative z-10 px-4 md:px-16 pt-10 pb-6 md:pt-12 md:pb-8">
          {/* Gold Divider */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16 bg-[#FBBB14]/40" />
            <div className="w-2 h-2 rotate-45 bg-[#FBBB14]/50" />
            <div className="h-px w-16 bg-[#FBBB14]/40" />
          </div>
          {/* Bengali Brand Name */}
          <p
            className="text-center text-[54px] md:text-[58px] font-bold text-[#FBBB14] mb-8 tracking-wide"
            style={{ fontFamily: "'IhtishamDeshlipi', serif" }}
          >
            ম্যাংগো লাভার
          </p>
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {[
              { icon: MoneyReceive, label: "ক্যাশ অন ডেলিভারি" },
              { icon: TruckFast, label: "দ্রুত ডেলিভারি" },
              { icon: ShieldTick, label: "নিরাপদ পেমেন্ট" },
              { icon: CheckCircle, label: "মান নিশ্চিত" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <Icon size={22} color="#FBBB14" weight="light" />
                <span
                  className="text-[11px] md:text-[12px] text-black/50 font-medium"
                  style={{ fontFamily: "'KaiumSimanto', serif" }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="relative z-10 bg-transparent border-t border-black/10 px-4 sm:px-8 md:px-16 py-8">
          <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-3 md:gap-6">
            <div className="text-center md:text-left">
              <a
                href="https://api.whatsapp.com/send/?phone=8801733670129"
                className="group inline-flex items-center gap-2 text-black transition-colors hover:text-[#163B33]"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#FBBB14] transition-transform duration-300 group-hover:scale-125" />
                <span className="text-[7px] font-medium uppercase tracking-[0.28em] text-black/40">
                  Designed &amp; Developed by
                </span>
                <span
                  className="max-md:-translate-y-0.5 text-[14px] font-bold tracking-[0.12em] underline decoration-[#FBBB14] decoration-2 underline-offset-4 md:text-[13px]"
                  style={{ fontFamily: "'Garet', 'Space Grotesk', 'Inter', sans-serif" }}
                >
                  Arc Labs Corporation
                </span>
              </a>
              <span className="mt-2 block text-[8px] tracking-normal text-black/40">
                © 2026 ম্যাংগো লাভার - Mango Lover
              </span>
            </div>
            <div className="flex gap-8 text-[9px] uppercase tracking-[0.4em] text-black/40">
              <div className="flex items-center gap-2"><Globe className="w-3 h-3" /> Dhaka, Bangladesh</div>
              <div className="hidden md:flex items-center gap-2 font-modern">{time} BST</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
