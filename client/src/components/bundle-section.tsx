import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

import makeupPen from "@assets/makeup_pen_4_in_1.png";
import tintBordeaux from "@assets/peptide_lip_tint_bordeaux.png";
import tintPlum from "@assets/peptide_lip_tint_plum.png";
import tintRose from "@assets/peptide_lip_tint_rosy.png";
import tintMauve from "@assets/peptide_lip_tint_mauve.png";

const lipTints = [
  { name: "Bordeaux", tone: "Burnt red", image: tintBordeaux, swatch: "#8f3329" },
  { name: "Plum Veil", tone: "Deep berry", image: tintPlum, swatch: "#452234" },
  { name: "Rosy Bloom", tone: "Petal pink", image: tintRose, swatch: "#d85d86" },
  { name: "Mauve Nude", tone: "Soft rose", image: tintMauve, swatch: "#b96f79" }
];

const tintLookImages: Record<string, { src: string; alt: string }> = {
  "Bordeaux": {
    src: "/pbj-carousel-1_2480x%20(1).webp",
    alt: "Bordeaux Burnt Red finished look",
  },
  "Plum Veil": {
    src: "/imgi_131_Mobile-EspressoGrid-1_1024x.jpg",
    alt: "Plum Veil Deep Berry finished look",
  },
  "Rosy Bloom": {
    src: "/imgi_130_PDP-Ribbon-1-M_1024x.jpg",
    alt: "Rosy Bloom Petal Pink finished look",
  },
  "Mauve Nude": {
    src: "/salty-tan-carousel-4_2480x.webp",
    alt: "Mauve Nude Soft Rose finished look",
  },
};

const deliveryOptions = [
  { label: "Inside Dhaka", charge: 80 },
  { label: "Outside Dhaka", charge: 130 }
];

