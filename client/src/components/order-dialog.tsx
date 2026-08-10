import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { createEventId, trackMetaEvent } from "@/lib/meta";
import { trackMerchantSuiteEvent } from "@/lib/merchant-suite";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

const deliveryOptions = [
  { label: "Inside Dhaka", charge: 80 },
  { label: "Outside Dhaka", charge: 130 }
];

const freeDeliveryThreshold = 2500;
const bkashNumber = "01706099819";

function BkashLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-37.062 -28.3525 321.204 170.115"
      className={className}
      aria-hidden="true"
    >
      <g fill="none">
        <path fill="#D12053" d="M223.65 62.45l-53.03-8.31 7.03 31.6z" />
        <path fill="#E2136E" d="M223.65 62.45L183.69 6.93l-13.06 47.22z" />
        <path fill="#D12053" d="M169.39 53.51L127.52 0l54.83 6.55z" />
        <path fill="#9E1638" d="M150.32 31.15L127.07 9.24h6.12z" />
        <path fill="#D12053" d="M234.96 35.46l-9.84 26.69-15.95-22.06z" />
        <path fill="#E2136E" d="M183.84 84.14l38.61-15.51 1.62-4.93z" />
        <path fill="#9E1638" d="M152.96 113.41l16.54-58.02 8.39 37.75z" />
        <path fill="#E2136E" d="M236.5 35.67l-4.06 11.02 14.64-.24zM0 40.09c.71.06 1.43.19 2.19.19s1.38-.13 2.19-.19v23.47c2.31-3.93 5.22-6.52 9.5-6.52 7.74 0 11.06 7.66 11.06 14.7 0 8.43-4.5 16.5-12.39 16.5a8.66 8.66 0 01-7.77-4.47c-1.32 1.16-2.49 2.55-3.74 3.81h-1zm4.28 34.52c0 6.84 2.9 11.61 7.67 11.61 6.19 0 8.18-8.32 8.18-14.22 0-6.85-2.26-12.24-7.62-12.3-6.26-.05-8.23 7.36-8.23 14.92z" />
        <path fill="#231F20" d="M45.13 55.27l-4.66 6c4.38 6.4 8.92 12.67 13.32 19.15l4.44 7v.35c-1.09-.07-2.08-.21-3-.21-.92 0-2.08.14-3.06.21-1.21-2.24-2.41-4.31-3.78-6.34l-12-17.75c-.27-.28-.92-.5-.92-.21v24.3c-.88-.07-1.65-.21-2.41-.21-.76 0-1.64.14-2.41.21V40.09c.77.06 1.6.21 2.41.21s1.53-.15 2.41-.21v21.52c0 .42.82.14 1.36-.42a37.1 37.1 0 002.92-3.42l13.49-17.7c.71.06 1.42.21 2.19.21s1.36-.15 2.14-.21zM81.42 82.4c0 2.48-.16 3.74 3.07 2.92v1.39a8.87 8.87 0 01-1.65.63c-2.85.57-5.21.06-5.65-3.67l-.49.55a10.17 10.17 0 01-8.12 4c-3.88 0-7.28-3.06-7.28-7.75 0-7.23 5-8.18 10.13-9.13 4.34-.82 5.82-1.2 5.82-4.25 0-4.7-2.3-7.42-6.41-7.42a6.85 6.85 0 00-6.52 4.37h-.6v-3.52a14.2 14.2 0 018.87-3.48c5.75 0 8.88 3.48 8.88 10.65zm-4.38-10.47l-1.93.44c-3.73.82-9.32 1.45-9.32 7.24 0 4 2 6 5.36 6a6.83 6.83 0 004.44-2.44c.4-.46 1.5-1.54 1.5-2zm14.15 9.63c1.3 2.49 3.72 4.72 6.3 4.72a5.67 5.67 0 005.38-5.78c0-8.56-12.95-3-12.95-14.08 0-6.08 4-9.37 8.93-9.37 2.18-.048 4.33.52 6.2 1.64a32.791 32.791 0 00-1.3 4.5h-.5c-.72-2.09-2.63-4.19-4.66-4.19-2.74 0-5 1.85-5 5.28 0 8.11 12.95 3.79 12.95 13.94 0 6.79-5.26 10-10.1 10a12.73 12.73 0 01-6.84-2 34.42 34.42 0 001.15-4.65zm22.73-41.47c.73.06 1.44.19 2.2.19.76 0 1.38-.13 2.2-.19v23.09c1.92-3.87 4.93-6.14 8.83-6.14 6.36 0 8.83 4.36 8.83 12.36v18.37c-.83-.07-1.47-.19-2.2-.19-.73 0-1.48.13-2.2.19V70.85c0-7-1.41-10.53-6.08-10.53-4.94 0-7.18 3.56-7.18 10.15v17.3c-.82-.07-1.47-.19-2.2-.19-.73 0-1.46.13-2.2.19z" />
      </g>
    </svg>
  );
}

