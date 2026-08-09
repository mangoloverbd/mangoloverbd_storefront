import { Link, useLocation } from "wouter";
import { Instagram, Facebook, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/contexts/cart-context";
import { useStorefront } from "@/contexts/storefront-context";
import CartDrawer from "@/components/cart-drawer";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { setIsOpen: setCartOpen, itemCount } = useCart();
  const { config } = useStorefront();

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

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col text-black selection:bg-[var(--brand-primary)] selection:text-white"
         style={{ backgroundColor: config.backgroundColor }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-black/5 backdrop-blur-md transition-all duration-300"
           style={{ backgroundColor: `${config.backgroundColor}cc` }}>
        {/* Top announcement bar */}
        {config.shippingZones?.some(z => z.free_above) && (
          <div className="bg-black border-b border-white/10 px-4 md:px-16">
            <div className="mx-auto flex h-9 max-w-[1440px] items-center justify-center">
              <motion.p
                initial={{ opacity: 0, y: "-20%" }}
                animate={{ opacity: 1, y: "-50%" }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="text-center text-[8px] uppercase tracking-[0.18em] md:text-[9px] md:tracking-[0.5em] font-medium text-white/65"
              >
                {(() => {
                  const minFree = Math.min(...config.shippingZones.filter(z => z.free_above).map(z => z.free_above!));
                  return `Free delivery on orders over ৳${minFree.toLocaleString()}`;
                })()}
              </motion.p>
            </div>
          </div>
        )}

        <div className="flex h-14 items-center justify-between px-4 md:h-24 md:px-16">
          <div className="flex-1 flex items-center justify-start">
            <div className="md:hidden">
              <Button variant="ghost" size="icon" className="group flex h-9 w-auto items-center justify-center rounded-[8px] px-0 md:h-12" onClick={() => setIsOpen(true)}>
                <span className="text-[9px] uppercase tracking-[0.24em] font-bold opacity-70 transition-opacity group-hover:opacity-100">Menu</span>
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <Link href="/">
              <a className="flex items-center gap-3">
                {config.logoUrl ? (
                  <img src={config.logoUrl} alt={config.storeName} className="h-8 md:h-12 object-contain" />
                ) : (
                  <span className="font-display italic text-xl font-medium normal-case tracking-[0.06em] text-black md:text-3xl md:tracking-[0.08em]">
                    {config.storeName || "Storefront"}
                  </span>
                )}
              </a>
            </Link>
          </div>

          <div className="flex-1 flex items-center justify-end gap-6 md:gap-10">
            <Button
              variant="ghost"
              onClick={() => setCartOpen(true)}
              className="group relative flex h-9 items-center justify-center rounded-[8px] px-2 hover:bg-transparent md:h-12 md:px-3"
            >
              <span className="text-[9px] uppercase tracking-[0.24em] font-bold opacity-70 transition-opacity group-hover:opacity-100 md:text-[10px] md:tracking-[0.3em]">
                Cart
              </span>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: config.primaryColor }}>
                  {itemCount}
                </span>
              )}
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

                <div className="flex flex-col gap-6 md:gap-8 py-8 flex-1 justify-center px-2">
                  {[
                    { label: "Home", href: "/" },
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

                <div className="space-y-6 mt-12 pb-4">
                  <div className="h-px w-full bg-white/10" />
                  <div className="text-white/60 text-sm">
                    © {currentYear} {config.storeName}. All rights reserved.
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

      {/* Footer */}
      <footer className="border-t border-black/10 bg-white text-black/70 pt-12 md:pt-24">
        <div className="grid grid-cols-1 md:grid-cols-12 max-w-[1440px] mx-auto px-4 sm:px-8 md:px-16 gap-16 mb-8 md:mb-24">
          {/* Brand Col */}
          <div className="md:col-span-4 space-y-8">
            {config.tagline && (
              <p className="text-[10px] uppercase tracking-[0.2em] md:tracking-[0.4em] font-medium leading-[1.8] md:leading-[2.4] text-black/50 md:max-w-md md:text-balance leading-relaxed">
                {config.tagline}
              </p>
            )}
            <div className="flex gap-6">
              {config.socialLinks?.instagram && (
                <a href={config.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                  <Instagram className="w-4 h-4 stroke-[1px] cursor-pointer transition-colors hover:opacity-70" />
                </a>
              )}
              {config.socialLinks?.facebook && (
                <a href={config.socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                  <Facebook className="w-4 h-4 stroke-[1px] cursor-pointer transition-colors hover:opacity-70" />
                </a>
              )}
            </div>
          </div>

          {/* Contact Column */}
          {(config.contactPhone || config.contactEmail) && (
            <div className="md:col-span-2 space-y-6">
              <span className="text-[10px] uppercase tracking-[0.5em] font-bold block"
                    style={{ color: config.primaryColor }}>Contact</span>
              <ul className="space-y-4 text-[10px] uppercase tracking-widest font-medium text-black/60">
                {config.contactPhone && (
                  <li><a href={`tel:${config.contactPhone}`} className="hover:text-black transition-colors block">{config.contactPhone}</a></li>
                )}
                {config.contactEmail && (
                  <li><a href={`mailto:${config.contactEmail}`} className="hover:text-black transition-colors block">{config.contactEmail}</a></li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Massive Logo Section */}
        <div className="border-t border-black/10 px-3 pt-10 pb-5 md:px-0 md:pt-12 md:pb-2 overflow-hidden relative group cursor-default">
          <h2 className="text-[18vw] md:text-[25vw] font-sans font-extrabold normal-case tracking-tighter leading-none md:leading-[0.7] text-center text-black/20 select-none transition-all duration-1000">
            {config.storeName}
          </h2>
        </div>

        {/* Bottom Bar */}
        <div className="bg-transparent border-t border-black/10 px-4 sm:px-8 md:px-16 py-8">
          <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-[9px] uppercase tracking-[0.4em] text-black/40 text-center md:text-left">
              © {currentYear} {config.storeName}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
