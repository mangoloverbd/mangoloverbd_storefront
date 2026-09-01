import { Link, useLocation } from "wouter";
import { ArrowUpRight, Instagram, Twitter, Mail, Menu, Globe, Clock, ShieldCheck, ShoppingBag, X } from "lucide-react";
import { MoneyReceive, TruckFast, ShieldTick, CheckCircle } from "reicon-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/contexts/cart-context";
import CartDrawer from "@/components/cart-drawer";
import mangoLoverLogo from "@assets/mango-lover-logo.avif";

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
  const [location] = useLocation();
  const [time, setTime] = useState('');
  const [countdown, setCountdown] = useState('');
  const { setIsOpen: setCartOpen, itemCount } = useCart();

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
    <div className="min-h-screen flex flex-col bg-brand-ivory text-black selection:bg-brand-gold selection:text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-black/5 bg-brand-ivory/80 backdrop-blur-md transition-all duration-300">
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
      <main className="flex-grow overflow-hidden">
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
          style={{ backgroundImage: "url('/footer-bg-mobile.webp')" }}
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
            <div className="flex gap-6">
              <Instagram className="w-4 h-4 stroke-[1px] hover:text-brand-gold cursor-pointer transition-colors" />
              <Twitter className="w-4 h-4 stroke-[1px] hover:text-brand-gold cursor-pointer transition-colors" />
              <Mail className="w-4 h-4 stroke-[1px] hover:text-brand-gold cursor-pointer transition-colors" />
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
              <ul className="space-y-3 text-[17px] md:text-[15px] font-bold text-black" style={{ fontFamily: "'ShohidAbuSayed', serif" }}>
                {["আমাদের সম্পর্কে", "যোগাযোগ", "কোম্পানির তথ্য", "ম্যাংগো লাভারের গল্প", "শর্তাবলী", "গোপনীয়তা নীতি", "ক্যারিয়ার", "রিফান্ড ও এক্সচেঞ্জ"].map((label) => (
                  <li key={label}><a href="#" className="hover:text-black transition-colors block">{label}</a></li>
                ))}
              </ul>
            </div>

            <div className="space-y-8">
              <span className="text-[28px] md:text-[22px] font-bold text-[#FBBB14] block" style={{ fontFamily: "'IhtishamDeshlipi', serif" }}>কেনুন</span>
              <ul className="space-y-3 text-[17px] md:text-[15px] font-bold text-black" style={{ fontFamily: "'ShohidAbuSayed', serif" }}>
                {["তেল ও ঘি", "মধু", "খেজুর", "মসলা", "বাদাম ও বীজ", "পানীয়", "ঘরোয়া খাবার"].map((label) => (
                  <li key={label}><a href="#" className="hover:text-black transition-colors block">{label}</a></li>
                ))}
              </ul>
            </div>

            <div className="space-y-8">
              <span className="text-[28px] md:text-[22px] font-bold text-[#FBBB14] block" style={{ fontFamily: "'IhtishamDeshlipi', serif" }}>সহায়তা</span>
              <ul className="space-y-3 text-[17px] md:text-[15px] font-bold text-black" style={{ fontFamily: "'ShohidAbuSayed', serif" }}>
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
                  style={{ fontFamily: "'ShohidAbuSayed', serif" }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="relative z-10 bg-transparent border-t border-black/10 px-4 sm:px-8 md:px-16 py-8">
          <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-[9px] uppercase tracking-[0.4em] text-black/40 text-center md:text-left">
              Website designed and developed by <a href="https://api.whatsapp.com/send/?phone=8801301636461" className="text-black font-bold normal-case">Arc Labs Corporation</a> / <span className="tracking-normal normal-case">© 2026 ম্যাংগো লাভার - Mango Lover</span>
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