export type OrderDialogBundle = {
  title: string;
  details: string;
  price: number;
  images: { src: string; alt: string }[];
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
  const [openInstance, setOpenInstance] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState<number | null>(null);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [orderClosing, setOrderClosing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash_on_delivery" | "bkash" | null>(null);
  const [bkashCopied, setBkashCopied] = useState(false);
  const previousOpen = useRef(open);
  const qualifiesForFreeDelivery = (bundle?.price ?? 0) >= freeDeliveryThreshold;

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
  }, [open]);

  useEffect(() => {
    if (open && qualifiesForFreeDelivery) {
      setDeliveryCharge(0);
    }
  }, [open, qualifiesForFreeDelivery]);

  useEffect(() => {
    if (orderSubmitted) {
      trackMerchantSuiteEvent("purchased");
    }
  }, [orderSubmitted]);

  const resetDialog = (nextOpen: boolean) => {
    if (!nextOpen) {
      setOrderClosing(true);
      onOpenChange(false);
      return;
    }

    setOrderClosing(false);
    onOpenChange(nextOpen);
    setDeliveryCharge(null);
    setOrderSubmitted(false);
    setOrderSubmitting(false);
    setOrderError("");
    setOrderRef("");
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

    if (!bundle) {
      return;
    }

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

    if (deliveryCharge === null) {
      setOrderError("Please select a delivery charge before placing your order.");
      return;
    }
    if (paymentMethod === null) {
      setOrderError("Please select a payment method before placing your order.");
      return;
    }
    if (paymentMethod === "bkash" && !bkashTrxId) {
      setOrderError("Please enter your bKash Reference ID (TRXID).");
      return;
    }

    const selectedDeliveryCharge = deliveryCharge;
    const selectedPaymentMethod = paymentMethod;
    setOrderSubmitting(true);
    setOrderError("");

    try {
      const response = await apiRequest("POST", "/api/orders", {
        bundleTitle: bundle.title,
        bundleDetails: bundle.details,
        bundlePrice: bundle.price,
        deliveryCharge: selectedDeliveryCharge,
        customerName: String(formData.get("name") || ""),
        phone: String(formData.get("phone") || ""),
        address: String(formData.get("address") || ""),
        paymentMethod: selectedPaymentMethod,
        bkashTrxId: String(formData.get("bkashTrxId") || ""),
        metaEventId: eventId,
      });
      const result = await response.json();
      setOrderRef(result.orderRef || "");
      setOrderSubmitted(true);
      onSuccess?.();

      trackMetaEvent({
        eventName: "Purchase",
        eventId,
        capi: false, // Purchase is sent server-side from /api/orders (for dedup)
        customData: {
          currency: "BDT",
          value: bundle.price + selectedDeliveryCharge,
          content_type: "product",
          contents: [{ id: bundle.title, quantity: 1, item_price: bundle.price }],
        },
      });
    } catch (error) {
      setOrderError(
        error instanceof Error
          ? error.message
          : "Could not place your order. Please try again.",
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
                    Our studio team will contact you shortly to confirm delivery and payment.
                  </motion.p>
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
                  <div className="bg-black/5 rounded-[12px] p-4 flex items-center gap-4">
                    <div className="relative shrink-0 w-16 h-16 md:w-20 md:h-20 bg-[#ebe8e4] rounded-[8px] p-2 flex items-center justify-center">
                      <img
                        src={bundle.images[0].src}
                        alt={bundle.images[0].alt}
                        className="h-full w-full object-contain mix-blend-multiply"
                      />
                      <div className="absolute -top-2 -right-2 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-sm">
                        1
                      </div>
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

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] font-semibold text-black/60">
                        Full Name
                      </span>
                      <input
                        required
                        name="name"
                        className="h-12 w-full rounded-[8px] border border-black/15 bg-white/70 px-4 text-[16px] font-normal outline-none transition-colors focus:border-black max-md:rounded-[8px]"
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
                        className="h-12 w-full rounded-[8px] border border-black/15 bg-white/70 px-4 text-[16px] font-normal outline-none transition-colors focus:border-black max-md:rounded-[8px]"
                        placeholder="01XXXXXXXXX"
                      />
                    </label>
                  </div>

                  <label className="block space-y-2">
                    <span className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] font-semibold text-black/60">
                      Delivery Address
                    </span>
                    <textarea
                      required
                      name="address"
                      rows={2}
                      className="w-full resize-none rounded-[8px] border border-black/15 bg-white/70 px-4 py-3 text-[16px] font-normal outline-none transition-colors focus:border-black max-md:rounded-[8px]"
                      placeholder="House, road, area, city"
                    />
                  </label>

                  <div className="grid gap-3">
                    <span className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] font-semibold text-black/60">
                      Delivery Charge
                    </span>
                    {qualifiesForFreeDelivery ? (
                      <div className="border border-brand-gold/40 bg-white max-md:bg-white/10 p-4">
                        <span className="block text-[10px] uppercase tracking-[0.28em] font-bold text-black">
                          Free Delivery
                        </span>
                        <span className="mt-2 block font-garet text-2xl font-bold text-brand-gold">
                          ৳0
                        </span>
                        <span className="mt-3 block text-[9px] uppercase leading-5 tracking-[0.22em] text-black/45">
                          Applied automatically for orders over ৳2500
                        </span>
                      </div>
                    ) : (
                      <div className="grid gap-2 md:grid-cols-2">
                        {deliveryOptions.map((option) => (
                          <button
                            key={option.label}
                            type="button"
                            onClick={() => setDeliveryCharge(option.charge)}
                            className={`border p-3 text-left transition-all ${
                              deliveryCharge === option.charge
                                ? "border-brand-gold border-[1.5px] bg-brand-gold/5 rounded-[8px]"
                                : "border-black/15 bg-transparent hover:border-black/30 rounded-[8px]"
                            }`}
                          >
                            <span className="block text-[10px] uppercase tracking-[0.28em] font-bold">
                              {option.label}
                            </span>
                            <span className="mt-2 block font-garet text-2xl font-bold">
                              ৳{option.charge}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid gap-3">
                    <span className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] font-semibold text-black/60">
                      Payment Method
                    </span>
                    <div className="grid gap-2 md:grid-cols-2">
                      {[
                        { value: "cash_on_delivery" as const, label: "Cash on Delivery" },
                        { value: "bkash" as const, label: "bKash" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setPaymentMethod(option.value)}
                          className={`border p-3 text-left transition-all ${
                            paymentMethod === option.value
                              ? "border-brand-gold border-[1.5px] bg-brand-gold/5 rounded-[8px]"
                              : "border-black/15 bg-transparent hover:border-black/30 rounded-[8px]"
                          }`}
                        >
                          <span className="flex min-h-10 items-center justify-center text-center text-[10px] uppercase tracking-[0.28em] font-bold">
                            {option.value === "bkash" ? (
                              <span className="flex w-full items-center justify-center border border-[#e2136e]/20 bg-[#fff4f8] px-3 py-2">
                                <BkashLogo className="h-10 w-32" />
                              </span>
                            ) : (
                              option.label
                            )}
                          </span>
                        </button>
                      ))}
                    </div>

                    <AnimatePresence initial={false}>
                      {paymentMethod === "bkash" && (
                        <motion.div
                          key="bkash-payment"
                          initial={{ opacity: 0, height: 0, y: -8 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -8 }}
                          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="border border-[#e2136e]/25 bg-[#fff4f8] max-md:rounded-[8px] p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <span className="flex items-center gap-2 text-[9px] uppercase tracking-[0.28em] font-bold text-[#e2136e]">
                                  <BkashLogo className="h-5 w-12 shrink-0" />
                                  Send Money
                                </span>
                                <span className="mt-2 block font-garet text-2xl font-bold text-black">
                                  {bkashNumber}
                                </span>
                              </div>
                              <Button
                                type="button"
                                onClick={copyBkashNumber}
                                className="h-11 rounded-[8px] bg-[#e2136e] px-4 text-white hover:bg-black"
                                aria-label="Copy bKash number"
                                title="Copy bKash number"
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
                              <li>
                                2. Select{" "}
                                <span className="bg-[#e2136e] px-2 py-1 font-bold text-white">
                                  Send Money
                                </span>
                                .
                              </li>
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
                                className="h-12 w-full rounded-[8px] border border-[#e2136e]/30 bg-white/80 px-4 text-[16px] font-normal uppercase outline-none transition-colors focus:border-[#e2136e] max-md:rounded-[8px]"
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

                  <div className="bg-black/5 rounded-[12px] p-5">
                    <div className="flex justify-between text-[11px] uppercase tracking-widest text-black/60 font-medium">
                      <span>Items</span>
                      <span className="font-semibold text-black">৳{bundle.price.toLocaleString()}</span>
                    </div>
                    <div className="mt-4 flex justify-between text-[11px] uppercase tracking-widest text-black/60 font-medium">
                      <span>Delivery</span>
                      <span className="font-semibold text-black">
                        {deliveryCharge === null ? "Select" : deliveryCharge === 0 ? "Free" : `৳${deliveryCharge}`}
                      </span>
                    </div>
                    <div className="mt-5 flex items-end justify-between gap-4 border-t border-black/10 pt-5">
                      <span className="text-[12px] uppercase tracking-widest font-bold text-black">
                        Total
                      </span>
                      {deliveryCharge === null ? (
                        <span className="max-w-[220px] text-right text-[10px] uppercase tracking-wider leading-5 font-semibold text-red-600">
                          Please select a delivery charge
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
                    className="h-14 w-full rounded-[8px] bg-black text-white text-[10px] uppercase font-bold tracking-[0.35em] hover:bg-brand-gold transition-all disabled:cursor-not-allowed disabled:opacity-60"
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
