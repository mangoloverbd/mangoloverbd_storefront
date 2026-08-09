import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createEventId, trackMetaEvent } from "@/lib/meta";
import { trackMerchantSuiteEvent } from "@/lib/merchant-suite";
import { useStorefront } from "@/contexts/storefront-context";
import { getBkashNumber } from "@/lib/config";
import { submitOrder, type OrderItem } from "@/lib/storefront-products";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

export type OrderDialogBundle = {
  title: string;
  details: string;
  price: number;
  images: { src: string; alt: string }[];
  items?: OrderItem[];
};

export default function OrderDialog({
  open,
  onOpenChange,
  bundle,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bundle: OrderDialogBundle | null;
  onSuccess?: () => void;
}) {
  const { config, handle } = useStorefront();
  const [openInstance, setOpenInstance] = useState(0);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [orderMessage, setOrderMessage] = useState("");
  const [orderClosing, setOrderClosing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash_on_delivery" | "bkash" | null>(null);
  const [bkashCopied, setBkashCopied] = useState(false);
  const previousOpen = useRef(open);
  const bkashNumber = getBkashNumber();
  const hasBkash = Boolean(bkashNumber);

  // Shipping zones from config
  const shippingZones = config.shippingZones || [];

  // Compute delivery charge for selected zone
  const selectedZone = shippingZones.find(z => z.id === selectedZoneId) || null;
  const subtotal = bundle?.price ?? 0;
  const qualifiesForFreeDelivery = selectedZone?.free_above != null && subtotal >= selectedZone.free_above;
  const deliveryCharge = qualifiesForFreeDelivery ? 0 : (selectedZone?.price ?? null);

  useEffect(() => {
    if (!previousOpen.current && open) {
      setOpenInstance((current) => current + 1);
      trackMerchantSuiteEvent("checkout");

      const eventId = createEventId();
      trackMetaEvent({
        eventName: "InitiateCheckout",
        eventId,
        capi: true,
        customData: {
          currency: "BDT",
          value: bundle?.price ?? 0,
          content_type: "product",
          contents: bundle
            ? [{ id: bundle.title, quantity: 1, item_price: bundle.price }]
            : [],
        },
      });
    }
    previousOpen.current = open;
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (orderSubmitted) {
      trackMerchantSuiteEvent("purchased");
    }
  }, [orderSubmitted]);

  // Auto-select first zone if only one exists
  useEffect(() => {
    if (shippingZones.length === 1 && !selectedZoneId) {
      setSelectedZoneId(shippingZones[0].id);
    }
  }, [shippingZones, selectedZoneId]);

  const resetDialog = (nextOpen: boolean) => {
    if (!nextOpen) {
      setOrderClosing(true);
      onOpenChange(false);
      return;
    }

    setOrderClosing(false);
    onOpenChange(nextOpen);
    setSelectedZoneId(shippingZones.length === 1 ? shippingZones[0].id : null);
    setOrderSubmitted(false);
    setOrderSubmitting(false);
    setOrderError("");
    setOrderRef("");
    setOrderMessage("");
    setPaymentMethod(null);
    setBkashCopied(false);
  };

  const copyBkashNumber = async () => {
    const copyWithSelectionFallback = () => {
      const input = document.createElement("textarea");
      input.value = bkashNumber;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.left = "0";
      input.style.top = "0";
      input.style.width = "1px";
      input.style.height = "1px";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.focus();
      input.select();
      input.setSelectionRange(0, input.value.length);
      const copied = document.execCommand("copy");
      document.body.removeChild(input);
      if (!copied) throw new Error("Copy command failed");
    };

    try {
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(bkashNumber);
        } catch {
          copyWithSelectionFallback();
        }
      } else {
        copyWithSelectionFallback();
      }
      setOrderError("");
      setBkashCopied(true);
      window.setTimeout(() => setBkashCopied(false), 1600);
    } catch {
      setOrderError("Could not copy bKash number. Please copy it manually.");
    }
  };

  const placeOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!bundle) return;

    const formData = new FormData(event.currentTarget);
    const eventId = createEventId();

    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const address = String(formData.get("address") || "").trim();
    const bkashTrxId = String(formData.get("bkashTrxId") || "").trim();

    if (!name) {
      setOrderError("Please enter your full name.");
      return;
    }
    if (!phone) {
      setOrderError("Please enter your phone number.");
      return;
    }
    if (!address) {
      setOrderError("Please enter your delivery address.");
      return;
    }
    if (!selectedZoneId) {
      setOrderError("Please select a delivery zone.");
      return;
    }
    if (paymentMethod === null) {
      setOrderError("Please select a payment method.");
      return;
    }
    if (paymentMethod === "bkash" && !bkashTrxId) {
      setOrderError("Please enter your bKash Reference ID (TRXID).");
      return;
    }

    setOrderSubmitting(true);
    setOrderError("");

    // Build notes from payment info
    const notes = paymentMethod === "bkash"
      ? `Payment: bKash, TRXID: ${bkashTrxId}`
      : "Payment: Cash on Delivery";

    // Build order items
    const items: OrderItem[] = bundle.items?.length
      ? bundle.items
      : [{ variantId: String(bundle.title), quantity: 1 }];

    try {
      const result = await submitOrder({
        customerName: name,
        phone,
        address,
        items,
        shippingZoneId: selectedZoneId,
        notes,
      });

      setOrderRef(result.orderId || "");
      setOrderMessage(result.message || "");
      setOrderSubmitted(true);
      onSuccess?.();

      trackMetaEvent({
        eventName: "Purchase",
        eventId,
        capi: false,
        customData: {
          currency: "BDT",
          value: result.total,
          content_type: "product",
          contents: [{ id: bundle.title, quantity: 1, item_price: bundle.price }],
        },
      });
    } catch (error) {
      setOrderError(
        error instanceof Error
          ? error.message
          : "Could not place your order. Please try again."
      );
    } finally {
      setOrderSubmitting(false);
    }
  };

  return (
    <Dialog open={open || orderClosing} onOpenChange={resetDialog}>
      {(open || orderClosing) && bundle && (
        <DialogContent
          forceMount
          onOpenAutoFocus={(event) => event.preventDefault()}
          className="max-md:fixed max-md:inset-0 max-md:!left-0 max-md:!top-0 max-md:!translate-x-0 max-md:!translate-y-0 max-md:w-full max-md:h-auto max-md:max-h-none overflow-hidden rounded-none border-none !bg-transparent p-3 sm:p-4 shadow-none data-[state=open]:animate-none data-[state=closed]:animate-none md:bottom-auto md:top-[50%] md:h-auto md:max-h-[92dvh] md:translate-y-[-50%] md:max-w-[760px] md:p-0 md:bg-[#f6f6f6] md:shadow-[0_80px_180px_rgba(0,0,0,0.28)] [&>button]:hidden md:[&>button]:flex md:[&>button]:rounded-[8px] flex flex-col z-[100]"
        >
          <AnimatePresence
            initial={true}
            onExitComplete={() => setOrderClosing(false)}
          >
            {open && (
              <motion.div
                key={openInstance}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 0.58, ease: [0.22, 1, 0.36, 1] },
                }}
                exit={{
                  opacity: 0,
                  scale: 0.96,
                  transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
                }}
                className={`relative flex w-full h-full md:h-auto max-md:rounded-[12px] bg-white md:bg-[#f6f6f6] max-md:shadow-2xl overflow-y-auto overflow-x-hidden z-[10] ${
                  orderSubmitted
                    ? "min-h-[calc(100dvh-1.5rem)] flex-col items-center justify-center p-6 md:min-h-[560px] md:p-10"
                    : "flex-col p-6 md:p-10"
                }`}
              >
                <div className="absolute top-4 right-4 z-50 md:hidden">
                  <Button variant="ghost" size="icon" onClick={() => resetDialog(false)} className="rounded-full hover:bg-black/5 text-black border-none h-10 w-10">
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              <DialogHeader className={orderSubmitted ? "sr-only" : "items-center pb-2 text-center"}>
                <DialogTitle className="text-3xl md:text-4xl font-semibold tracking-tight leading-none text-black">
                  Place Order
                </DialogTitle>
              </DialogHeader>

              {orderSubmitted ? (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.09, delayChildren: 0.05 },
                    },
                  }}
                  className="flex w-full flex-1 flex-col items-center justify-center px-2 py-12 text-center font-sans md:py-16"
                >
                  <motion.span
                    variants={{
                      hidden: { opacity: 0, scaleX: 0 },
                      visible: {
                        opacity: 1,
                        scaleX: 1,
                        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                      },
                    }}
                    className="mx-auto mb-7 block h-px w-16 origin-center bg-black/15"
                  />
                  <motion.h3
                    variants={{
                      hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
                      visible: {
                        opacity: 1,
                        y: 0,
                        filter: "blur(0px)",
                        transition: { duration: 0.58, ease: [0.22, 1, 0.36, 1] },
                      },
                    }}
                    className="font-sans text-3xl font-semibold tracking-[-0.04em] text-black md:text-4xl"
                  >
                    Order Confirmed
                  </motion.h3>
                  {orderMessage && (
                    <motion.p
                      variants={{
                        hidden: { opacity: 0, y: 14 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] },
                        },
                      }}
                      className="mx-auto mt-4 max-w-sm text-[15px] font-medium leading-7 tracking-[-0.02em] text-black/55"
                    >
                      {orderMessage}
                    </motion.p>
                  )}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 16, scale: 0.97 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] },
                      },
                    }}
                    className="mt-7 flex flex-col items-center gap-6"
                  >
                    {orderRef && (
                      <div className="inline-flex flex-col items-center gap-1 rounded-[8px] border border-black/10 bg-black/[0.03] px-6 py-3">
                        <span className="text-[11px] font-medium tracking-[-0.01em] text-black/45">
                          Order Number
                        </span>
                        <span className="font-sans text-sm font-semibold tracking-[-0.02em] text-black">
                          {orderRef}
                        </span>
                      </div>
                    )}
                    <Button
                      onClick={() => resetDialog(false)}
                      className="h-auto rounded-[8px] bg-black px-7 py-3 text-[13px] font-semibold tracking-[-0.02em] text-white shadow-none hover:bg-black/80"
                    >
                      Close
                    </Button>
                  </motion.div>
                </motion.div>
              ) : (
                <form onSubmit={placeOrder} className="mt-8 space-y-8" noValidate>
                  {/* Order Summary */}
                  <div className="bg-black/5 rounded-[12px] p-4 flex items-center gap-4">
                    <div className="relative shrink-0 w-16 h-16 md:w-20 md:h-20 bg-[#ebe8e4] rounded-[8px] p-2 flex items-center justify-center">
                      <img
                        src={bundle.images[0]?.src}
                        alt={bundle.images[0]?.alt}
                        className="h-full w-full object-contain mix-blend-multiply"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[14px] md:text-[15px] font-semibold text-black leading-tight">
                        {bundle.title}
                      </h3>
                      <p className="mt-1 text-[11px] md:text-[12px] text-black/60">
                        {bundle.details}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[14px] md:text-[15px] font-bold text-black block">
                        ৳{bundle.price.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] font-semibold text-black/60">
                        Full Name
                      </span>
                      <input
                        required
                        name="name"
                        className="h-12 w-full rounded-[8px] border border-black/15 bg-white/70 px-4 text-[16px] font-normal outline-none transition-colors focus:border-black"
                        placeholder="Your name"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] font-semibold text-black/60">
                        Phone Number
                      </span>
                      <input
                        required
                        name="phone"
                        type="tel"
                        className="h-12 w-full rounded-[8px] border border-black/15 bg-white/70 px-4 text-[16px] font-normal outline-none transition-colors focus:border-black"
                        placeholder="01XXXXXXXXX"
                      />
                    </label>
                  </div>

                  {/* Address */}
                  <label className="block space-y-2">
                    <span className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] font-semibold text-black/60">
                      Delivery Address
                    </span>
                    <textarea
                      required
                      name="address"
                      rows={2}
                      className="w-full resize-none rounded-[8px] border border-black/15 bg-white/70 px-4 py-3 text-[16px] font-normal outline-none transition-colors focus:border-black"
                      placeholder="House, road, area, city"
                    />
                  </label>

                  {/* Shipping Zone */}
                  {shippingZones.length > 0 && (
                    <div className="grid gap-3">
                      <span className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] font-semibold text-black/60">
                        Delivery Zone
                      </span>
                      {qualifiesForFreeDelivery && selectedZone ? (
                        <div className="border border-black/10 bg-white p-4 rounded-[8px]">
                          <span className="block text-[10px] uppercase tracking-[0.28em] font-bold text-black">
                            Free Delivery — {selectedZone.name}
                          </span>
                          <span className="mt-2 block text-2xl font-bold" style={{ color: config.primaryColor }}>
                            ৳0
                          </span>
                          <span className="mt-3 block text-[9px] uppercase leading-5 tracking-[0.22em] text-black/45">
                            Free for orders over ৳{selectedZone.free_above?.toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <div className="grid gap-2 md:grid-cols-2">
                          {shippingZones.map((zone) => (
                            <button
                              key={zone.id}
                              type="button"
                              onClick={() => setSelectedZoneId(zone.id)}
                              className={`border p-3 text-left transition-all rounded-[8px] ${
                                selectedZoneId === zone.id
                                  ? "border-[1.5px] bg-opacity-5"
                                  : "border-black/15 bg-transparent hover:border-black/30"
                              }`}
                              style={selectedZoneId === zone.id ? {
                                borderColor: config.primaryColor,
                                backgroundColor: `${config.primaryColor}0d`,
                              } : undefined}
                            >
                              <span className="block text-[10px] uppercase tracking-[0.28em] font-bold">
                                {zone.name}
                              </span>
                              <span className="mt-2 block text-2xl font-bold">
                                ৳{zone.price}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payment Method */}
                  <div className="grid gap-3">
                    <span className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] font-semibold text-black/60">
                      Payment Method
                    </span>
                    <div className={`grid gap-2 ${hasBkash ? "md:grid-cols-2" : "grid-cols-1"}`}>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("cash_on_delivery")}
                        className={`border p-3 text-left transition-all rounded-[8px] ${
                          paymentMethod === "cash_on_delivery"
                            ? "border-[1.5px]"
                            : "border-black/15 bg-transparent hover:border-black/30"
                        }`}
                        style={paymentMethod === "cash_on_delivery" ? {
                          borderColor: config.primaryColor,
                          backgroundColor: `${config.primaryColor}0d`,
                        } : undefined}
                      >
                        <span className="flex min-h-10 items-center justify-center text-center text-[10px] uppercase tracking-[0.28em] font-bold">
                          Cash on Delivery
                        </span>
                      </button>

                      {hasBkash && (
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("bkash")}
                          className={`border p-3 text-left transition-all rounded-[8px] ${
                            paymentMethod === "bkash"
                              ? "border-[1.5px] border-[#e2136e] bg-[#fff4f8]"
                              : "border-black/15 bg-transparent hover:border-black/30"
                          }`}
                        >
                          <span className="flex min-h-10 items-center justify-center text-[10px] uppercase tracking-[0.28em] font-bold">
                            bKash
                          </span>
                        </button>
                      )}
                    </div>

                    <AnimatePresence initial={false}>
                      {paymentMethod === "bkash" && hasBkash && (
                        <motion.div
                          key="bkash-payment"
                          initial={{ opacity: 0, height: 0, y: -8 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -8 }}
                          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="border border-[#e2136e]/25 bg-[#fff4f8] rounded-[8px] p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <span className="flex items-center gap-2 text-[9px] uppercase tracking-[0.28em] font-bold text-[#e2136e]">
                                  Send Money
                                </span>
                                <span className="mt-2 block text-2xl font-bold text-black">
                                  {bkashNumber}
                                </span>
                              </div>
                              <Button
                                type="button"
                                onClick={copyBkashNumber}
                                className="h-11 rounded-[8px] bg-[#e2136e] px-4 text-white hover:bg-black"
                                aria-label="Copy bKash number"
                              >
                                <AnimatePresence mode="wait" initial={false}>
                                  {bkashCopied ? (
                                    <motion.span
                                      key="check"
                                      initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                      exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
                                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                    >
                                      <Check className="h-4 w-4" />
                                    </motion.span>
                                  ) : (
                                    <motion.span
                                      key="copy"
                                      initial={{ opacity: 0, scale: 0.75 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.75 }}
                                      transition={{ duration: 0.16 }}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </motion.span>
                                  )}
                                </AnimatePresence>
                              </Button>
                            </div>
                            <ol className="mt-4 space-y-2 border-t border-[#e2136e]/15 pt-4 text-[10px] uppercase leading-5 tracking-[0.18em] text-black/55">
                              <li>1. Open your bKash app.</li>
                              <li>2. Select <span className="bg-[#e2136e] px-2 py-1 font-bold text-white">Send Money</span>.</li>
                              <li>3. Send the total amount to the number above.</li>
                              <li>4. Enter your reference ID below.</li>
                            </ol>
                            <label className="mt-4 block space-y-2">
                              <span className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] font-semibold text-black/60">
                                Reference ID (TRXID)
                              </span>
                              <input
                                required
                                name="bkashTrxId"
                                className="h-12 w-full rounded-[8px] border border-[#e2136e]/30 bg-white/80 px-4 text-[16px] font-normal uppercase outline-none transition-colors focus:border-[#e2136e]"
                                placeholder="Example: 8N7B3KQ4LP"
                              />
                            </label>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {orderError && (
                    <div className="border border-red-500/30 bg-red-50 px-4 py-3 text-[10px] uppercase tracking-[0.22em] leading-5 text-red-700">
                      {orderError}
                    </div>
                  )}

                  {/* Order Total */}
                  <div className="bg-black/5 rounded-[12px] p-5">
                    <div className="flex justify-between text-[11px] uppercase tracking-widest text-black/60 font-medium">
                      <span>Items</span>
                      <span className="font-semibold text-black">৳{bundle.price.toLocaleString()}</span>
                    </div>
                    <div className="mt-4 flex justify-between text-[11px] uppercase tracking-widest text-black/60 font-medium">
                      <span>Delivery</span>
                      <span className="font-semibold text-black">
                        {deliveryCharge === null ? "Select zone" : deliveryCharge === 0 ? "Free" : `৳${deliveryCharge}`}
                      </span>
                    </div>
                    <div className="mt-5 flex items-end justify-between gap-4 border-t border-black/10 pt-5">
                      <span className="text-[12px] uppercase tracking-widest font-bold text-black">
                        Total
                      </span>
                      {deliveryCharge === null ? (
                        <span className="max-w-[220px] text-right text-[10px] uppercase tracking-wider leading-5 font-semibold text-red-600">
                          Please select a delivery zone
                        </span>
                      ) : (
                        <span className="text-4xl font-semibold tracking-tight text-black leading-none">
                          ৳{(bundle.price + deliveryCharge).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    disabled={orderSubmitting}
                    className="h-14 w-full rounded-[8px] text-white text-[10px] uppercase font-bold tracking-[0.35em] transition-all disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    {orderSubmitting ? "Placing Order..." : "Place Order"}
                  </Button>
                </form>
              )}
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      )}
    </Dialog>
  );
}
