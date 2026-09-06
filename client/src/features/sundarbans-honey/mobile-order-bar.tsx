import { MessageCircle, Phone } from "lucide-react";
import { useEffect, useState } from "react";

import {
  HONEY_CAMPAIGN_PHONE_HREF,
  HONEY_CAMPAIGN_WHATSAPP_HREF,
} from "./content";
import { trackHoneyCampaignEvent } from "./tracking";

export function MobileOrderBar({ onOrderClick }: { onOrderClick: (placement: string) => void }) {
  const [checkoutVisible, setCheckoutVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById("honey-checkout");
    if (!target || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      setCheckoutVisible(entry.isIntersecting);
    }, { threshold: 0.12 });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="honey-order-bar"
      data-hidden={checkoutVisible ? "true" : undefined}
      role="group"
      aria-label="দ্রুত অর্ডার"
    >
      <button
        type="button"
        aria-label="অর্ডার করুন"
        onClick={() => onOrderClick("sticky_bar")}
        className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-[#f5c456] px-4 text-lg font-bold text-[#19382d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fffaf0]"
      >
        অর্ডার করুন
      </button>
      <a
        href={HONEY_CAMPAIGN_WHATSAPP_HREF}
        aria-label="WhatsApp-এ অর্ডার করুন"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackHoneyCampaignEvent("whatsapp_click", { placement: "sticky_bar" })}
        className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl bg-[#187d48] px-3 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fffaf0]"
      >
        <MessageCircle className="size-5" aria-hidden="true" />
      </a>
      <a
        href={HONEY_CAMPAIGN_PHONE_HREF}
        aria-label="ফোনে অর্ডার করুন"
        onClick={() => trackHoneyCampaignEvent("phone_click", { placement: "sticky_bar" })}
        className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl border border-[#fffaf0]/40 px-3 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fffaf0]"
      >
        <Phone className="size-5" aria-hidden="true" />
      </a>
    </div>
  );
}