export default function BundleSection() {
  const [selectedTint, setSelectedTint] = useState(lipTints[0]);
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderOpenInstance, setOrderOpenInstance] = useState(0);
  const [selectedBundle, setSelectedBundle] = useState<{
    title: string;
    details: string;
    price: number;
    images: { src: string; alt: string }[];
  } | null>(null);
  const [orderClosing, setOrderClosing] = useState(false);
  const [deliveryCharge, setDeliveryCharge] = useState(deliveryOptions[0].charge);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const selectedTintLook = tintLookImages[selectedTint.name];

  const openOrderForm = (bundle: NonNullable<typeof selectedBundle>) => {
    setOrderOpenInstance((current) => current + 1);
    setSelectedBundle(bundle);
    setDeliveryCharge(deliveryOptions[0].charge);
    setOrderSubmitted(false);
    setOrderSubmitting(false);
    setOrderError("");
    setOrderRef("");
    setOrderClosing(false);
    setOrderOpen(true);
    trackMerchantSuiteEvent("checkout");

    const eventId = createEventId();
    trackMetaEvent({
      eventName: "InitiateCheckout",
      eventId,
      capi: true,
      customData: {
        currency: "BDT",
        value: bundle.price,
        content_type: "product",
        contents: [{ id: bundle.title, quantity: 1, item_price: bundle.price }],
      },
    });
  };

  const updateOrderOpen = (nextOpen: boolean) => {
    if (nextOpen) {
      setOrderClosing(false);
      setOrderOpen(true);
      return;
    }

    setOrderClosing(true);
    setOrderOpen(false);
  };

  useEffect(() => {
    if (orderSubmitted) {
      trackMerchantSuiteEvent("purchased");
    }
  }, [orderSubmitted]);

  const placeOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedBundle) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const eventId = createEventId();
    setOrderSubmitting(true);
    setOrderError("");

    try {
      const response = await apiRequest("POST", "/api/orders", {
        bundleTitle: selectedBundle.title,
        bundleDetails: selectedBundle.details,
        bundlePrice: selectedBundle.price,
        deliveryCharge,
        customerName: String(formData.get("name") || ""),
        phone: String(formData.get("phone") || ""),
        address: String(formData.get("address") || ""),
        metaEventId: eventId,
      });
      const result = await response.json();
      setOrderRef(result.orderRef || "");
      setOrderSubmitted(true);

      trackMetaEvent({
        eventName: "Purchase",
        eventId,
        capi: false, // Purchase is sent server-side from /api/orders (for dedup)
        customData: {
          currency: "BDT",
          value: selectedBundle.price + deliveryCharge,
          content_type: "product",
          contents: [{ id: selectedBundle.title, quantity: 1, item_price: selectedBundle.price }],
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
    <section id="bundles" className="scroll-mt-24 bg-[#f6f6f6] border-y border-black/5 px-4 pt-8 pb-10 md:px-16 md:pt-14 md:pb-16 overflow-hidden">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-8 border-y border-black/10 py-8 md:grid-cols-[1fr_auto_1fr] md:items-end md:gap-10 md:py-10">
          <div className="flex items-center gap-4 text-[9px] uppercase tracking-[0.45em] font-bold text-brand-gold">
            <span>Beauty System</span>
            <span className="h-px w-10 bg-black/15" />
            <span>01</span>
          </div>

          <h2 className="text-center text-4xl md:text-7xl font-display font-light uppercase tracking-tight leading-none">
            Everyday <span className="font-bold">Edit</span>
          </h2>

          <div className="flex items-center justify-start gap-4 text-[9px] uppercase tracking-[0.45em] font-bold text-black/35 md:justify-end">
            <span>Makeup Pen</span>
            <span className="h-px w-10 bg-black/15" />
            <span>Lip Tint</span>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:mt-20">
          <motion.article
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="grid overflow-hidden border border-black/10 bg-brand-ivory md:grid-cols-[0.92fr_1.08fr]"
          >
            <div className="relative grid grid-cols-2 gap-px bg-black/10">
              <div className={`relative bg-[#ebe8e4] p-6 ${selectedTintLook ? "row-span-2" : "aspect-[4/5]"}`}>
                <img
                  src={makeupPen}
                  alt="4-in-1 Makeup Pen"
                  className="h-full w-full object-contain mix-blend-multiply"
                />
              </div>
              <div className="absolute left-1/2 top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-black/10 bg-brand-ivory/90 text-lg font-light text-black shadow-[0_18px_40px_rgba(0,0,0,0.08)]">
                +
              </div>
              <div className="relative aspect-[4/5] bg-[#ebe8e4] p-6">
                <img
                  src={selectedTint.image}
                  alt={`${selectedTint.name} Peptide Lip Tint`}
                  className="h-full w-full object-contain mix-blend-multiply"
                />
              </div>
              {selectedTintLook && (
                <div className="bg-[#ebe8e4] p-2">
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#ded8cf]">
                    <img
                      src={selectedTintLook.src}
                      alt={selectedTintLook.alt}
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col justify-between p-6 md:p-12">
              <div className="space-y-8">
                <div className="flex items-start justify-between gap-6 border-b border-black/10 pb-6">
                  <div>
                    <span className="mb-4 block text-[9px] uppercase tracking-[0.5em] font-bold text-brand-gold">
                      The Everyday Edit - Classic
                    </span>
                    <h3 className="text-3xl md:text-5xl font-display font-light uppercase tracking-tight leading-none">
                      Makeup Pen + <span className="font-bold">1 Lip Tint</span>
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="block text-2xl md:text-4xl font-garet font-bold">৳1,499</span>
                    <span className="mt-2 block text-[9px] uppercase tracking-[0.35em] font-garet font-bold text-black/35">
                      ৳300+ off
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[9px] uppercase tracking-[0.45em] font-bold text-black/40">
                      Choose one flavour
                    </span>
                    <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-brand-gold">
                      {selectedTint.name}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    {lipTints.map((tint) => (
                      <button
                        key={tint.name}
                        type="button"
                        onClick={() => setSelectedTint(tint)}
                        className={`group flex min-h-16 items-center gap-2.5 border px-2.5 py-2 text-left transition-all md:block md:min-h-0 md:p-3 ${
                          selectedTint.name === tint.name
                            ? "border-black bg-white"
                            : "border-black/10 bg-transparent hover:border-black/30"
                        }`}
                      >
                        <span
                          className="block h-7 w-7 shrink-0 rounded-full border border-black/10 md:mb-4 md:h-5 md:w-5"
                          style={{ backgroundColor: tint.swatch }}
                        />
                        <span className="min-w-0">
                          <span className="block text-[9px] uppercase tracking-[0.18em] font-bold leading-tight text-black md:text-[10px] md:tracking-[0.25em]">
                            {tint.name}
                          </span>
                          <span className="mt-1 block text-[8px] uppercase tracking-[0.18em] font-medium leading-tight text-black/45 md:tracking-[0.25em] md:text-black/35">
                            {tint.tone}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                onClick={() =>
                  openOrderForm({
                    title: "Makeup Pen + 1 Lip Tint",
                    details: `Makeup Pen + 1 Lip Tint (${selectedTint.name})`,
                    price: 1499,
                    images: [
                      { src: makeupPen, alt: "4-in-1 Makeup Pen" },
                      { src: selectedTint.image, alt: `${selectedTint.name} Peptide Lip Tint` }
                    ]
                  })
                }
                className="mt-8 h-14 w-full rounded-[8px] bg-black text-white text-[10px] uppercase font-bold tracking-[0.35em] hover:bg-brand-gold transition-all flex items-center justify-center"
              >
                Buy Classic Bundle
              </Button>
            </div>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="grid overflow-hidden border border-black/10 bg-brand-ivory md:grid-cols-[1.08fr_0.92fr]"
          >
            <div className="relative grid gap-px bg-black/10">
              <div className="relative h-48 bg-[#f6f6f6] p-5 md:h-auto md:aspect-[16/9] md:p-10">
                <img
                  src={makeupPen}
                  alt="4-in-1 Makeup Pen"
                  className="h-full w-full object-contain mix-blend-multiply"
                />
              </div>
              <div className="absolute left-1/2 top-[56%] z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-black/10 bg-brand-ivory/95 text-lg font-light text-black shadow-[0_18px_40px_rgba(0,0,0,0.08)] md:top-[58%]">
                +
              </div>
              <div className="grid grid-cols-4 gap-px bg-black/10">
                {lipTints.map((tint) => (
                  <div key={tint.name} className="relative h-32 bg-[#f6f6f6] p-1.5 md:h-auto md:aspect-[3/5] md:p-5">
                    <img
                      src={tint.image}
                      alt={`${tint.name} Peptide Lip Tint`}
                      className="h-full w-full object-contain mix-blend-multiply"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-between p-6 md:p-12">
              <div className="space-y-8">
                <div className="border-b border-black/10 pb-6">
                  <span className="mb-4 block text-[9px] uppercase tracking-[0.5em] font-bold text-brand-gold">
                    The Everyday Edit - Quad
                  </span>
                  <h3 className="text-[2rem] md:text-5xl font-display font-light uppercase tracking-tight leading-[1.05] md:leading-none">
                    <span className="block md:inline">Makeup Pen +</span>{" "}
                    <span className="font-bold">All 4 Lip Tints</span>
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <span className="block text-[9px] uppercase tracking-[0.35em] font-bold text-black/35">
                      Bundle Price
                    </span>
                    <span className="mt-2 block text-3xl md:text-5xl font-garet font-bold">
                      ৳2,499
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-[0.35em] font-bold text-black/35">
                      Savings
                    </span>
                    <span className="mt-3 block text-[10px] uppercase tracking-[0.35em] font-garet font-bold text-brand-gold">
                      ৳700+ off
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {lipTints.map((tint) => (
                    <div key={tint.name} className="flex items-center gap-3 border border-black/10 px-3 py-3">
                      <span
                        className="h-4 w-4 rounded-full border border-black/10"
                        style={{ backgroundColor: tint.swatch }}
                      />
                      <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-black/55">
                        {tint.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={() =>
                  openOrderForm({
                    title: "Makeup Pen + 4 Lip Tints",
                    details: `Makeup Pen + 4 Lip Tints (${lipTints.map((tint) => tint.name).join(", ")})`,
                    price: 2499,
                    images: [
                      { src: makeupPen, alt: "4-in-1 Makeup Pen" },
                      ...lipTints.map((tint) => ({
                        src: tint.image,
                        alt: `${tint.name} Peptide Lip Tint`
                      }))
                    ]
                  })
                }
                className="mt-8 h-14 w-full rounded-[8px] bg-black text-white text-[10px] uppercase font-bold tracking-[0.35em] hover:bg-brand-gold transition-all flex items-center justify-center"
              >
                Buy Quad Bundle
              </Button>
            </div>
          </motion.article>
        </div>
      </div>

      <Dialog open={orderOpen || orderClosing} onOpenChange={updateOrderOpen}>
        {(orderOpen || orderClosing) && selectedBundle && (
          <DialogContent
            forceMount
            onOpenAutoFocus={(event) => event.preventDefault()}
            className="bottom-0 top-0 h-screen max-h-screen translate-y-0 overflow-y-auto rounded-none border-none bg-[#f6f6f6] p-0 shadow-[0_80px_180px_rgba(0,0,0,0.28)] data-[state=open]:animate-none data-[state=closed]:animate-none supports-[height:100dvh]:h-dvh supports-[height:100dvh]:max-h-dvh md:bottom-auto md:top-[50%] md:h-auto md:max-h-[92dvh] md:translate-y-[-50%] md:max-w-[900px] [&>button]:rounded-[8px] [&>button]:border [&>button]:border-black/10 [&>button]:bg-white/70"
          >
            <AnimatePresence
              initial={true}
              onExitComplete={() => setOrderClosing(false)}
            >
              {orderOpen && (
                <motion.div
                  key={orderOpenInstance}
                  initial={{ opacity: 0, y: 48, scale: 0.96, filter: "blur(6px)" }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    filter: "blur(0px)",
                    transition: { duration: 0.58, ease: [0.22, 1, 0.36, 1] },
                  }}
                  exit={{
                    opacity: 0,
                    y: 48,
                    scale: 0.96,
                    filter: "blur(6px)",
                    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
                  }}
                  className="grid min-h-full bg-[#f6f6f6] md:min-h-0 md:grid-cols-[0.86fr_1.14fr]"
                >
              <div className="relative hidden bg-[#e7e3df] p-10 md:block">
                <div className="absolute inset-6 border border-black/10" />
                {selectedBundle.images.length > 2 ? (
                  <div className="relative z-10 grid h-full min-h-[620px] gap-px bg-black/10">
                    <div className="bg-[#f6f6f6] p-8">
                      <img
                        src={selectedBundle.images[0].src}
                        alt={selectedBundle.images[0].alt}
                        className="h-full w-full object-contain mix-blend-multiply"
                      />
                    </div>
                    <div className="absolute left-1/2 top-[55%] z-20 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-black/10 bg-brand-ivory/95 text-lg font-light text-black shadow-[0_18px_40px_rgba(0,0,0,0.08)]">
                      +
                    </div>
                    <div className="grid grid-cols-4 gap-px bg-black/10">
                      {selectedBundle.images.slice(1).map((image) => (
                        <div key={image.alt} className="bg-[#f6f6f6] p-4">
                          <img
                            src={image.src}
                            alt={image.alt}
                            className="h-full w-full object-contain mix-blend-multiply"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="relative z-10 grid h-full min-h-[620px] grid-cols-2 gap-px bg-black/10">
                    {selectedBundle.images.map((image) => (
                      <div key={image.alt} className="bg-[#f6f6f6] p-5">
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="h-full w-full object-contain mix-blend-multiply"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 md:p-10">
                <DialogHeader className="border-b border-black/10 pb-6 text-center">
                  <DialogDescription className="text-[9px] uppercase tracking-[0.5em] font-bold text-brand-gold">
                    Secure Order Request
                  </DialogDescription>
                  <DialogTitle className="font-display text-3xl md:text-5xl font-light uppercase tracking-tight leading-none text-black">
                    Place <span className="font-bold">Order</span>
                  </DialogTitle>
                </DialogHeader>

                {orderSubmitted ? (
                  <motion.div
                    key={`order-success-${orderRef || "no-ref"}`}
                    initial={{ opacity: 0, y: 18, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.99 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="py-16 text-center"
                  >
                    <span className="mx-auto mb-8 block h-px w-20 bg-brand-gold" />
                    <h3 className="font-display text-3xl font-light uppercase tracking-tight">
                      Order Placed Successfully
                    </h3>
                    <p className="mx-auto mt-5 max-w-md text-[10px] uppercase tracking-[0.28em] leading-7 text-black/45">
                      Thanks for your order. We’ll contact you shortly with delivery and payment details.
                    </p>
                    {orderRef && (
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        className="mx-auto mt-4 max-w-md text-[10px] uppercase tracking-[0.28em] leading-7 text-brand-gold"
                      >
                        Order Reference {orderRef}
                      </motion.p>
                    )}
                    <Button
                      onClick={() => updateOrderOpen(false)}
                      className="mt-10 h-12 rounded-[8px] bg-black px-10 text-[10px] uppercase tracking-[0.35em] text-white hover:bg-brand-gold"
                    >
                      Close
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={placeOrder} className="mt-8 space-y-8">
                    <div className="grid gap-4 border border-black/10 bg-white/45 p-4 md:grid-cols-[140px_1fr] md:p-5">
                      {selectedBundle.images.length > 2 ? (
                        <div className="relative grid gap-px bg-black/10">
                          <div className="h-24 bg-[#ebe8e4] p-2 md:h-auto md:aspect-[16/10]">
                            <img
                              src={selectedBundle.images[0].src}
                              alt={selectedBundle.images[0].alt}
                              className="h-full w-full object-contain mix-blend-multiply"
                            />
                          </div>
                          <div className="absolute left-1/2 top-[56%] z-10 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-black/10 bg-brand-ivory/90 text-sm font-light text-black shadow-[0_14px_30px_rgba(0,0,0,0.08)]">
                            +
                          </div>
                          <div className="grid grid-cols-4 gap-px bg-black/10">
                            {selectedBundle.images.slice(1).map((image) => (
                              <div key={`${image.alt}-summary`} className="h-20 bg-[#ebe8e4] p-1.5 md:h-auto md:aspect-[3/5] md:p-2">
                                <img
                                  src={image.src}
                                  alt={image.alt}
                                  className="h-full w-full object-contain mix-blend-multiply"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="relative grid aspect-[4/5] grid-cols-2 gap-px bg-black/10">
                          {selectedBundle.images.map((image) => (
                            <div key={`${image.alt}-summary`} className="bg-[#ebe8e4] p-1.5 md:p-2">
                              <img
                                src={image.src}
                                alt={image.alt}
                                className="h-full w-full object-contain mix-blend-multiply"
                              />
                            </div>
                          ))}
                          <div className="absolute left-1/2 top-1/2 z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-black/10 bg-brand-ivory/90 text-base font-light text-black shadow-[0_14px_30px_rgba(0,0,0,0.08)]">
                            +
                          </div>
                        </div>
                      )}
                      <div className="flex flex-col justify-center gap-5">
                        <div>
                          <span className="mb-2 block text-[9px] uppercase tracking-[0.35em] font-bold text-brand-gold">
                            Selected Bundle
                          </span>
                          <h3 className="font-display text-2xl font-light uppercase tracking-tight">
                            {selectedBundle.title}
                          </h3>
                          <p className="mt-2 text-[10px] uppercase tracking-[0.25em] leading-5 text-black/45">
                            {selectedBundle.details}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2">
                        <span className="text-[9px] uppercase tracking-[0.35em] font-bold text-black/45">
                          Full Name
                        </span>
                        <input
                          required
                          name="name"
                          className="h-12 w-full rounded-none border border-black/10 bg-white/70 px-4 text-sm outline-none transition-colors focus:border-black"
                          placeholder="Your name"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-[9px] uppercase tracking-[0.35em] font-bold text-black/45">
                          Phone Number
                        </span>
                        <input
                          required
                          name="phone"
                          type="tel"
                          className="h-12 w-full rounded-none border border-black/10 bg-white/70 px-4 text-sm outline-none transition-colors focus:border-black"
                          placeholder="01XXXXXXXXX"
                        />
                      </label>
                    </div>

                    <label className="block space-y-2">
                      <span className="text-[9px] uppercase tracking-[0.35em] font-bold text-black/45">
                        Delivery Address
                      </span>
                      <textarea
                        required
                        name="address"
                        rows={4}
                        className="w-full resize-none rounded-none border border-black/10 bg-white/70 px-4 py-3 text-sm outline-none transition-colors focus:border-black"
                        placeholder="House, road, area, city"
                      />
                    </label>

                    {orderError && (
                      <div className="border border-red-500/30 bg-red-50 px-4 py-3 text-[10px] uppercase tracking-[0.22em] leading-5 text-red-700">
                        {orderError}
                      </div>
                    )}

                    <div className="grid gap-3">
                      <span className="text-[9px] uppercase tracking-[0.35em] font-bold text-black/45">
                        Delivery Charge
                      </span>
                      <div className="grid gap-2 md:grid-cols-2">
                        {deliveryOptions.map((option) => (
                          <button
                            key={option.label}
                            type="button"
                            onClick={() => setDeliveryCharge(option.charge)}
                            className={`border p-4 text-left transition-all ${
                              deliveryCharge === option.charge
                                ? "border-black bg-white"
                                : "border-black/10 bg-transparent hover:border-black/30"
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
                    </div>

                    <div className="border-y border-black/10 py-4">
                      <div className="flex justify-between text-[10px] uppercase tracking-[0.3em] text-black/45">
                        <span>Bundle</span>
                        <span className="font-garet font-bold">৳{selectedBundle.price.toLocaleString()}</span>
                      </div>
                      <div className="mt-3 flex justify-between text-[10px] uppercase tracking-[0.3em] text-black/45">
                        <span>Delivery</span>
                        <span className="font-garet font-bold">৳{deliveryCharge}</span>
                      </div>
                      <div className="mt-4 flex items-end justify-between border-t border-black/10 pt-4">
                        <span className="text-[10px] uppercase tracking-[0.35em] font-bold text-black">
                          Total
                        </span>
                        <span className="font-garet text-3xl font-bold text-black">
                          ৳{(selectedBundle.price + deliveryCharge).toLocaleString()}
                        </span>
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
              </div>
                </motion.div>
              )}
            </AnimatePresence>
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
}
