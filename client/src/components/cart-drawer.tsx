import { useCart } from "@/contexts/cart-context";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, X, ShoppingBag, ArrowDownRight } from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useMemo, useState, useEffect } from "react";
import OrderDialog, { type OrderDialogBundle } from "@/components/order-dialog";

const cartEase = [0.22, 1, 0.36, 1] as const;

const cartPanelVariants: Variants = {
    closed: { opacity: 0 },
    open: {
        opacity: 1,
        transition: {
            duration: 0.58,
            ease: cartEase,
            staggerChildren: 0.07,
            delayChildren: 0.08,
        },
    },
};

const cartSectionVariants: Variants = {
    closed: { opacity: 0, y: 16 },
    open: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: cartEase },
    },
};

function CartInnerContent({ items, isOpen, setIsOpen, removeFromCart, updateQuantity, itemCount, subtotal, openCheckout }: any) {
    return (
        <div className="w-full h-full flex flex-col relative overflow-hidden">
            <motion.div
                variants={cartPanelVariants}
                initial="closed"
                animate={isOpen ? "open" : "closed"}
                className="flex flex-col h-full relative z-10"
            >
                {/* Header */}
                <motion.div variants={cartSectionVariants} className="border-b border-black/5 max-md:border-white/10 p-5 md:p-8">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-black max-md:text-white block">
                                Your Cart
                            </span>
                            <span className="text-[9px] uppercase tracking-[0.3em] font-medium text-black max-md:text-white">
                                {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(false)}
                            className="rounded-[8px] hover:bg-black hover:text-white max-md:hover:bg-white/10 max-md:text-white transition-all border-none md:border-solid md:border md:border-black/5 h-10 w-10"
                        >
                            <X className="w-4 h-4 max-md:w-5 max-md:h-5" />
                        </Button>
                    </div>
                </motion.div>

                {/* Cart Items */}
                <motion.div variants={cartSectionVariants} className="min-h-0 flex-grow overflow-y-auto">
                    <AnimatePresence mode="popLayout">
                        {items.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -18, scale: 0.98 }}
                                transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
                                className="flex flex-col items-center justify-center h-full p-12 text-center space-y-7"
                            >
                                <div className="space-y-3">
                                    <h3 className="text-sm font-sans font-medium uppercase tracking-[0.2em] text-black max-md:text-white">
                                        Your cart is empty
                                    </h3>
                                    <p className="mx-auto max-w-[220px] text-[10px] uppercase tracking-[0.28em] leading-6 font-medium text-black/35 max-md:text-white/50">
                                        Discover our curated collection
                                    </p>
                                </div>
                                <Button
                                    onClick={() => setIsOpen(false)}
                                    className="h-auto rounded-[8px] border-b border-black max-md:border-white bg-transparent px-0 py-2 text-[10px] uppercase font-bold tracking-[0.35em] text-black max-md:text-white shadow-none hover:bg-transparent hover:border-brand-gold hover:text-brand-gold"
                                >
                                    Continue Shopping
                                </Button>
                            </motion.div>
                        ) : (
                            <div className="divide-y divide-black/5 max-md:divide-white/10">
                                {items.map((item: any, index: number) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={isOpen ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.98 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        transition={{
                                            duration: 0.52,
                                            delay: index * 0.055,
                                            ease: [0.22, 1, 0.36, 1]
                                        }}
                                        className="p-4 md:p-7 hover:bg-black/[0.01] max-md:hover:bg-white/5 transition-colors group"
                                    >
                                        <div className="flex gap-4 md:gap-6">
                                            {/* Product Image */}
                                            <div className="relative w-20 h-28 md:w-28 md:h-36 bg-neutral-100 max-md:bg-black/20 overflow-hidden flex-shrink-0 rounded-[8px] md:rounded-none">
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover transition-all duration-700"
                                                />
                                                <div className="absolute inset-0 border border-black/5 max-md:border-white/10 rounded-[8px] md:rounded-none" />
                                            </div>

                                            {/* Product Details */}
                                            <div className="flex-grow space-y-3 md:space-y-4">
                                                <div className="space-y-1.5 md:space-y-2">
                                                    <h3 className="text-base md:text-lg font-sans font-medium uppercase tracking-wide text-black max-md:text-white">
                                                        {item.title}
                                                    </h3>
                                                    <div className="flex items-center gap-4 text-[9px] uppercase tracking-[0.3em] font-medium text-black/40 max-md:text-white/50">
                                                        <span>Size: {item.size}</span>
                                                    </div>
                                                    <span className="text-sm font-sans font-medium text-black max-md:text-white">
                                                        {item.price}
                                                    </span>
                                                </div>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center border border-black/10 max-md:border-white/20 rounded-[8px] overflow-hidden">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="h-9 w-9 md:h-10 md:w-10 flex items-center justify-center hover:bg-black hover:text-white max-md:text-white max-md:hover:bg-white/10 transition-all"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="h-9 w-10 md:h-10 md:w-12 flex items-center justify-center text-[10px] font-bold border-x border-black/10 max-md:border-white/20 max-md:text-white">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="h-9 w-9 md:h-10 md:w-10 flex items-center justify-center hover:bg-black hover:text-white max-md:text-white max-md:hover:bg-white/10 transition-all"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>

                                                    {/* Remove Button */}
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold text-black max-md:text-white hover:text-red-600 max-md:hover:text-red-400 transition-colors"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Footer - Subtotal & Checkout */}
                {items.length > 0 && (
                    <motion.div
                        variants={cartSectionVariants}
                        className="shrink-0 border-t border-black/5 max-md:border-white/10 bg-white max-md:bg-transparent p-4 space-y-3 md:p-8 md:space-y-5"
                    >
                        {/* Subtotal */}
                        <div className="space-y-2 md:space-y-3">
                            <div className="flex justify-between items-baseline pb-2 md:pb-3 border-b border-black/5 max-md:border-white/10">
                                <span className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] font-bold text-black/40 max-md:text-white/50">
                                    Subtotal
                                </span>
                                {subtotal > 0 ? (
                                    <span className="font-garet text-xl font-bold text-black max-md:text-white md:text-2xl">
                                        BDT {subtotal.toLocaleString()}
                                    </span>
                                ) : (
                                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-gold">
                                        Select Items
                                    </span>
                                )}
                            </div>
                            <p className="text-[8px] md:text-[9px] uppercase tracking-[0.22em] md:tracking-[0.3em] font-medium text-black/30 max-md:text-white/40 text-center">
                                Shipping and taxes calculated at checkout
                            </p>
                        </div>

                        {/* Checkout Button */}
                        <Button
                            onClick={openCheckout}
                            className="w-full h-12 md:h-14 rounded-[8px] bg-black max-md:bg-white text-white max-md:text-black text-[9px] md:text-[10px] uppercase font-bold tracking-[0.26em] md:tracking-[0.4em] hover:bg-brand-gold max-md:hover:bg-brand-gold max-md:hover:text-white transition-all flex items-center justify-center gap-3 group"
                        >
                            Proceed to Checkout
                            <ArrowDownRight className="w-4 h-4 md:w-5 md:h-5 stroke-[1px] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </Button>

                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-full text-[8px] md:text-[9px] uppercase tracking-[0.28em] md:tracking-[0.4em] font-bold text-black/40 max-md:text-white/50 hover:text-black max-md:hover:text-white transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}

export default function CartDrawer() {
    const { items, isOpen, setIsOpen, removeFromCart, updateQuantity, clearCart, itemCount } = useCart();
    const [orderOpen, setOrderOpen] = useState(false);
    const [checkoutBundle, setCheckoutBundle] = useState<OrderDialogBundle | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    // Use a matchMedia listener to detect mobile vs desktop to prevent the desktop Portal from rendering on mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const cartOrder = useMemo<OrderDialogBundle | null>(() => {
        if (items.length === 0) {
            return null;
        }

        const subtotalAmount = items.reduce((total, item) => {
            const price = parseFloat(item.price.replace(/[^0-9]/g, ''));
            return total + ((Number.isNaN(price) ? 0 : price) * item.quantity);
        }, 0);

        return {
            title: "Cart Checkout",
            details: items.map((item) => `${item.quantity}x ${item.title}`).join(" + "),
            price: subtotalAmount,
            images: items.slice(0, 2).map((item) => ({
                src: item.image,
                alt: item.title
            }))
        };
    }, [items]);

    const openCheckout = () => {
        setCheckoutBundle(cartOrder);
        setIsOpen(false);
        setOrderOpen(true);
    };

    const updateOrderOpen = (nextOpen: boolean) => {
        setOrderOpen(nextOpen);
        if (!nextOpen) {
            setCheckoutBundle(null);
        }
    };

    // Calculate subtotal
    const subtotal = items.reduce((total, item) => {
        const price = parseFloat(item.price.replace(/[^0-9]/g, ''));
        return total + ((Number.isNaN(price) ? 0 : price) * item.quantity);
    }, 0);

    const innerProps = { items, isOpen, setIsOpen, removeFromCart, updateQuantity, clearCart, itemCount, openCheckout, subtotal };

    return (
        <>
            {/* Desktop Drawer - Visible only on md and up */}
            {!isMobile && (
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetContent
                        side="right"
                        className="top-0 bottom-0 w-full h-[100dvh] supports-[height:100dvh]:h-dvh max-h-screen overflow-hidden [&>button]:hidden bg-brand-ivory border-l border-black/5 md:w-[500px] p-0"
                    >
                        <CartInnerContent {...innerProps} />
                    </SheetContent>
                </Sheet>
            )}

            {/* Mobile Modal - Visible only on max-md */}
            {isMobile && (
                <AnimatePresence initial={true}>
                    {isOpen && (
                        <motion.div
                            className="fixed inset-0 z-[100] w-full h-[100dvh] supports-[height:100dvh]:h-dvh p-3 sm:p-4 pointer-events-none"
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
                                <CartInnerContent {...innerProps} />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            <OrderDialog
                open={orderOpen}
                onOpenChange={updateOrderOpen}
                bundle={checkoutBundle}
                onSuccess={clearCart}
            />
        </>
    );
}
