import { Link, useLocation } from "wouter";
import { ArrowUpRight, Instagram, Twitter, Mail, Menu, Globe, Clock, ShieldCheck, ShoppingBag, X } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/contexts/cart-context";
import CartDrawer from "@/components/cart-drawer";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const [time, setTime] = useState('');
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
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-brand-ivory text-black selection:bg-brand-gold selection:text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-black/5 bg-brand-ivory/80 backdrop-blur-md transition-all duration-300">
        <div className="bg-black border-b border-white/10 px-4 md:px-16">
          <div className="mx-auto flex h-9 max-w-[1440px] items-center justify-center md:justify-between">
            <div className="hidden md:flex items-center gap-4 text-[9px] uppercase tracking-[0.45em] font-bold text-white/45">
              <span className="normal-case">Stepprs Dispatch</span>
              <span className="h-px w-10 bg-white/15" />
              <span>SS26</span>
            </div>
            <div className="relative flex h-full min-w-0 flex-1 items-center justify-center overflow-hidden md:flex-none md:min-w-[480px]">
              <motion.p
                initial={{ opacity: 0, y: "-20%" }}
                animate={{ opacity: 1, y: "-50%" }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-x-0 top-1/2 text-center text-[8px] uppercase tracking-[0.18em] md:text-[9px] md:tracking-[0.5em] font-medium text-white/65"
              >
                Free delivery over ৳2500
              </motion.p>
            </div>
            <div className="hidden md:flex items-center gap-4 text-[9px] uppercase tracking-[0.45em] font-bold text-white/45">
              <span>Dhaka</span>
              <span className="h-px w-10 bg-white/15" />
              <span>{time} BST</span>
            </div>
          </div>
        </div>
        <div className="flex h-14 items-center justify-between px-4 md:h-24 md:px-16">
          <div className="flex-1 flex items-center justify-start">
            <div className="hidden md:flex items-center gap-10 text-[10px] uppercase tracking-[0.3em] font-medium opacity-70">
              <Link href="/collection"><a className="hover:text-brand-gold transition-colors">Collection</a></Link>
              <Link href="/atelier"><a className="hover:text-brand-gold transition-colors">Atelier</a></Link>
            </div>
            <div className="md:hidden">
              <Button variant="ghost" size="icon" className="group flex h-9 w-auto items-center justify-center rounded-[8px] px-0 md:h-12" onClick={() => setIsOpen(true)}>
                <span className="text-[9px] uppercase tracking-[0.24em] font-bold opacity-70 transition-opacity group-hover:opacity-100">Menu</span>
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <Link href="/">
              <a className="flex flex-col items-center text-black">
                <span className="font-display italic text-xl font-medium normal-case tracking-[0.06em] text-black md:text-3xl md:tracking-[0.08em]">
                  House of Dhaka
                </span>
                <span className="mt-0.5 text-[7px] uppercase tracking-[0.35em] font-bold text-black/45 md:mt-1 md:text-[8px] md:tracking-[0.45em]">
                  Bangladesh
                </span>
              </a>
            </Link>
          </div>

          <div className="flex-1 flex items-center justify-end gap-6 md:gap-10">
            {/* Cart Button - Mobile & Desktop */}
            <Button
              variant="ghost"
              onClick={() => setCartOpen(true)}
              className="group relative flex h-9 items-center justify-center rounded-[8px] px-2 hover:bg-transparent md:h-12 md:px-3"
            >
              <span className="text-[9px] uppercase tracking-[0.24em] font-bold opacity-70 transition-opacity group-hover:opacity-100 md:text-[10px] md:tracking-[0.3em]">
                Cart
              </span>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-gold text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>

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
      <footer className="border-t border-black/10 bg-white text-black/70 pt-12 md:pt-24">
        {/* Main Grid Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 max-w-[1440px] mx-auto px-4 sm:px-8 md:px-16 gap-16 mb-8 md:mb-24">
          {/* Brand Col */}
          <div className="md:col-span-4 space-y-8">
            <p className="text-[10px] uppercase tracking-[0.2em] md:tracking-[0.4em] font-medium leading-[1.8] md:leading-[2.4] text-black/50 md:max-w-md md:text-balance leading-relaxed">
              Defining the future of luxury couture through Swiss modernist principles and master craftsmanship.
            </p>
            <div className="flex gap-6">
              <Instagram className="w-4 h-4 stroke-[1px] hover:text-brand-gold cursor-pointer transition-colors" />
              <Twitter className="w-4 h-4 stroke-[1px] hover:text-brand-gold cursor-pointer transition-colors" />
              <Mail className="w-4 h-4 stroke-[1px] hover:text-brand-gold cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Navigation Column */}
          <div className="md:col-span-2 space-y-6">
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-brand-gold block">Information</span>
            <ul className="space-y-4 text-[10px] uppercase tracking-widest font-medium text-black/60">
              <li><a href="#" className="hover:text-black transition-colors block">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-black transition-colors block">Terms and Conditions</a></li>
              <li><a href="#" className="hover:text-black transition-colors block">Exchange and Return Policy</a></li>
            </ul>
          </div>



          {/* Newsletter Column */}
          <div className="md:col-span-4 space-y-6">
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-brand-gold block">Newsletter</span>
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

        {/* Massive Logo Section */}
          <div className="border-t border-black/10 px-3 pt-10 pb-5 md:px-0 md:pt-12 md:pb-2 overflow-hidden relative group cursor-default">
            <h2 className="text-[18vw] md:text-[25vw] font-sans font-extrabold normal-case tracking-tighter leading-none md:leading-[0.7] text-center text-black/20 select-none transition-all duration-1000 md:group-hover:text-brand-gold/40 md:group-hover:tracking-normal">
            House of Dhaka
          </h2>
        </div>

        {/* Bottom Bar */}
        <div className="bg-transparent border-t border-black/10 px-4 sm:px-8 md:px-16 py-8">
          <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-[9px] uppercase tracking-[0.4em] text-black/40 text-center md:text-left">
              Website by <a href="https://api.whatsapp.com/send/?phone=8801733670129" className="text-black font-bold">Arc Technology Corporation</a> / © 2026 House of Dhaka
            </div>
            <div className="flex gap-8 text-[9px] uppercase tracking-[0.4em] text-black/40">
              <div className="flex items-center gap-2"><Globe className="w-3 h-3" /> Dhaka</div>
              <div className="hidden md:flex items-center gap-2 font-modern">{time} BST</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
