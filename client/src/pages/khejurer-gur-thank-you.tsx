import { useEffect, useState } from "react";
import { CircleCheck, Phone } from "lucide-react";
import { Link } from "wouter";

import { clearKhejurConfirmation, readKhejurConfirmation } from "@/features/khejurer-gur/order";
import { KHEJUR_PAGE_PATH, KHEJUR_PHONE_HREF, KHEJUR_PHONE_NUMBER, KHEJUR_WHATSAPP_HREF, formatTaka, toBanglaDigits } from "@/features/khejurer-gur/content";
import { markKalojiraPurchaseTracked } from "@/features/kalojira-mixed/tracking";
import { WhatsAppBrandIcon } from "@/features/kalojira-mixed/campaign-layout";
import { toGoogleAnalyticsItem, trackGoogleEcommerceEvent } from "@/lib/google-analytics";

function getSessionStorage() {
  if (typeof window === "undefined") return undefined;
  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
}

function SupportActions() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
      <a href={KHEJUR_PHONE_HREF} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#0f3b4f] bg-white px-5 py-3 font-semibold text-[#0f3b4f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f3b4f]">
        <Phone className="size-4" aria-hidden="true" />
        কল করুন: {KHEJUR_PHONE_NUMBER}
      </a>
      <a href={KHEJUR_WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#187d48] px-5 py-3 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b4c2a]">
        <WhatsAppBrandIcon className="size-4" />
        হোয়াটসঅ্যাপ করুন
      </a>
    </div>
  );
}

export default function KhejurerGurThankYouPage() {
  const [confirmation] = useState(() => readKhejurConfirmation(getSessionStorage()));

  useEffect(() => {
    if (!confirmation) return;
    const storage = getSessionStorage();
    clearKhejurConfirmation(storage);
    if (!markKalojiraPurchaseTracked(storage, confirmation.orderRef)) return;
    trackGoogleEcommerceEvent("purchase", {
      pageType: "thank_you",
      transactionId: confirmation.orderRef,
      value: confirmation.total,
      affiliation: "",
      tax: 0,
      shipping: confirmation.deliveryCharge,
      coupon: "",
      customer: { name: confirmation.customerName, phone: confirmation.phone, address: confirmation.address },
      items: confirmation.items.map((item) => toGoogleAnalyticsItem({ id: item.name, name: item.name, variant: item.label, price: item.unitPrice, quantity: item.quantity })),
    });
  }, [confirmation]);

  if (!confirmation) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fbf3e4] px-4 py-10 sm:px-6" aria-labelledby="khejur-thank-you-title">
        <section className="w-full max-w-xl rounded-3xl border border-[#ead8b4] bg-[#fffaf2] p-6 text-center shadow-[0_24px_70px_rgba(50,35,16,0.10)] sm:p-10">
          <h1 id="khejur-thank-you-title" className="text-3xl font-bold text-[#0f3b4f]">অর্ডারের তথ্য পাওয়া যায়নি</h1>
          <p className="mt-4 leading-7 text-[#654b2f]">কোনো সাম্প্রতিক অর্ডারের তথ্য পাওয়া যায়নি।</p>
          <Link href={KHEJUR_PAGE_PATH} className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full bg-[#0f3b4f] px-6 py-3 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f3b4f]">
            খেজুরের গুড় পেজে ফিরে যান
          </Link>
          <div className="mt-8 border-t border-[#ead8b4] pt-6">
            <p className="mb-4 text-sm font-semibold text-[#654b2f]">সহায়তা দরকার?</p>
            <SupportActions />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#fbf3e4] px-4 py-8 sm:px-6 sm:py-12" aria-labelledby="khejur-thank-you-title">
      <section className="w-full max-w-xl rounded-[28px] border border-[#ead8b4] bg-[#fffaf2] p-5 shadow-[0_24px_70px_rgba(50,35,16,0.10)] sm:p-10">
        <div className="text-center">
          <CircleCheck className="mx-auto size-14 text-[#3f8f6b]" strokeWidth={1.75} aria-hidden="true" />
          <h1 id="khejur-thank-you-title" className="mt-4 text-3xl font-bold text-[#0f3b4f]">আপনার অর্ডারটি গ্রহণ করা হয়েছে</h1>
          <p className="mt-3 font-semibold text-[#c2451d]">অর্ডার নম্বর: {confirmation.orderRef}</p>
          <p className="mt-3 leading-7 text-[#654b2f]">অর্ডার নিশ্চিত করতে আমাদের টিম আপনাকে ফোন করবে।</p>
        </div>

        <dl className="mt-8 overflow-hidden rounded-2xl border border-[#ead8b4] bg-white px-5 text-[#0f3b4f]">
          {confirmation.items.map((item) => (
            <div key={`${item.name}-${item.label}`} className="flex items-center justify-between gap-4 border-b border-[#f1e6cf] py-4">
              <dt className="text-[#654b2f]">{item.name} · {item.label} × {toBanglaDigits(item.quantity)}</dt>
              <dd className="font-semibold">{formatTaka(item.unitPrice * item.quantity)}</dd>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 border-b border-[#f1e6cf] py-4">
            <dt className="text-[#654b2f]">ডেলিভারি</dt>
            <dd className="font-semibold">{confirmation.deliveryCharge ? formatTaka(confirmation.deliveryCharge) : <span className="rounded-full bg-[#3f8f6b]/10 px-3 py-0.5 font-bold text-[#3f8f6b]">ফ্রি</span>}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-4 text-lg">
            <dt className="font-bold">মোট</dt>
            <dd className="font-bold text-[#c2451d]">{formatTaka(confirmation.total)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-center text-sm font-semibold text-[#654b2f]">পেমেন্ট: ক্যাশ অন ডেলিভারি</p>

        <div className="mt-8 border-t border-[#ead8b4] pt-6 text-center">
          <p className="mb-4 text-sm font-semibold text-[#654b2f]">অর্ডার নিয়ে সহায়তা দরকার?</p>
          <SupportActions />
        </div>
      </section>
    </main>
  );
}
